import helmet from "helmet";
import { Request, Response, NextFunction } from "express";

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  _res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = _res;
    const userAgent = req.get("user-agent") || "-";
    const userId = (req as any).user?.userId || "-";

    const logLine =
      `[${new Date().toISOString()}] ` +
      `${method} ${originalUrl} ` +
      `${statusCode} ${duration}ms ` +
      `ip=${ip} ` +
      `uid=${userId} ` +
      `ua="${userAgent}"`;

    if (statusCode >= 500) {
      console.error(logLine);
    } else if (statusCode >= 400) {
      console.warn(logLine);
    }
  });

  next();
};
