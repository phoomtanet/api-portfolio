import { Router } from 'express';
import { getUser, getUsers } from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /userList:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/userList', getUsers);

/**
 * @openapi
 * /userById/{id}:
 *   get:
 *     summary: Get user by id
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid id
 *       404:
 *         description: User not found
 */
router.get('/userById/:id', getUser);

export default router;
