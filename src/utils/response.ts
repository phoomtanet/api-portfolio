import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ status: 'success', data });
}

export function sendList<T>(res: Response, result: T): void {
  res.json({ status: 'success', ...result });
}

export function sendMessage(res: Response, message: string, statusCode = 200): void {
  res.status(statusCode).json({ status: 'success', message });
}

export function sendError(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({ status: 'error', message });
}
