import { Router } from 'express';
import { register, login, registerValidation, loginValidation } from '../controllers/auth.controller.js';

const router = Router();

// validation middleware runs BEFORE controller
// If validation fails, controller never runs
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;