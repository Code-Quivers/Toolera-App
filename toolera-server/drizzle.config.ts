import "dotenv/config";
import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_WRITE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_WRITE_URL (or DATABASE_URL) for Drizzle migrations.");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ["toolera"],
  verbose: true,
  strict: true,
} satisfies Config;
