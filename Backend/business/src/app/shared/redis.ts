import Redis from 'ioredis';
import { config } from '../config/index.js';
import { errorLogger, infoLogger } from '../utils/logger.js';

const makeClient = (name: string) =>
  new Redis(config.redis.url, { lazyConnect: false, enableReadyCheck: true, maxRetriesPerRequest: 3 })
    .on('connect', () => infoLogger.info(`Redis ${name} connected to ${config.redis.url}`))
    .on('error', (err: Error) => errorLogger.error(`Redis ${name} error:`, err));

const redisClient = makeClient('client');
const redisPubClient = makeClient('pub');
const redisSubClient = makeClient('sub');

const set = async (key: string, value: string, exSeconds?: number): Promise<void> => {
  try {
    if (exSeconds) {
      await redisClient.set(key, value, 'EX', exSeconds);
    } else {
      await redisClient.set(key, value);
    }
    infoLogger.info(`Key set: ${key}`);
  } catch (error) {
    errorLogger.error(`Failed to set key: ${key}`, error);
  }
};

const get = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    errorLogger.error(`Failed to get key: ${key}`, error);
    return null;
  }
};

const del = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    infoLogger.info(`Key deleted: ${key}`);
  } catch (error) {
    errorLogger.error(`Failed to delete key: ${key}`, error);
  }
};

const setAccessToken = async (userId: string, token: string): Promise<void> => {
  await set(`access-token:${userId}`, token, Number(config.redis.expiresIn));
};

const getAccessToken = async (userId: string): Promise<string | null> => {
  return await get(`access-token:${userId}`);
};

const delAccessToken = async (userId: string): Promise<void> => {
  await del(`access-token:${userId}`);
};

const connect = async (): Promise<void> => {
  infoLogger.info('All Redis clients ready (ioredis auto-connects).');
};

const disconnect = async (): Promise<void> => {
  try {
    await Promise.all([redisClient.quit(), redisPubClient.quit(), redisSubClient.quit()]);
    infoLogger.info('All Redis clients disconnected.');
  } catch (error) {
    errorLogger.error('Failed to disconnect Redis clients.', error);
  }
};

export const RedisClient = {
  connect,
  disconnect,
  set,
  get,
  del,
  setAccessToken,
  getAccessToken,
  delAccessToken,
  publish: (channel: string, message: string) => redisPubClient.publish(channel, message),
  subscribe: (channel: string) => redisSubClient.subscribe(channel),
  subClient: redisSubClient,
};
