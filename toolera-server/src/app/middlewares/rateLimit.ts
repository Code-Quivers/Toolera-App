import rateLimit from "express-rate-limit";
import config from "../../config";

const getClientIp = (req: any): string => {
  return (req.ip as string) || (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 6003,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
  keyGenerator: (req) => getClientIp(req),
  skip: (_req) => config.env === "development",
});

export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 6003,
    message: "Too many requests. Please try again in 1 minute.",
  },
  skip: (_req) => config.env === "development",
});
