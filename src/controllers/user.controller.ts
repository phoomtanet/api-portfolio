import { Request, Response, NextFunction } from 'express';
import { getUserById, listUsers } from '../services/user.service';
import AppError from '../types/app-error';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    res.json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid user id', 400);
    }

    const id = Number.parseInt(idParam, 10);
    const user = await getUserById(id);
    res.json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};
