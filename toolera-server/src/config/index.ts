import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = z.object({
  NODE_ENV: z.string(),
  PORT: z.string(),

  DATABASE_WRITE_URL: z.string().optional(),
  DATABASE_READ_URL: z.string().optional(),
  DATABASE_URL: z.string().optional(),

  CORE_SERVICE_URL: z.string(),

  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CORS_ORIGINS: z.string().optional(),
});

const envVars = envVarsSchema.parse(process.env);

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  coreServiceUrl: envVars.CORE_SERVICE_URL,

  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  corsOrigins: (envVars.CORS_ORIGINS ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean),
};
