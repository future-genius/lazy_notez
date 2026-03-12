import express from 'express';
import { verifyAccessToken, requireAdminAccess } from '../middleware/authMiddleware';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAdminAnnouncements,
  listPublicAnnouncements,
  publishAnnouncement,
  updateAnnouncement
} from '../controllers/announcementController';
import { validateCreateAnnouncement, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.get('/', listPublicAnnouncements);

router.use(verifyAccessToken, requireAdminAccess);
router.get('/admin', listAdminAnnouncements);
router.post('/', validateCreateAnnouncement, handleValidationErrors, createAnnouncement);
router.put('/:id', updateAnnouncement);
router.patch('/:id/publish', publishAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;

