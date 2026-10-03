import { Router } from 'express';
import * as QuestionController from '../controllers/question.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireRole(['COACHING_ADMIN', 'TEACHER']));

// Taxonomy dropdowns
router.get('/boards', QuestionController.getBoards);
router.get('/classes/:classId/subjects', QuestionController.getSubjectsByClass);
router.get('/chapters/:chapterId/topics', QuestionController.getTopicsByChapter);
router.get('/categories', QuestionController.getCategories);
router.get('/tags', QuestionController.getTags);

// Question CRUD
router.post('/bulk', QuestionController.bulkCreateQuestions);
router.post('/generate-ai', QuestionController.generateQuestionsAI);
router.post('/', QuestionController.createQuestion);
router.get('/', QuestionController.getQuestions);
router.get('/:id', QuestionController.getQuestionById);
router.put('/:id', QuestionController.updateQuestion);
router.delete('/:id', QuestionController.deleteQuestion);

export default router;
