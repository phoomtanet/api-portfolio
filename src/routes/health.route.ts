import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: API health status
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Health status payload
 */
router.get('/health', getHealth);

export default router;
