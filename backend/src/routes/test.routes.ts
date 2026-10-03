import { Router } from 'express';
import * as TestController from '../controllers/test.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

// Admin/Teacher Routes
router.get('/', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.getTests);
router.get('/:id', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.getTestById);
router.post('/create', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.createTest);
router.put('/:id', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.updateTest);
router.delete('/:id', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.deleteTest);
router.post('/:id/assign', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.assignTestToBatches);
router.get('/:id/results', requireRole(['COACHING_ADMIN', 'TEACHER']), TestController.getTestResults);

// Student Exam Environment
router.post('/auto-save', TestController.autoSave);
router.post('/submit', TestController.submitTest);

export default router;
