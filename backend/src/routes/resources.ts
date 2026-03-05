import express from 'express';
import { verifyAccessToken, requireAnyRole } from '../middleware/authMiddleware';
import { createResource, listResources, updateResource, deleteResource, trackResourceDownload } from '../controllers/resourceController';
import { validateCreateResource, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.get('/', listResources);
router.post('/:id/download', verifyAccessToken, trackResourceDownload);
router.use(verifyAccessToken);
router.post('/', requireAnyRole(['admin', 'faculty']), validateCreateResource, handleValidationErrors, createResource);
router.put('/:id', requireAnyRole(['admin', 'faculty']), updateResource);
router.delete('/:id', requireAnyRole(['admin', 'faculty']), deleteResource);

export default router;
