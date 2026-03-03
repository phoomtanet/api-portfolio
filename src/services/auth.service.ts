import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/prisma';
import AppError from '../types/app-error';

interface RegisterInput {
  fullname?: string;
  username: string;
  email?: string;
  password: string;
  createdBy?: string;
}

interface LoginMeta {
  ip_address?: string | null;
  user_agent?: string | null;
}

/** SHA-256 ของ token — ใช้ track / revoke session */
export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

/** แปลง "7d" | "1h" | "30m" | "60s" → milliseconds */
function parseExpiry(str: string): number {
  const n = parseInt(str, 10);
  if (str.endsWith('d')) return n * 86_400_000;
  if (str.endsWith('h')) return n * 3_600_000;
  if (str.endsWith('m')) return n * 60_000;
  return n * 1_000;
}

export const createUser = async ({ fullname, username, email, password, createdBy }: RegisterInput) => {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) throw new AppError('username is required', 400);
  if (!password?.trim()) throw new AppError('password is required', 400);

  const existing = await prisma.user.findFirst({ where: { username: trimmedUsername, deleted_at: null } });
  if (existing) throw new AppError('Username already exists', 409);

  if (email?.trim()) {
    const emailTaken = await prisma.user.findFirst({ where: { email: email.trim(), deleted_at: null } });
    if (emailTaken) throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const user = await prisma.user.create({
    data: {
      fullname: fullname?.trim() ?? null,
      username: trimmedUsername,
      email: email?.trim() ?? null,
      password: hashedPassword,
      created_by: createdBy ?? null,
      isActive: true,
    },
  });

  return {
    id: user.id,
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    isActive: user.isActive,
  };
};

export const loginUser = async (identifier: string, password: string, meta: LoginMeta = {}) => {
  const trimmed = identifier.trim();

  const user = await prisma.user.findFirst({
    where: {
      deleted_at: null,
      OR: [{ username: trimmed }, { email: trimmed }],
    },
  });

  if (!user || !user.password) {
    throw new AppError('Invalid username/email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid username/email or password', 401);
  }

  const payload = { sub: user.id, username: user.username };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

  const expiresAt = new Date(Date.now() + parseExpiry(env.jwtExpiresIn));

  await prisma.user_session.create({
    data: {
      user_id: user.id,
      token_hash: hashToken(token),
      ip_address: meta.ip_address ?? null,
      user_agent: meta.user_agent ?? null,
      expires_at: expiresAt,
    },
  });

  return {
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
    },
  };
};

/** logout — mark session inactive */
export const logoutSession = async (tokenHash: string) => {
  await prisma.user_session.updateMany({
    where: { token_hash: tokenHash, is_active: true },
    data: { is_active: false, logout_at: new Date() },
  });
};

/** อัปเดต last_activity_at แบบ fire-and-forget (ไม่ block response) */
export const touchSession = (tokenHash: string) => {
  prisma.user_session
    .updateMany({
      where: { token_hash: tokenHash, is_active: true },
      data: { last_activity_at: new Date() },
    })
    .catch(() => {});
};
