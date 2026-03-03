import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import AppError from '../types/app-error';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[Error]', err);

  // Known operational error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }

  // Prisma — unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const fields = (err.meta?.target as string[])?.join(', ') ?? 'field';
    return res.status(409).json({ status: 'error', message: `${fields} already exists` });
  }

  // Prisma — record not found
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ status: 'error', message: err.meta?.cause as string ?? 'Record not found' });
  }

  // Prisma — other known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ status: 'error', message: err.message });
  }

  // Unexpected error — show real message in development
  const message =
    process.env.NODE_ENV !== 'production' && err instanceof Error
      ? err.message
      : 'Internal server error';

  return res.status(500).json({ status: 'error', message });
};

export default errorHandler;
