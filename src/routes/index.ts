import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';

const router = Router();

router.use(healthRoute);
router.use(authRoute);

export default router;
