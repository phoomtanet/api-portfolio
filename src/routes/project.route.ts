import { Router } from 'express';
import { createProject, deleteProject, getProject, getProjects, updateProject } from '../controllers/project.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /project:
 *   get:
 *     summary: Get all projects (Guest allowed)
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
router.get('/project', optionalAuthenticate, getProjects);

/**
 * @openapi
 * /project/{id}:
 *   get:
 *     summary: Get project by id (Guest allowed)
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
router.get('/project/:id', optionalAuthenticate, getProject);

/**
 * @openapi
 * /project:
 *   post:
 *     summary: Create a new project (Auth required)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_name_th
 *             properties:
 *               project_name_th:
 *                 type: string
 *               project_name_en:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 *       401:
 *         description: No token provided
 */
router.post('/project', authenticate, createProject);

/**
 * @openapi
 * /project/{id}:
 *   put:
 *     summary: Update project (Auth required)
 *     security:
 *       - bearerAuth: []
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
 *               project_name_th:
 *                 type: string
 *               project_name_en:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project updated
 *       401:
 *         description: No token provided
 *       404:
 *         description: Project not found
 */
router.put('/project/:id', authenticate, updateProject);

/**
 * @openapi
 * /project/{id}:
 *   delete:
 *     summary: Soft delete a project (Auth required)
 *     security:
 *       - bearerAuth: []
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
 *         description: Project deleted
 *       401:
 *         description: No token provided
 *       404:
 *         description: Project not found
 */
router.delete('/project/:id', authenticate, deleteProject);

export default router;
