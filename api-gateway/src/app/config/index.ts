import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',

  // Downstream services
  services: {
    storeManagement: process.env.STORE_MANAGEMENT_URL || 'http://localhost:5001',
    business: process.env.BUSINESS_SERVICE_URL || 'http://localhost:5002',
  },

  // Redis — used for session token storage and pub/sub (not response caching)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    expiresIn: Number(process.env.REDIS_EXPIRES_IN) || 86400, // seconds (default 24 h)
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
};
