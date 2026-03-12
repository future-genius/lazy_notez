import express from 'express';
import { verifyAccessToken, requireAnyRole } from '../middleware/authMiddleware';
import { createResource, listResources, updateResource, deleteResource, trackResourceDownload } from '../controllers/resourceController';
import { validateCreateResource, handleValidationErrors } from '../utils/validators';
import { requireAdminPanel } from '../middleware/adminPanelAuth';

const router = express.Router();

router.get('/', listResources);
router.post('/:id/download', trackResourceDownload);

// Allow admin mutations via JWT or admin panel key.
router.use(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    verifyAccessToken(req as any, res, () => requireAnyRole(['admin', 'faculty'])(req as any, res, next));
    return;
  }
  requireAdminPanel(req as any, res, next);
});

router.post('/', validateCreateResource, handleValidationErrors, createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;
