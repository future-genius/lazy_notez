import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware';
import { createNote, listNotes, getNote, updateNote, deleteNote } from '../controllers/noteController';
import { validateCreateNote, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.use(verifyAccessToken);
router.post('/', validateCreateNote, handleValidationErrors, createNote);
router.get('/', listNotes);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
