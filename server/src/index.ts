import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { productsRouter } from './routes/products.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { cmsRouter } from './routes/cms.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { couponsRouter } from './routes/coupons.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { courierRouter } from './routes/courier.routes.js';
import paymentRouter from './routes/payment.routes.js';
import { smsRouter } from './routes/sms.routes.js';
import { backupRouter } from './routes/backup.routes.js';
import { storeRouter } from './routes/store.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';

import path from 'path';
import { uploadRouter } from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Global Middlewares
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Media Uploads Directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Raifa\'s Mart Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/cms', cmsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/coupons', couponsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/courier', courierRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/sms', smsRouter);
app.use('/api/v1/backup', backupRouter);
app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

// Global Error Handler
app.use(errorHandler);

// Start Listener
app.listen(PORT, () => {
  console.log(`[Backend API] running on port ${PORT}`);
  console.log(`[Health check] available at http://localhost:${PORT}/health`);
});