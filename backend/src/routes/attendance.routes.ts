import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// Protect all attendance routes
router.use(requireAuth);
router.use(requireRole([RoleEnum.COACHING_ADMIN, RoleEnum.TEACHER, RoleEnum.BRANCH_MANAGER]));

router.get('/stats', attendanceController.getAttendanceStats);
router.get('/batch/:batchId', attendanceController.getBatchAttendance);
router.post('/batch/:batchId', attendanceController.markBatchAttendance);

export default router;
