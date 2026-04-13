import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/userController';
// import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

// router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;
