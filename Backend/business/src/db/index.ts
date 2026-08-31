import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const writePool = postgres(process.env.DATABASE_URL!, { max: 10 });
export const db = drizzle(writePool, { schema });

const replicaUrls = [
  process.env.DATABASE_URL_REPLICA_1,
  process.env.DATABASE_URL_REPLICA_2,
].filter((u): u is string => Boolean(u));

const readPools = replicaUrls.map(url => postgres(url, { max: 5 }));

let rrIndex = 0;
export function rdb() {
  if (readPools.length === 0) return db;
  const pool = readPools[rrIndex++ % readPools.length];
  return drizzle(pool, { schema });
}
