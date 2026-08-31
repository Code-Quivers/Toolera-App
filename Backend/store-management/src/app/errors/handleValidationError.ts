import { Response } from 'express';

interface ValidationError {
  message: string;
  path?: string;
}

export function handleValidationError(err: { errors?: ValidationError[] }, res: Response): void {
  const errors = err.errors?.map((e) => ({ field: e.path, message: e.message })) ?? [];
  res.status(400).json({
    success: false,
    message: 'Validation error',
    errors,
  });
}
