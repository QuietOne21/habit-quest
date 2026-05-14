import { body, validationResult } from 'express-validator';
import * as habitsService from '../services/habits.service.js';

export const habitValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100})
        .withMessage('Habit name is required (max 100 chars'),

    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Color must be a hex code like #a78bfa'),

    body('dailyGoal')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Daily goal must be a positive number'),
];

const validateRequest = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return false
    }
    return true;
};

// GET /api/habits
export const getHabits = async (req, res, next) => {
    try {
        const habits = await habitsService.getHabits(req.user.id);
        res.json(habits);
    }catch (err) {
        next(err);
    }
};

// POST /api/habits
export const createHabit = async (req, res, next) => {
    if (!validateRequest(req, res)) return;

    try {
        const habit = await habitsService.createHabit(
            req.user.id,
            req.body
        );
        req.status(201).json(habit);
    } catch (err) {
        next(err);
    }
};

// PUT /api/habits/:id
export const updateHabit = async (req, res, next) => {
    if (!validateRequest(req, res)) return;

    try {
        const habit = await habitsService.updateHabit(
            req.user.id,
            parseInt(req.params.id),
            req.body
        );
        res.json(habit);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/habits/:id
export const deleteHabit = async (req, res, next) => {
    try {
        await habitsService.deleteHabit(
            req.user.id,
            parseInt(req.params.id)
        );
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

// POST /api/habits/toggle
export const toggleEntry = async (req, res, next) => {
    try {
        const entry = await habitsService.toggleEntry(
            req.user.id,
            req.body
        );
        res.json(entry);
    } catch (err) {
        next(err);
    }
};

// GET /api/habits/entries/:year/:month
export const getMonthEntries = async (req, res, next) => {
    try {
        const entries = await habitsService.getMonthEntries(
            req.user.id,
            parseInt(req.params.year),
            parseInt(req.params.month)
        );
        res.json(entries);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/habits/entries/:year/:month
export const resetMonth = async (req, res, next) => {
    try {
        await habitsService.resetMonth(
            req.user.id, 
            parseInt(req.params.year),
            parseInt(req.params.month)
        );
        req.status(204).send();
    } catch (err) {
        next(err);
    }
};