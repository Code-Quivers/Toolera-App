import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

function buildReplicaUrls(): string[] {
  return [
    process.env.DATABASE_URL_REPLICA_1,
    process.env.DATABASE_URL_REPLICA_2,
  ].filter((u): u is string => Boolean(u));
}

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  const replicas = buildReplicaUrls();
  if (replicas.length === 0) return base;

  return base.$extends(readReplicas({ url: replicas }));
}

export const prisma = createClient();
