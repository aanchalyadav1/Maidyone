import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController';

const router = Router();

router.get('/', getDashboardAnalytics);

export default router;
