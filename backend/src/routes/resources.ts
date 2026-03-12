import express from 'express';
import { verifyAccessToken, requireAnyRole } from '../middleware/authMiddleware';
import {
  approveResource,
  createResource,
  deleteResource,
  deleteSubmission,
  listAdminResources,
  listMyResources,
  listResources,
  submitResource,
  trackResourceDownload,
  updateResource,
  updateSubmission
} from '../controllers/resourceController';
import { validateCreateResource, handleValidationErrors } from '../utils/validators';
import { requireAdminPanel } from '../middleware/adminPanelAuth';

const router = express.Router();

// Public (approved only)
router.get('/', listResources);
router.get('/mine', listMyResources);
router.post('/submit', submitResource);
router.put('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);
router.post('/:id/download', trackResourceDownload);

// Admin views & moderation
router.get('/admin', requireAdminPanel, listAdminResources);
router.patch('/:id/approve', requireAdminPanel, approveResource);

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
