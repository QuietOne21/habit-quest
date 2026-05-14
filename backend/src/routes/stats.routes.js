import { Router } from 'express';
import protect from '../middleware/auth.js';
import { getDashboard, getAnnualStats, getMonthlyStats, } from '../controllers/stats.controller.js';

const router = Router();

router.get('/dashboard/:year/:month', getDashboard);
router.get('/annual/:year', getAnnualStats);
router.get('/monthly/:year/:month', getMonthlyStats);

export default router;