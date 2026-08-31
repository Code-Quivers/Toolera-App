import { Response } from 'express';
import { ZodError } from 'zod';

export function handleZodError(err: ZodError, res: Response): void {
  const errors = err.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  res.status(400).json({
    success: false,
    message: 'Validation error',
    errors,
  });
}
