import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware.js';
import { productsRouter } from './routes/products.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { couponsRouter } from './routes/coupons.routes.js';
import { courierRouter } from './routes/courier.routes.js';
import paymentRouter from './routes/payment.routes.js';
import { uploadRouter } from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Business Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/coupons', couponsRouter);
app.use('/api/v1/courier', courierRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/upload', uploadRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Business Service] running on port ${PORT}`);
  console.log(`[Health] http://localhost:${PORT}/health`);
});
