import { NextFunction, Request, Response } from 'express';
import { addUser, editUser, getUserById, listUsers, removeUser } from '../services/user.service';
import AppError from '../types/app-error';
import { sendList, sendMessage, sendSuccess } from '../utils/response';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.max(0, Number.parseInt(req.query.limit as string, 10) || 10);
    const offset = Math.max(0, Number.parseInt(req.query.offset as string, 10) || 0);
    const userId = req.query.user_id as string;
    const keyword = req.query.keyword as string;

    const result = await listUsers(limit, offset, Number(userId), keyword);
    sendList(res, result);
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

    const user = await getUserById(Number.parseInt(idParam, 10));
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullname, username, password, created_by, is_active } = req.body as {
      fullname?: string;
      username: string;
      password: string;
      created_by?: string;
      is_active?: boolean;
    };

    if (!username?.trim()) throw new AppError('username is required', 400);
    if (!password?.trim()) throw new AppError('password is required', 400);

    const user = await addUser({ fullname, username, password, created_by, is_active });
    sendSuccess(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid user id', 400);
    }

    const { fullname, password, is_active, updated_by } = req.body as {
      fullname?: string;
      password?: string;
      is_active?: boolean;
      updated_by?: string;
    };

    const user = await editUser(Number.parseInt(idParam, 10), { fullname, password, is_active, updated_by });
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid user id', 400);
    }

    const { deleted_by } = req.body as { deleted_by?: string };

    await removeUser(Number.parseInt(idParam, 10), deleted_by);
    sendMessage(res, 'User deleted');
  } catch (error) {
    next(error);
  }
};
