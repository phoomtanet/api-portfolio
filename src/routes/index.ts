import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import userRoute from './user.route';
import projectRoute from './project.route';
import uploadRoute from './upload.route';
import restaurantRoute from './restaurant.route';
import ragRoute from './rag.route';
import { generateAnswer } from '../controllers/rag.controller';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    description: 'Portfolio REST API',
    developer: 'phoomtanet',
    timestamp: new Date().toISOString(),
  });
});

router.use(healthRoute);
router.use(authRoute);
router.use(userRoute);
router.use(projectRoute);
router.use(uploadRoute);
router.use(restaurantRoute);
router.use(ragRoute);

// Direct RAG routes for backward compatibility
router.post('/generate', generateAnswer);

export default router;
