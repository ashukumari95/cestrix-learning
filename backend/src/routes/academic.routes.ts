import { Router } from 'express';
import * as AcademicController from '../controllers/academic.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only COACHING_ADMIN (and SUPER_ADMIN optionally) can manage academics
router.use(requireAuth, requireRole(['COACHING_ADMIN', 'SUPER_ADMIN']));

router.post('/classes', AcademicController.createClass);
router.get('/classes', AcademicController.getClasses);

router.post('/batches', AcademicController.createBatch);
router.get('/batches', AcademicController.getBatches);

export default router;
