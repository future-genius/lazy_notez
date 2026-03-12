import express from 'express';
import { requireAdminPanel } from '../middleware/adminPanelAuth';
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

router.use(requireAdminPanel);
router.get('/admin', listAdminAnnouncements);
router.post('/', validateCreateAnnouncement, handleValidationErrors, createAnnouncement);
router.put('/:id', updateAnnouncement);
router.patch('/:id/publish', publishAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
