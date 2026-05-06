import { Router } from 'express';
import { getWorkers, createWorker, updateWorker } from '../controllers/workerController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getWorkers);
router.post('/', authorize('admin'), createWorker);
router.patch('/:id', authorize('admin'), updateWorker);

export default router;
