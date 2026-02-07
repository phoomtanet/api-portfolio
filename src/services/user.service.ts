import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import AppError from '../types/app-error';

export const listUsers = async (limit: number, offset: number, userId?: number, keyword?: string) => {

  const where: Prisma.userWhereInput = {};

  if (userId) {
    where.id = userId;
  }
  
  if (keyword) {
    where.fullname = {
      contains: keyword,
    };
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        username: true,
        created_at: true,
        updated_at: true,
        created_by: true,
        updated_by: true,
      },
      where,
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset,
    }),
  ]);

  return { data: users, total, limit, offset };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      fullname: true,
      username: true,
      created_at: true,
      updated_at: true,
      created_by: true,
      updated_by: true,
    },
    where: { id },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
