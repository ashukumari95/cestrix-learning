import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireRole(['COACHING_ADMIN', 'SUPER_ADMIN']));

router.get('/stats', getDashboardStats);

export default router;
