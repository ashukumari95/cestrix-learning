import { Router } from 'express';
import * as OrgController from '../controllers/organization.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All organization routes require SUPER_ADMIN role
router.use(requireAuth, requireRole(['SUPER_ADMIN']));

router.post('/', OrgController.createOrganization);
router.get('/', OrgController.getOrganizations);
router.get('/:id', OrgController.getOrganizationById);
router.put('/:id', OrgController.updateOrganization);
router.delete('/:id', OrgController.deleteOrganization);

export default router;
