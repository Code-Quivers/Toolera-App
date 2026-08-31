import { Request, Response, NextFunction } from 'express';
import ApiError from './ApiError';

const handleClientError = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default handleClientError;
