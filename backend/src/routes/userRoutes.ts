import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', validateObjectId, getUserById);
router.patch('/:id', authorize('admin'), validateObjectId, updateUser);
router.delete('/:id', authorize('admin'), validateObjectId, deleteUser);

export default router;
