import { Request, Response, NextFunction } from 'express';

const handleValidationError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = err.errors?.map((e: any) => ({
    field: e.path?.join('.'),
    message: e.message,
  }));

  res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

export default handleValidationError;
