import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import userRoute from './user.route';

const router = Router();

router.use(healthRoute);
router.use(authRoute);
router.use(userRoute);

export default router;
