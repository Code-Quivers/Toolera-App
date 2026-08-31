import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './modules/auth/auth.route.js';
import { storeRouter } from './modules/store/store.route.js';
import { cmsRouter } from './modules/cms/cms.route.js';
import { smsRouter } from './modules/sms/sms.route.js';
import { settingsRouter } from './modules/settings/settings.route.js';
import { subscriptionRouter } from './modules/subscription/subscription.route.js';
import { backupRouter } from './modules/backup/backup.route.js';
import { internalRouter } from './modules/internal/internal.route.js';
import { uploadRouter } from './modules/upload/upload.route.js';

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
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
app.use('/api/v1/upload', uploadRouter);

app.use(errorHandler);

export default app;
