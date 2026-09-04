import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
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
import { themeRoutes, adminThemeRoutes } from './modules/theme/theme.route.js';

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BUSINESS_URL = process.env.BUSINESS_SERVICE_URL || 'http://localhost:5002';

const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5000',
      ];
      if (
        isDev ||
        allowed.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-store-id',
      'x-internal-key',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  })
);

// Normalize accidental duplicate /api/v1/api/v1 prefix
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/v1/api/v1')) {
    req.url = req.url.replace('/api/v1/api/v1', '/api/v1');
  }
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'API Gateway (Store Management)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Business-service proxy is defined inline below (must come before body
// parsers so multipart/json bodies are forwarded untouched).

const BUSINESS_PREFIXES = [
  '/api/v1/products',
  '/api/v1/categories',
  '/api/v1/orders',
  '/api/v1/reviews',
  '/api/v1/customers',
  '/api/v1/coupons',
  '/api/v1/courier',
  '/api/v1/payment',
  '/api/v1/attributes',
  '/api/v1/inventory',
  '/api/v1/abandoned',
  '/api/v1/pixels',
  '/api/v1/expenses',
  '/api/v1/stock-logs',
];

// Mount at root with pathFilter so the full path (including prefix) is
// forwarded intact to the business service — app.use(prefix, proxy) would
// strip the prefix from req.url before proxying.
app.use(createProxyMiddleware({
  target: BUSINESS_URL,
  changeOrigin: true,
  pathFilter: BUSINESS_PREFIXES,
  on: {
    error: (err, _req, res: any) => {
      res.status(502).json({ success: false, message: 'Business service unavailable.' });
    },
  },
}));

// ── Own routes (body parsers apply here) ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/cms', cmsRouter);
app.use('/api/v1/sms', smsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/backup', backupRouter);
app.use('/api/v1/internal', internalRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/themes', themeRoutes);
app.use('/api/v1/admin/themes', adminThemeRoutes);

app.use(errorHandler);

export default app;
