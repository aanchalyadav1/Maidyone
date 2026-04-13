import { Router } from 'express';
import { getServices, createService, getServiceById, updateService, deleteService } from '../controllers/serviceController';

const router = Router();

router.get('/', getServices);
router.post('/', createService);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
