import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import { productsRouter } from './modules/products/products.route.js';
import { categoriesRouter } from './modules/categories/categories.route.js';
import { ordersRouter } from './modules/orders/orders.route.js';
import { reviewsRouter } from './modules/reviews/reviews.route.js';
import { couponsRouter } from './modules/coupons/coupons.route.js';
import { courierRouter } from './modules/courier/courier.route.js';
import paymentRouter from './modules/payment/payment.route.js';
import { uploadRouter } from './modules/upload/upload.route.js';
import { authRouter } from './modules/auth/auth.route.js';
import { expensesRouter } from './modules/expenses/expenses.route.js';
import { stockLogsRouter } from './modules/stock-logs/stock-logs.route.js';
import { customersRouter } from './modules/customers/customers.route.js';
import { attributesRouter } from './modules/attributes/attributes.route.js';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.route.js';
import { storesRouter } from './modules/stores/stores.route.js';

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Business Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/stores', storesRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/coupons', couponsRouter);
app.use('/api/v1/courier', courierRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/attributes', attributesRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/stock-logs', stockLogsRouter);

app.use(errorHandler);

export default app;
