import { Router } from 'express';
import { createProject, deleteProject, getProject, getProjects, updateProject } from '../controllers/project.controller';

const router = Router();

/**
 * @openapi
 * /project:
 *   get:
 *     summary: Get all projects
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/project', getProjects);

/**
 * @openapi
 * /project/{id}:
 *   get:
 *     summary: Get project by id
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project found
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Project not found
 */
router.get('/project/:id', getProject);

/**
 * @openapi
 * /project:
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_name
 *             properties:
 *               project_name:
 *                 type: string
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 */
router.post('/project', createProject);

/**
 * @openapi
 * /project/{id}:
 *   put:
 *     summary: Update project (project_name / toggle isActive)
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               updated_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Project not found
 */
router.put('/project/:id', updateProject);

/**
 * @openapi
 * /project/{id}:
 *   delete:
 *     summary: Soft delete a project
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deleted_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project deleted
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Project not found
 */
router.delete('/project/:id', deleteProject);

export default router;
