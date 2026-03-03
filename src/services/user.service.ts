import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import AppError from '../types/app-error';

const userSelect = {
  id: true,
  fullname: true,
  username: true,
  isActive: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
  deleted_at: true,
  deleted_by: true,
} satisfies Prisma.userSelect;

/* ── base filter: exclude soft-deleted ────────────────────────────────── */
const notDeleted: Prisma.userWhereInput = { deleted_at: null };

/* ── List ─────────────────────────────────────────────────────────────── */
export const listUsers = async (limit: number, offset: number, userId?: number, keyword?: string) => {
  const where: Prisma.userWhereInput = { ...notDeleted };

  if (userId) {
    where.id = userId;
  }

  if (keyword) {
    where.fullname = { contains: keyword };
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      select: userSelect,
      where,
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset,
    }),
  ]);

  return { data: users, total, limit, offset };
};

/* ── Get by id ────────────────────────────────────────────────────────── */
export const getUserById = async (id: number) => {
  const user = await prisma.user.findFirst({
    select: userSelect,
    where: { id, ...notDeleted },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/* ── Create ───────────────────────────────────────────────────────────── */
export const addUser = async (data: {
  fullname?: string;
  username: string;
  password: string;
  created_by?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.user.findFirst({ where: { username: data.username.trim(), ...notDeleted } });
  if (existing) {
    throw new AppError('Username already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password.trim(), 10);

  const user = await prisma.user.create({
    select: userSelect,
    data: {
      fullname: data.fullname?.trim() ?? null,
      username: data.username.trim(),
      password: hashedPassword,
      created_by: data.created_by ?? null,
      isActive: data.isActive ?? true,
    },
  });

  return user;
};

/* ── Update (isActive ใช้เปิด/ปิด) ────────────────────────────────────── */
export const editUser = async (
  id: number,
  data: { fullname?: string; password?: string; isActive?: boolean; updated_by?: string },
) => {
  const existing = await prisma.user.findFirst({ where: { id, ...notDeleted } });

  if (!existing) {
    throw new AppError('User not found', 404);
  }

  const updateData: Prisma.userUpdateInput = {
    updated_at: new Date(),
    updated_by: data.updated_by ?? null,
  };

  if (data.fullname !== undefined) updateData.fullname = data.fullname;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) updateData.password = await bcrypt.hash(data.password.trim(), 10);

  const user = await prisma.user.update({
    select: userSelect,
    where: { id },
    data: updateData,
  });

  return user;
};

/* ── Soft delete ──────────────────────────────────────────────────────── */
export const removeUser = async (id: number, deleted_by?: string) => {
  const existing = await prisma.user.findFirst({ where: { id, ...notDeleted } });

  if (!existing) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.update({
    where: { id },
    data: {
      deleted_at: new Date(),
      deleted_by: deleted_by ?? null,
    },
  });
};
