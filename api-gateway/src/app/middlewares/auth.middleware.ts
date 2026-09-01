import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import ApiError from '../errors/ApiError.js';
import { RedisClient } from '../shared/redis.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name?: string };
}

export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as AuthRequest['user'] & { id: string };

    // Check Redis only to detect explicit logouts (deleted key = logged out).
    // We do NOT require the stored token to match — that enforces single-session
    // and breaks when the user has multiple tabs or devices.
    const storedToken = await RedisClient.getAccessToken(decoded.id);
    if (storedToken === null) {
      // Key missing means the user explicitly logged out — reject.
      return next(new ApiError(401, 'Session expired. Please log in again.'));
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired. Please log in again.'));
    }
    next(new ApiError(401, 'Invalid token'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as AuthRequest['user'] & {
        id: string;
      };
      // Accept any valid JWT — only reject if explicitly logged out (null key in Redis)
      const storedToken = await RedisClient.getAccessToken(decoded.id);
      if (storedToken !== null) {
        req.user = decoded;
      }
    }
  } catch {}
  next();
}
