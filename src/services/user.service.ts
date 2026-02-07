import prisma from '../config/prisma';
import AppError from '../types/app-error';

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
  });
  return users;
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
