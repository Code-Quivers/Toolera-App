import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5002,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || '',
    replicaUrls: [
      process.env.DATABASE_URL_REPLICA_1,
      process.env.DATABASE_URL_REPLICA_2,
    ].filter(Boolean) as string[],
  },
  // Object storage — MinIO (dev) or AWS S3 (prod). Same code, only env vars change.
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || '',        // MinIO: http://localhost:9000 | S3: leave empty
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    bucket: process.env.STORAGE_BUCKET || 'toolera-media',
    region: process.env.STORAGE_REGION || 'ap-southeast-1',
    publicUrl: process.env.STORAGE_PUBLIC_URL || '',     // base URL for serving files
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true', // true for MinIO
  },

  // Message brokers
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'business-service',
  },

  // Redis — pub/sub and shared token helpers
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    expiresIn: Number(process.env.REDIS_EXPIRES_IN) || 86400,
  },
};
