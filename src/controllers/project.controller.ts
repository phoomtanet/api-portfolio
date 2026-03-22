import { NextFunction, Request, Response } from 'express';
import { addProject, editProject, getProjectById, listProjects, removeProject } from '../services/project.service';
import AppError from '../types/app-error';
import { sendList, sendMessage, sendSuccess } from '../utils/response';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.max(0, Number.parseInt(req.query.limit as string, 10) || 10);
    const offset = Math.max(0, Number.parseInt(req.query.offset as string, 10) || 0);
    const keyword = req.query.keyword as string;

    const result = await listProjects(limit, offset, keyword);
    sendList(res, result);
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
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { project_name_th, project_name_en, is_active } = req.body as {
      project_name_th: string;
      project_name_en?: string;
      is_active?: boolean;
    };

    if (!project_name_th?.trim()) {
      throw new AppError('project_name_th is required', 400);
    }

    const created_by = req.user?.username;

    const project = await addProject({
      project_name_th: project_name_th.trim(),
      project_name_en: project_name_en?.trim(),
      created_by,
      is_active,
    });
    sendSuccess(res, project, 201);
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

    const { project_name_th, project_name_en, is_active } = req.body as {
      project_name_th?: string;
      project_name_en?: string;
      is_active?: boolean;
    };

    const updated_by = req.user?.username;

    const project = await editProject(Number(idParam), {
      project_name_th: project_name_th?.trim(),
      project_name_en: project_name_en?.trim(),
      is_active,
      updated_by,
    });
    sendSuccess(res, project);
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

    const deleted_by = req.user?.username;

    await removeProject(Number(idParam), deleted_by);
    sendMessage(res, 'Project deleted');
  } catch (error) {
    next(error);
  }
};
