import { ErrorRequestHandler } from 'express';
import AppError from '../types/app-error';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError = err instanceof AppError ? err : new AppError('Internal server error');
  const statusCode = appError.statusCode || 500;

  const payload = {
    status: 'error',
    message: appError.message,
    ...(appError.isOperational ? null : { details: 'Unexpected error occurred' }),
  };

  res.status(statusCode).json(payload);
};

export default errorHandler;
