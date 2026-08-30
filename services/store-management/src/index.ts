import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { storeRouter } from './routes/store.routes.js';
import { cmsRouter } from './routes/cms.routes.js';
import { smsRouter } from './routes/sms.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';
import { backupRouter } from './routes/backup.routes.js';
import { internalRouter } from './routes/internal.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Store Management Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/cms', cmsRouter);
app.use('/api/v1/sms', smsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/backup', backupRouter);
app.use('/api/v1/internal', internalRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Store Management Service] running on port ${PORT}`);
  console.log(`[Health] http://localhost:${PORT}/health`);
});
