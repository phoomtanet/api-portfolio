import { NextFunction, Request, Response } from 'express';
import { addProject, editProject, getProjectById, listProjects, removeProject } from '../services/project.service';
import AppError from '../types/app-error';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.max(0, Number.parseInt(req.query.limit as string, 10) || 10);
    const offset = Math.max(0, Number.parseInt(req.query.offset as string, 10) || 0);
    const keyword = req.query.keyword as string;

    const result = await listProjects(limit, offset, keyword);
    res.json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid project id', 400);
    }

    const project = await getProjectById(Number(idParam));
    res.json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { project_name, is_active } = req.body as {
      project_name: string;
      is_active?: boolean;
    };

    if (!project_name?.trim()) {
      throw new AppError('project_name is required', 400);
    }

    // ดึง username จาก JWT token อัตโนมัติ
    const created_by = req.user?.username;

    const project = await addProject({ project_name: project_name.trim(), created_by, is_active });
    res.status(201).json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid project id', 400);
    }

    const { project_name, is_active } = req.body as {
      project_name?: string;
      is_active?: boolean;
    };

    // ดึง username จาก JWT token อัตโนมัติ
    const updated_by = req.user?.username;

    const project = await editProject(Number(idParam), { project_name, is_active, updated_by });
    res.json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
      throw new AppError('Invalid project id', 400);
    }

    // ดึง username จาก JWT token อัตโนมัติ
    const deleted_by = req.user?.username;

    await removeProject(Number(idParam), deleted_by);
    res.json({ status: 'success', message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};
