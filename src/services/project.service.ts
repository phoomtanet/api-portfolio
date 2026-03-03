import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import AppError from '../types/app-error';

type ProjectRow = {
  id: bigint;
  project_name: string | null;
  isActive: boolean | null;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
};

const serialize = (p: ProjectRow) => ({ ...p, id: Number(p.id) });

/* ── base filter: exclude soft-deleted ────────────────────────────────── */
const notDeleted: Prisma.projectWhereInput = { deleted_at: null };

/* ── List ─────────────────────────────────────────────────────────────── */
export const listProjects = async (limit: number, offset: number, keyword?: string) => {
  const where: Prisma.projectWhereInput = { ...notDeleted };

  if (keyword) {
    where.project_name = { contains: keyword };
  }

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset,
    }),
  ]);

  return { data: projects.map(serialize), total, limit, offset };
};

/* ── Get by id ────────────────────────────────────────────────────────── */
export const getProjectById = async (id: number) => {
  const project = await prisma.project.findFirst({
    where: { id: BigInt(id), ...notDeleted },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return serialize(project);
};

/* ── Create ───────────────────────────────────────────────────────────── */
export const addProject = async (data: { project_name: string; created_by?: string; isActive?: boolean }) => {
  const project = await prisma.project.create({
    data: {
      project_name: data.project_name,
      created_by: data.created_by ?? null,
      isActive: data.isActive ?? true,
    },
  });

  return serialize(project);
};

/* ── Update (isActive ใช้เปิด/ปิด) ────────────────────────────────────── */
export const editProject = async (
  id: number,
  data: { project_name?: string; isActive?: boolean; updated_by?: string },
) => {
  const existing = await prisma.project.findFirst({ where: { id: BigInt(id), ...notDeleted } });

  if (!existing) {
    throw new AppError('Project not found', 404);
  }

  const project = await prisma.project.update({
    where: { id: BigInt(id) },
    data: {
      ...(data.project_name !== undefined && { project_name: data.project_name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updated_at: new Date(),
      updated_by: data.updated_by ?? null,
    },
  });

  return serialize(project);
};

/* ── Soft delete ──────────────────────────────────────────────────────── */
export const removeProject = async (id: number, deleted_by?: string) => {
  const existing = await prisma.project.findFirst({ where: { id: BigInt(id), ...notDeleted } });

  if (!existing) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.update({
    where: { id: BigInt(id) },
    data: {
      deleted_at: new Date(),
      deleted_by: deleted_by ?? null,
    },
  });
};
