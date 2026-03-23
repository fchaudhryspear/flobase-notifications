import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import flobaseRoutes from './routes/flobaseRoutes';
import * as notificationRoutes from './routes/notificationRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount the original 16 secure endpoints
app.use('/api/v1', flobaseRoutes);

// Mount Simon's new notification endpoints safely
const notifRouter = (notificationRoutes as any).default || (notificationRoutes as any).router || notificationRoutes;
app.use('/api/v1', notifRouter);

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Secure Flobase Server active on http://127.0.0.1:${PORT} with Notifications`);
});
