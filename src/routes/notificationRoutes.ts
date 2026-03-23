import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// --- Types & Interfaces ---

interface Notification {
  id: string;
  user_id: string;
  type: 'transactional' | 'marketing' | 'system';
  channel: 'in_app' | 'email' | 'push';
  status: 'unread' | 'read' | 'dismissed' | 'suppressed';
  title: string;
  body: string;
  metadata: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  read_at: string | null;
  idempotency_key?: string;
}

interface UserPreference {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  categories: Record<string, boolean>;
  updated_at: string;
}

interface CreateNotificationBody {
  user_id: string;
  type: 'transactional' | 'marketing' | 'system';
  channel: 'in_app' | 'email' | 'push';
  title: string;
  body: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  idempotency_key?: string;
}

interface UpdateNotificationBody {
  status?: 'read' | 'unread' | 'dismissed';
  dismissed?: boolean;
}

interface UpdatePreferencesBody {
  email_enabled: boolean;
  push_enabled: boolean;
  categories: Record<string, boolean>;
}

// --- Mock In-Memory Database ---

const notificationsStore: Notification[] = [];
const preferencesStore: UserPreference[] = [];

// --- Helper Functions ---

const findNotificationById = (id: string): Notification | undefined => {
  return notificationsStore.find((n) => n.id === id);
};

const findPreferencesByUserId = (user_id: string): UserPreference | undefined => {
  return preferencesStore.find((p) => p.user_id === user_id);
};

const createPreferencesIfMissing = (user_id: string): UserPreference => {
  const existing = findPreferencesByUserId(user_id);
  if (existing) return existing;

  const newPreference: UserPreference = {
    user_id,
    email_enabled: true,
    push_enabled: true,
    categories: { billing: true, marketing: true, system: true },
    updated_at: new Date().toISOString(),
  };
  preferencesStore.push(newPreference);
  return newPreference;
};

const checkChannelPreference = (user_id: string, channel: string): boolean => {
  const prefs = createPreferencesIfMissing(user_id);
  if (channel === 'email') return prefs.email_enabled;
  if (channel === 'push') return prefs.push_enabled;
  return true; // in_app always allowed
};

// --- Router Setup ---

const router = express.Router();

// --- Middleware Mocks ---

// Mock Auth Middleware: Extracts user_id from header for user-specific endpoints
const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  const userIdHeader = req.headers['x-user-id'] as string;
  if (!userIdHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header' });
  }
  (req as any).authUserId = userIdHeader;
  next();
};

// --- Endpoints ---

// 4.1.1 Create Notification (POST /notifications)
// Access: Service Account / Internal (Skipping auth for this endpoint per PRD)
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const body: CreateNotificationBody = req.body;
    const { user_id, channel, idempotency_key } = body;

    // Validation
    if (!user_id || !channel || !body.title || !body.body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Idempotency Check
    if (idempotency_key) {
      const existing = notificationsStore.find((n) => n.idempotency_key === idempotency_key);
      if (existing) {
        return res.status(201).json({ notification_id: existing.id, idempotent: true });
      }
    }

    // Preference Checking
    const allowed = checkChannelPreference(user_id, channel);
    const status = allowed ? 'unread' : 'suppressed';

    const newNotification: Notification = {
      id: uuidv4(),
      user_id,
      type: body.type,
      channel,
      status,
      title: body.title,
      body: body.body,
      metadata: body.metadata || {},
      priority: body.priority,
      created_at: new Date().toISOString(),
      read_at: null,
      idempotency_key: idempotency_key || undefined,
    };

    notificationsStore.push(newNotification);

    // Log suppression if applicable
    if (status === 'suppressed') {
      console.log(`Notification ${newNotification.id} suppressed due to user preferences.`);
    }

    res.status(201).json({ notification_id: newNotification.id, status: newNotification.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4.1.2 Get User Notifications (GET /users/:user_id/notifications)
// Access: User Auth Token
router.get('/users/:user_id/notifications', mockAuth, async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const authUserId = (req as any).authUserId;

    // Authorization Check (IDOR prevention)
    if (user_id !== authUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other users notifications' });
    }

    const { limit = 20, offset = 0, status, channel } = req.query;

    let filtered = notificationsStore.filter((n) => n.user_id === user_id);

    if (status) {
      filtered = filtered.filter((n) => n.status === status);
    }
    if (channel) {
      filtered = filtered.filter((n) => n.channel === channel);
    }

    const total = filtered.length;
    const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

    res.status(200).json({
      data: paginated,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4.1.3 Update Notification Status (PATCH /notifications/:id)
// Access: User Auth Token (Owner check required)
router.patch('/notifications/:id', mockAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authUserId = (req as any).authUserId;
    const body: UpdateNotificationBody = req.body;

    const notification = findNotificationById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Ownership Check
    if (notification.user_id !== authUserId) {
      return res.status(403).json({ error: 'Forbidden: Not owner of this notification' });
    }

    if (body.status) {
      notification.status = body.status;
      if (body.status === 'read') {
        notification.read_at = new Date().toISOString();
      }
    }

    if (body.dismissed === true) {
      notification.status = 'dismissed';
    }

    res.status(200).json({ message: 'Notification updated', data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4.1.4 Manage Preferences (PUT /users/:user_id/preferences)
// Access: User Auth Token
router.put('/users/:user_id/preferences', mockAuth, async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const authUserId = (req as any).authUserId;
    const body: UpdatePreferencesBody = req.body;

    // Authorization Check
    if (user_id !== authUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot modify other users preferences' });
    }

    // Validation
    if (typeof body.email_enabled !== 'boolean' || typeof body.push_enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid preference payload' });
    }

    let preference = findPreferencesByUserId(user_id);

    if (!preference) {
      preference = {
        user_id,
        email_enabled: body.email_enabled,
        push_enabled: body.push_enabled,
        categories: body.categories || {},
        updated_at: new Date().toISOString(),
      };
      preferencesStore.push(preference);
    } else {
      preference.email_enabled = body.email_enabled;
      preference.push_enabled = body.push_enabled;
      preference.categories = body.categories || preference.categories;
      preference.updated_at = new Date().toISOString();
    }

    res.status(200).json({ message: 'Preferences updated', data: preference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
