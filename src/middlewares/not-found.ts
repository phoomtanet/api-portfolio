import { Request, Response, NextFunction } from 'express';
import AppError from '../types/app-error';

const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Resource not found', 404));
};

export default notFoundHandler;
