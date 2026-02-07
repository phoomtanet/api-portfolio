import { Request, Response, NextFunction } from 'express';
import { getUserById, listUsers } from '../services/user.service';
import AppError from '../types/app-error';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.max(0, Number.parseInt(_req.query.limit as string, 10) || 10);
    const offset = Math.max(0, Number.parseInt(_req.query.offset as string, 10) || 0);
    const userId = _req.query.user_id as string;
     const keyword = _req.query.keyword as string; 


    const usersPage = await listUsers(limit, offset, Number(userId), keyword);
    res.json({ status: 'success', ...usersPage });
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
