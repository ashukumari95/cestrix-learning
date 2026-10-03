import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', AnalyticsController.getMyAnalytics);

export default router;
