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
    try {
      const storedToken = await RedisClient.getAccessToken(decoded.id);
      if (storedToken === null && config.nodeEnv === 'production') {
        return next(new ApiError(401, 'Session expired. Please log in again.'));
      }
    } catch {
      // Redis down or unreachable in dev — proceed with valid verified JWT
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
