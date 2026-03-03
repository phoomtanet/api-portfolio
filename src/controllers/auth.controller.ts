import { NextFunction, Request, Response } from 'express';
import { createUser, loginUser } from '../services/auth.service';
import AppError from '../types/app-error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullname, username, email, password } = req.body;
    const user = await createUser({ fullname, username, email, password });
    return res.status(201).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body as { identifier: string; password: string };

    if (!identifier?.trim()) throw new AppError('username or email is required', 400);
    if (!password?.trim()) throw new AppError('password is required', 400);

    const result = await loginUser(identifier, password);
    return res.json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};
