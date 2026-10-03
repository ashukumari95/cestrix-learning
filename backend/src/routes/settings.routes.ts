import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Ensure only COACHING_ADMIN can access their own settings
router.use(requireAuth, requireRole(['COACHING_ADMIN']));

// Organization details
router.get('/organization', SettingsController.getSettings);
router.put('/organization', SettingsController.updateSettings);

// Roles & Permissions
router.get('/roles', SettingsController.getRoles);
router.post('/roles', SettingsController.createRole);

export default router;
