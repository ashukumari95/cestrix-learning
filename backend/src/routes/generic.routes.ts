import { Router } from 'express';
import { GenericController } from '../controllers/generic.controller';

const router = Router();

// Define generic routes for ANY model
// Note: modelName should exactly match the prisma model property name (usually camelCase, e.g. studentProfile)

router.get('/:modelName', GenericController.getAll);
router.post('/:modelName', GenericController.create);
router.get('/:modelName/:id', GenericController.getOne);
router.patch('/:modelName/:id', GenericController.update);
router.delete('/:modelName/:id', GenericController.remove);

export default router;
