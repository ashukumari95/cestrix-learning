import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only COACHING_ADMIN (and SUPER_ADMIN) can manage users like teachers/students
router.use(requireAuth, requireRole(['COACHING_ADMIN', 'SUPER_ADMIN']));

router.post('/teachers', UserController.createTeacher);
router.get('/teachers', UserController.getTeachers);

router.post('/students', UserController.createStudent);
router.get('/students', UserController.getStudents);

router.post('/parents', UserController.createParent);
router.get('/parents', UserController.getParents);

router.get('/:id', UserController.getUser);
router.post('/:id/invite', UserController.resendInvite);

export default router;
