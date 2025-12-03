import express from 'express';
import { verifyAccessToken, requireRole } from '../middleware/authMiddleware';
import { getActivityLogs, getSystemStats, updateAbout, getAbout, deleteNoteAdmin, clearActivityLogs, submitFeedback, listFeedback, deleteFeedback, resyncUsers } from '../controllers/adminController';
import { validateAbout, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.use(verifyAccessToken);
router.use(requireRole('admin'));

router.get('/activity', getActivityLogs);
router.get('/stats', getSystemStats);
router.get('/about', getAbout);
router.put('/about', validateAbout, handleValidationErrors, updateAbout);
router.delete('/note/:id', deleteNoteAdmin);
router.post('/clear-logs', clearActivityLogs);
router.post('/feedback', submitFeedback);
router.get('/feedback', listFeedback);
router.delete('/feedback/:id', deleteFeedback);
router.post('/resync-users', resyncUsers);

export default router;
