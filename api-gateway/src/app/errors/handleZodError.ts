import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const handleZodError = (
  err: ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = err.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  res.status(400).json({
    success: false,
    message: 'Validation error',
    errors,
  });
};

export default handleZodError;
