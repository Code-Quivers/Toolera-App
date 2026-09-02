import express from 'express';
import cors from 'cors';
import { config } from './config';
import { requestLogger } from './middlewares/requestLogger.middleware';
import ApiError from './errors/ApiError';

// Module routes
import authRoutes from './modules/auth/auth.route';
import storeRoutes from './modules/store/store.route';
import cmsRoutes from './modules/cms/cms.route';
import settingsRoutes from './modules/settings/settings.route';
import subscriptionRoutes from './modules/subscription/subscription.route';
import adminFinanceRoutes from './modules/admin-finance/adminFinance.route';
import analyticsRoutes from './modules/analytics/analytics.route';
import auditRoutes from './modules/audit/audit.route';
import blogCategoryRoutes from './modules/blogCategory/blogCategory.route';
import productRoutes from './modules/product/product.route';
import orderRoutes from './modules/order/order.route';
import reviewRoutes from './modules/review/review.route';
import couponRoutes from './modules/coupon/coupon.route';
import paymentRoutes from './modules/payment/payment.route';
import courierRoutes from './modules/courier/courier.route';
import uploadRoutes from './modules/upload/upload.route';
import customerRoutes from './modules/customers/customers.route';
import attributeRoutes from './modules/attributes/attributes.route';
import stockLogsRoutes from './modules/stock-logs/stockLogs.route';
import expensesRoutes from './modules/expenses/expenses.route';

const app = express();

// Global middlewares
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'API Gateway',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      storeManagement: config.services.storeManagement,
      business: config.services.business,
    },
    redis: config.redis.url.replace(/:\/\/.*@/, '://**@'), // hide credentials
  });
});

// ── Store Management Service routes ──────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/admin-finance', adminFinanceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/blog-categories', blogCategoryRoutes);

// ── Business Service routes ───────────────────────────────────────────
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/courier', courierRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/attributes', attributeRoutes);
app.use('/api/v1/stock-logs', stockLogsRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 404
app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
