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

    // Validate that this token is still active in Redis.
    // The auth service (store-management) writes the token to Redis on login
    // and deletes it on logout — giving real-time session invalidation.
    const storedToken = await RedisClient.getAccessToken(decoded.id);
    if (!storedToken) {
      return next(new ApiError(401, 'Session not found. Please log in again.'));
    }
    if (storedToken !== token) {
      return next(new ApiError(401, 'Session invalid. Please log in again.'));
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
      const storedToken = await RedisClient.getAccessToken(decoded.id);
      if (storedToken && storedToken === token) {
        req.user = decoded;
      }
    }
  } catch {}
  next();
}
