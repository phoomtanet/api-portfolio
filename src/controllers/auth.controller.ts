import { Request, Response, NextFunction } from 'express';
import { createUser } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullname, username, password } = req.body;
    const user = await createUser({ fullname, username, password });
    return res.status(201).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};
