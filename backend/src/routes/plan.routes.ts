import { Router } from 'express';
import * as PlanController from '../controllers/plan.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only SUPER_ADMIN can manage plans. (Optionally COACHING_ADMIN can only GET plans, but let's keep it simple for now)
router.get('/', requireAuth, PlanController.getPlans);
router.get('/:id', requireAuth, PlanController.getPlanById);

router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), PlanController.createPlan);
router.put('/:id', requireAuth, requireRole(['SUPER_ADMIN']), PlanController.updatePlan);

export default router;
