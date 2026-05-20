import { Router } from 'express';
import { getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker } from '../controllers/workerController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getWorkers);
router.post('/', authorize('admin'), createWorker);
router.get('/:id', validateObjectId, getWorkerById);
router.patch('/:id', authorize('admin'), validateObjectId, updateWorker);
router.delete('/:id', authorize('admin'), validateObjectId, deleteWorker);

export default router;
