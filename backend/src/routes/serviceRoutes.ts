import { Router } from 'express';
import { getServices, createService, getServiceById, updateService, deleteService } from '../controllers/serviceController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

// Read — any authenticated user
router.get('/', getServices);
router.get('/:id', validateObjectId, getServiceById);

// Write — admin only
router.post('/', authorize('admin'), createService);
router.put('/:id', authorize('admin'), validateObjectId, updateService);
router.delete('/:id', authorize('admin'), validateObjectId, deleteService);

export default router;
