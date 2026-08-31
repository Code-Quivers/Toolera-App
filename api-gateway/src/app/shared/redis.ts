import { SetOptions, createClient } from 'redis';
import { config } from '../config/index.js';
import { errorLogger, infoLogger } from '../utils/logger.js';

const redisClient = createClient({ url: config.redis.url });
const redisPubClient = createClient({ url: config.redis.url });
const redisSubClient = createClient({ url: config.redis.url });

type RedisEventEmitter = { on(event: string, listener: (...args: any[]) => void): void };

const setupClient = (client: RedisEventEmitter, name: string) => {
  client.on('error', (error: Error) => {
    errorLogger.error(`Redis ${name} error: ${error.message}`);
  });

  client.on('connect', () => {
    infoLogger.info(`Redis ${name} connected on URL - ${config.redis.url}`);
  });
};

setupClient(redisClient, 'client');
setupClient(redisPubClient, 'pubClient');
setupClient(redisSubClient, 'subClient');

const connect = async (): Promise<void> => {
  try {
    await redisClient.connect();
    await redisPubClient.connect();
    await redisSubClient.connect();
  } catch (error) {
    errorLogger.error('Failed to connect to Redis', error);
    process.exit(1);
  }
};

const disconnect = async (): Promise<void> => {
  try {
    await redisClient.quit();
    await redisPubClient.quit();
    await redisSubClient.quit();
  } catch (error) {
    errorLogger.error('Error disconnecting Redis clients', error);
  }
};

const set = async (key: string, value: string, options?: SetOptions): Promise<string> => {
  return (await redisClient.set(key, value, options)) as string;
};

const get = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

const del = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

const expire = async (key: string, seconds: number): Promise<void> => {
  await redisClient.expire(key, seconds);
};

// Store the access token for a user — set by the auth service via shared Redis
const setAccessToken = async (userId: string, token: string): Promise<void> => {
  const key = `access-token:${userId}`;
  await redisClient.set(key, token, { EX: Number(config.redis.expiresIn) });
};

const getAccessToken = async (userId: string): Promise<string | null> => {
  return await redisClient.get(`access-token:${userId}`);
};

const delAccessToken = async (userId: string): Promise<void> => {
  await redisClient.del(`access-token:${userId}`);
};

// Session-based token lookup (alternative key pattern)
const getTokenBySessionId = async (sessionId: string): Promise<string | null> => {
  return await redisClient.get(`session:${sessionId}`);
};

export const RedisClient = {
  connect,
  disconnect,
  set,
  get,
  del,
  expire,
  setAccessToken,
  getAccessToken,
  delAccessToken,
  getTokenBySessionId,
  publish: redisPubClient.publish.bind(redisPubClient),
  subscribe: redisSubClient.subscribe.bind(redisSubClient),
};
