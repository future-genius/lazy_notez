import express from 'express';
import { verifyAccessToken, requireRole } from '../middleware/authMiddleware';
import { createResource, listResources, updateResource, deleteResource } from '../controllers/resourceController';
import { validateCreateResource, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.get('/', listResources);
router.use(verifyAccessToken);
router.post('/', requireRole('faculty'), validateCreateResource, handleValidationErrors, createResource);
router.put('/:id', requireRole('faculty'), updateResource);
router.delete('/:id', requireRole('faculty'), deleteResource);

export default router;
