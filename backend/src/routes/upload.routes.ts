import { Router } from 'express';
import * as UploadController from '../controllers/upload.controller';

const router = Router();

router.post('/presigned-url', UploadController.getPresignedUrl);

export default router;
