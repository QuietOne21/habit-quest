import { Router } from 'express';
import { register, login, registerValidation, loginValidation } from '../controllers/auth.controller.js';
import { authLimiter, registerLimiter, } from '../middleware/rateLimiter.js'

const router = Router();

// validation middleware runs BEFORE controller
// If validation fails, controller never runs
router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);

export default router;