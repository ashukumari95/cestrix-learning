import { Router } from 'express';
import * as MistakeController from '../controllers/mistake.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/log', MistakeController.logMistake);
router.get('/my-mistakes', MistakeController.getMyMistakes);

export default router;
