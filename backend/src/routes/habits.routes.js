import { Router } from 'express';
import protect from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { getHabits, createHabit, updateHabit, deleteHabit, toggleEntry, getMonthEntries, resetMonth, habitValidation, } from '../controllers/habits.controller.js';


const router = Router();

router.use(protect); //every router must have a valid jwt token
router.use(apiLimiter);

router.get('/', getHabits);
router.post('/', habitValidation, createHabit );
router.put('/:id', habitValidation, updateHabit);
router.delete('/:id', deleteHabit);
router.post('/toggle', toggleEntry);
router.get('/entries/:year/:month', getMonthEntries);
router.delete('/entries/:year/:month', resetMonth);

export default router;