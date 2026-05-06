import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getDashboardAnalytics);

export default router;
