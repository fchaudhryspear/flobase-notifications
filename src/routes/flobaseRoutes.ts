import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

const users = [
  {
    id: 'usr_1',
    email: 'faisal@flobase.ai',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin'
  }
];

// --- PUBLIC AUTH ENDPOINTS ---
router.post('/auth/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return res.status(200).json({ token, expires_in: 3600 });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/auth/register', (req, res) => res.status(201).json({ user_id: 'usr_new', status: 'pending' })); 
router.post('/auth/reset-password', (req, res) => res.status(200).json({ message: 'Reset link sent' }));

// --- PROTECTED ENDPOINTS (Requires Bearer Token) ---
router.post('/auth/logout', protect, (req, res) => res.status(200).json({ message: 'Logged out' }));
router.post('/auth/refresh', protect, (req, res) => res.status(200).json({ token: 'new_token', expires_in: 3600 }));
router.get('/users/me', protect, (req, res) => res.status(200).json({ id: (req as any).user.id, email: (req as any).user.email }));
router.put('/users/me', protect, (req, res) => res.status(200).json({ message: 'Profile updated' }));
router.get('/users', protect, (req, res) => res.status(200).json({ users: [] }));
router.get('/users/:id', protect, (req, res) => res.status(200).json({ id: req.params.id, email: 'user@example.com' }));
router.get('/roles', protect, (req, res) => res.status(200).json({ roles: [] }));
router.post('/roles/assign', protect, (req, res) => res.status(200).json({ message: 'Role assigned' }));
router.delete('/roles/revoke', protect, (req, res) => res.status(200).json({ message: 'Role revoked' }));
router.get('/sessions', protect, (req, res) => res.status(200).json({ sessions: [] }));
router.delete('/sessions/:id', protect, (req, res) => res.status(200).json({ message: 'Session terminated' }));
router.get('/audit/logs', protect, (req, res) => res.status(200).json({ logs: [] }));
router.post('/audit/export', protect, (req, res) => res.status(200).json({ download_url: 'https://storage.flobase.ai/export.csv' }));

export default router;
