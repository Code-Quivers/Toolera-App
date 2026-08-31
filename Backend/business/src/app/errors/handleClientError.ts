import { Response } from 'express';
import ApiError from './ApiError.js';

export function handleClientError(err: ApiError, res: Response): void {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
}
