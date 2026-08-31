import Redis from 'ioredis';
import { config } from '../config/index.js';
import { errorLogger, infoLogger } from '../utils/logger.js';

const makeClient = (name: string) =>
  new Redis(config.redis.url, { lazyConnect: false, enableReadyCheck: true, maxRetriesPerRequest: 3 })
    .on('connect', () => infoLogger.info(`Redis ${name} connected on URL - ${config.redis.url}`))
    .on('error', (err: Error) => errorLogger.error(`Redis ${name} error: ${err.message}`));

const redisClient = makeClient('client');
const redisPubClient = makeClient('pubClient');
const redisSubClient = makeClient('subClient');

const connect = async (): Promise<void> => {
  infoLogger.info('All Redis clients ready (ioredis auto-connects).');
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

const set = async (key: string, value: string, exSeconds?: number): Promise<string> => {
  if (exSeconds) {
    return (await redisClient.set(key, value, 'EX', exSeconds)) ?? 'OK';
  }
  return (await redisClient.set(key, value)) ?? 'OK';
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

const setAccessToken = async (userId: string, token: string): Promise<void> => {
  await set(`access-token:${userId}`, token, Number(config.redis.expiresIn));
};

const getAccessToken = async (userId: string): Promise<string | null> => {
  return await redisClient.get(`access-token:${userId}`);
};

const delAccessToken = async (userId: string): Promise<void> => {
  await redisClient.del(`access-token:${userId}`);
};

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
  publish: (channel: string, message: string) => redisPubClient.publish(channel, message),
  subscribe: (channel: string) => redisSubClient.subscribe(channel),
  subClient: redisSubClient,
};
