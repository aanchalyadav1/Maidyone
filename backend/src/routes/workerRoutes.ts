import { Router } from 'express';
import { getWorkers, createWorker, updateWorker } from '../controllers/workerController';

const router = Router();

router.get('/', getWorkers);
router.post('/', createWorker);
router.patch('/:id', updateWorker);

export default router;
