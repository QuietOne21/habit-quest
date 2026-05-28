import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const DEFAULT_HABITS = [
  { name: 'Wake up at 5:00',        color: '#A78BFA' },
  { name: 'Drink 2L Water',         color: '#818CF8' },
  { name: 'Read 10 Pages',          color: '#F472B6' },
  { name: 'Avoid Scrolling in Bed', color: '#34D399' },
];

const generateToken = (user) => {

    // data stored inside the token
    return jwt.sign( 
        {
            id: user.id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET || 'fallback_secret_for_development_only_32chars',

        {expiresIn: process.env.JWT_EXPIRES_IN || '24h'},
    );
};

const xpForLevel = (level) => level * level * 100;

const seedDefaultHabits = async (userId) => {

    const values = DEFAULT_HABITS.map((habit, index) => [
        userId,
        habit.name,
        habit.color,
        1,
        index,
    ]);

    await pool.query(
        `INSERT INTO habits (user_id, name, color, daily_goal, sort_order) VALUES ?`, [values]
    );
};



export const register = async ({ username, email, password }) => {

    // check 1: is the email already taken?
    const [emailCheck] = await pool.execute(
        `SELECT id FROM users WHERE email = ?`, [email]
    );
    if (emailCheck.length > 0) {
        throw createError(400, 'Email is already registered.');
    }

    // check 2: is the username already taken?
    const [usernameCheck] = await pool.execute(
        'SELECT id FROM users WHERE username = ?', [username]
    );
    if (usernameCheck.length > 0) {
        throw createError(400, 'Username is already taken.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
        `INSERT INTO users (username, email, password_hash, xp, level, current_streak, longest_streak) 
        VALUES (?, ?, ?, 0, 1, 0, 0)`, [username, email, passwordHash]
    );

    const userId = result.insertId; // ID auto-gen of row just created

    await seedDefaultHabits(userId); // give the user their default 9 habits

    const [users] = await pool.execute(
        'SELECT * FROM users WHERE id = ?', [userId]
    );
    const user = users[0];

    const token = generateToken(user); // generate jwt token for immediate login

    return {
        token,
        username: user.username,
        level: user.level,
        xp: user.xp,
        currentStreak: user.current_streak,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
};

export const login = async ({ email, password }) => {

    const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',[email]
    );
    const user = users[0];

    if (!user) {
        throw createError(401, 'Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );
    if (!passwordMatches) {
        throw createError(401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    return {
        token,
        username: user.username,
        level: user.level,
        xp: user.xp,
        currentStreak: user.current_streak,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
};

export const getUserSummary = async (userId) => {

    const [users] = await pool.execute(
        'SELECT * FROM users WHERE id = ?', [userId]
    );
    if(!users[0]) {
        throw createError(404, 'User not found');
    }

    const user = users[0];

    const [badgeCount] = await pool.execute(
        'SELECT COUNT(*) AS total FROM user_badges WHERE user_id = ?', [userId]
    );

    const nextLevelXp = xpForLevel(user.level + 1);

    return {
        username: user.username,
        level: user.level,
        xp: user.xp,
        xpToNextLevel: nextLevelXp- user.xp,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        totalBadges: badgeCount[0].total,
    };
};