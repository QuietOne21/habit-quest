import { Router } from 'express';
import protect from '../middleware/auth.js';
import { getDashboard, getAnnualStats, getMonthlyStats, } from '../controllers/stats.controller.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(protect);
router.use(apiLimiter);

router.get('/dashboard/:year/:month', getDashboard);
router.get('/annual/:year', getAnnualStats);
router.get('/monthly/:year/:month', getMonthlyStats);

export default router;