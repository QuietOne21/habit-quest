import { body, validationResult } from 'express-validator';
import * as authService from '../services/auth.service.js';

export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50})
        .withMessage('Username must be between 3 to 50 characters'),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8})
        .withMessage('Password must at least 8 characters'),
];

export const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const validateRequest = (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            errors: errors.array(),
        });
        return false;
    }
    return true;
};


export const register = async (req, res, next) => {

    if (!validateRequest(req, res)) return;

    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {

    if (!validateRequest(req, res)) return;

    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);

    } catch (err) {
        next(err);
    }
};