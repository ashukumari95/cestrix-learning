import { Router } from 'express';
import * as AIController from '../controllers/ai.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/stats', AIController.getAIUsageStats);
router.post('/hint', AIController.getHint);
router.post('/solution', AIController.getSolution);
router.post('/analyze-mistake', AIController.analyzeStudentMistake);
router.post('/similar-questions', AIController.getSimilarQuestions);

// Chat endpoints
router.post('/chat', AIController.chatWithAITutor);
router.get('/chat/sessions', AIController.getChatSessions);
router.get('/chat/sessions/:sessionId/messages', AIController.getChatMessages);

export default router;
