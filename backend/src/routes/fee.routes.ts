import { Router } from 'express';
import * as FeeController from '../controllers/fee.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Fee structures
router.get('/structures', FeeController.getFeeStructures);
router.post('/structures', FeeController.createFeeStructure);

// Student fees
router.get('/student-fees', FeeController.getStudentFees);
router.post('/assign', FeeController.assignFeeToStudent);
router.post('/payment', FeeController.recordPayment);

export default router;
