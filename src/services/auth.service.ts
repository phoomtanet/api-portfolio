import prisma from '../config/prisma';
import AppError from '../types/app-error';

interface CreateUserInput {
  fullname?: string;
  username: string;
  password: string;
  createdBy?: string;
}

export const createUser = async ({ fullname, username, password, createdBy }: CreateUserInput) => {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new AppError('username is required', 400);
  }
  if (!password?.trim()) {
    throw new AppError('password is required', 400);
  }

  const existing = await prisma.user.findFirst({ where: { username: trimmedUsername } });
  if (existing) {
    throw new AppError('Username already exists', 409);
  }

  const user = await prisma.user.create({
    data: {
      fullname: fullname?.trim() || null,
      username: trimmedUsername,
      password: password.trim(),
      created_by: createdBy ?? null,
    },
  });

  return {
    id: user.id,
    fullname: user.fullname,
    username: user.username,
    created_at: user.created_at,
    active: user.active,
  };
};
