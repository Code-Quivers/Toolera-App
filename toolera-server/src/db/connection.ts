/**
 * toolera-server — CNPG database connection
 *
 * Env vars:
 *   DATABASE_WRITE_URL  → CNPG primary  (writes / transactions)
 *   DATABASE_READ_URL   → CNPG standby  (reads)
 *   DATABASE_URL        → fallback for local / single-node dev
 *
 * Exported:
 *   db            ← replica DrizzleDB  (SELECT)
 *   db.$primary   ← primary DrizzleDB  (INSERT / UPDATE / DELETE / tx)
 */

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { errorLogger, infoLogger } from "../shared/logger";

type Schema = typeof schema;
type DrizzleDB = NodePgDatabase<Schema>;

const writeUrl = process.env.DATABASE_WRITE_URL ?? process.env.DATABASE_URL;
const readUrl = process.env.DATABASE_READ_URL ?? process.env.DATABASE_WRITE_URL ?? process.env.DATABASE_URL;

if (!writeUrl) {
  throw new Error("[toolera-db] Missing DATABASE_WRITE_URL (or DATABASE_URL). Set at least one in your .env file.");
}

export const primaryPool = new Pool({
  connectionString: writeUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  application_name: "toolera-server-primary",
});

const replicaPool =
  readUrl && readUrl !== writeUrl
    ? new Pool({
        connectionString: readUrl,
        max: 20,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        application_name: "toolera-server-replica",
      })
    : primaryPool;

const primaryDb: DrizzleDB = drizzle(primaryPool, { schema });
const replicaDb: DrizzleDB = drizzle(replicaPool, { schema });

export const db = Object.assign(replicaDb, { $primary: primaryDb });

export async function connectDb(): Promise<void> {
  try {
    await primaryPool.query("SELECT 1");
    infoLogger.info(`[toolera-db] Primary connected → ${writeUrl}`);

    if (replicaPool !== primaryPool) {
      await replicaPool.query("SELECT 1");
      infoLogger.info(`[toolera-db] Replica connected → ${readUrl}`);
    }
  } catch (err) {
    errorLogger.error("[toolera-db] Failed to connect to PostgreSQL:", err);
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  const unique = new Set([primaryPool, replicaPool]);
  await Promise.allSettled([...unique].map((p) => p.end()));
  infoLogger.info("[toolera-db] All pools closed.");
}
