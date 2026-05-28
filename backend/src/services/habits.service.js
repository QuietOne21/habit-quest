import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

//get all habits
export const getHabits = async (userId) => {

    const [rows] = await pool.execute(
        `SELECT id, name, description, color, daily_goal, sort_order, is_active, created_at
        FROM habits
        WHERE user_id = ? AND is_active = 1
        ORDER BY sort_order ASC`, [userId]
    );

    return rows;
};

// create habit
export const createHabit = async (userId, {name, description, color = '#7c3aed', dailyGoal = 1, sortOrder = 0,})=> {
    const [result] = await pool.execute(
        `INSERT INTO habits (user_id, name, description, color, daily_goal, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, description || null, color, dailyGoal, sortOrder]
    );

    const [rows] = await pool.execute(
        `SELECT * FROM habits WHERE id = ?`, [result.insertId]
    );
    return rows[0];
};

// update habit
export const updateHabit = async (userId, habitId, {name, description, color, dailyGoal, sortOrder, }) => {
    const [existing] = await pool.execute(
        `SELECT id FROM habits WHERE id = ? AND user_id = ?`, [habitId, userId]
    );

    if (!existing[0]) {
        throw createError(404, 'Habit not found.');
    }

    await pool.execute(
        `UPDATE habits
        SET name = ?, description = ?, color = ?, daily_goal = ?, sort_order = ?
        WHERE id = ? AND user_id = ?`,
        [name, description || null, color, dailyGoal, sortOrder, habitId, userId]
    );

    const [rows] = await pool.execute(
        `SELECT * FROM habits WHERE id = ?`, [habitId]
    );
    return rows[0];
};

// delete habit
export const deleteHabit = async (userId, habitId) => {
    const [existing] = await pool.execute(
        `SELECT id FROM habits WHERE id = ? AND user_id = ?`,
        [habitId, userId]
    );

    if(!existing[0]) {
        throw createError(404, 'Habit not found.');
    }

    await pool.execute(
        'UPDATE habits SET is_active = 0 WHERE id = ? AND user_id = ?',
        [habitId, userId]
    );
};

//toggle entry
export const toggleEntry = async (userId, {habitId, date, completed, }) => {
    const [habits] = await pool.execute(
        'SELECT id, name FROM habits WHERE id = ? AND user_id = ?',
        [habitId, userId] 
    );

    if (!habits[0]) {
        throw createError(404, 'Habit not found.');
    }

    await pool.execute(
        `INSERT INTO habit_entries (habit_id, user_id, entry_date, completed, value)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        completed = VALUES(completed), value = VALUES(value), updated_at = CURRENT_TIMESTAMP`,
        [habitId, userId, date, completed, completed ? 1 : 0]
    );

    await updateUserStats(userId, completed);

    const [entries] = await pool.execute(
        `SELECT e.*,
        h.name AS habit_name
        FROM habit_entries e
        JOIN habits h ON h.id = e.habit_id
        WHERE e.habit_id = ?
        AND e.entry_date = ?`,
        [habitId, date]
    );
    return entries[0];
};

// get monthly entries
export const getMonthlyEntries = async (userId, year, month) => {
    const [rows] = await pool.execute(
        `SELECT e.id, 
        e.habit_id AS habitId,
        h.name AS habitName,
        DATE_FORMAT(e.entry_date, '%Y-%m-%d') AS date,
        e.completed
        FROM habit_entries e
        JOIN habits h ON h.id = e.habit_id
        WHERE e.user_id = ?
        AND YEAR(e.entry_date) = ? AND MONTH(e.entry_date) = ?
        ORDER BY e.entry_date ASC, e.habit_id ASC`,
        [userId, year, month]
    );
    return rows;
};

// reset month
export const resetMonth = async (userId, year, month) => {
    await pool.execute(
        `DELETE FROM habit_entries
        WHERE user_id
        AND YEAR(entry_date) = ? AND MONTH(entry_date) = ?`,
        [userId, year, month]
    );
};

// update user stats
const updateUserStats = async (userId, wasCompleted) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );

    if(!users[0]) return;

    let { xp, level, longest_streak } = users[0];
    
    if (wasCompleted) {
        xp += 10;

        const xpNeeded = level * level * 100;
        if (xp >= xpNeeded) {
            level++;
            console.log(`User ${userId} reached level ${level}!`);
        }
    }

    // recalculating streak
    const [completedDates] = await pool.execute(
        `SELECT DISTINCT entry_date
        FROM habit_entries
        WHERE user_id = ? AND completed = 1
        ORDER BY entry_date DESC
        LIMIT 365`, [userId]
    );

    //counting consecutive days back going back from today
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0); // compares only date not times

    for (const row of completedDates) {
        const rowDate = new Date(row.entry_date);
        rowDate.setHours(0, 0, 0, 0);

        if (rowDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }  
    
    await pool.execute(
        `UPDATE users
        SET xp = ?, level = ?, current_streak = ?, longest_streak = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [xp, level, streak, Math.max(streak, longest_streak), userId]
    );
};