import { Router } from 'express';
import * as LmsController from '../controllers/lms.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Secure routes for Teachers and Admins to manage LMS
router.use(requireAuth, requireRole(['COACHING_ADMIN', 'TEACHER']));

router.post('/courses', LmsController.createCourse);
router.get('/courses', LmsController.getCourses);
router.get('/courses/:id', LmsController.getCourse);
router.put('/courses/:id', LmsController.updateCourse);
router.delete('/courses/:id', LmsController.deleteCourse);
router.patch('/courses/:id/publish', LmsController.togglePublish);

// Single endpoint for hierarchy (Chapters -> Topics -> Resources)
router.post('/hierarchy', LmsController.createHierarchy);

// Get Secure AWS S3 Upload URL for PDF / Videos
router.post('/upload-url', LmsController.getPresignedUploadUrl);

export default router;
