import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  let statusCode = err.statusCode;
  if (!statusCode) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
      statusCode = 409;
    } else if (msg.includes('unauthorized') || msg.includes('invalid credentials') || msg.includes('jwt')) {
      statusCode = 401;
    } else if (msg.includes('forbidden') || msg.includes('permission')) {
      statusCode = 403;
    } else if (msg.includes('not found')) {
      statusCode = 404;
    } else if (msg.includes('rate limit') || msg.includes('validation') || msg.includes('invalid') || msg.includes('password')) {
      statusCode = 400;
    } else {
      statusCode = 500;
    }
  }
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
