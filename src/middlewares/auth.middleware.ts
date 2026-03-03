import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import AppError from '../types/app-error';

export interface JwtPayload {
  sub: number;
  username: string;
  iat: number;
  exp: number;
}

/* extend Express Request to carry decoded user */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/* ── Required auth — 401 ถ้าไม่มี token ─────────────────────────────── */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

/* ── Optional auth — Guest ผ่านได้ แต่ถ้ามี token จะ decode ให้ ───────── */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Guest — ผ่านได้ req.user = undefined
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;
    req.user = payload;
  } catch {
    // token ผิด/หมดอายุ — ถือว่า Guest แทนที่จะ block
  }

  next();
};
