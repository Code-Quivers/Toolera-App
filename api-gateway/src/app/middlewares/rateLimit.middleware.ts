import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config';

const isLocalhost = (req: Request) =>
  config.nodeEnv === 'development' &&
  ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip ?? '');

export const globalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalhost,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});
