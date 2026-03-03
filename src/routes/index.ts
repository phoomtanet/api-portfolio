import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import userRoute from './user.route';
import projectRoute from './project.route';

const router = Router();

router.use(healthRoute);
router.use(authRoute);
router.use(userRoute);
router.use(projectRoute);

export default router;
