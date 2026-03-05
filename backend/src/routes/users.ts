import express from 'express';
import { verifyAccessToken, requireAdminAccess } from '../middleware/authMiddleware';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { validateUpdateUser, handleValidationErrors } from '../utils/validators';

const router = express.Router();

router.use(verifyAccessToken);
router.use(requireAdminAccess);

router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id', validateUpdateUser, handleValidationErrors, updateUser);
router.delete('/:id', deleteUser);

export default router;
