import pool from '../config/db.js';
import { getUserSummary } from  './auth.service.js';
import { getHabits, getMonthEntries } from './habits.service.js';

const MONTH_NAMES = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEK_COLORS = [
    "#a78bfa", "#67e8f9", "#f9a8d4", "#fcd34d", "#6ee7b7",
];

const round1 = (n) => Math.round(n*10)/10;

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

export const getAnnualStats = async (userId, year) => {
    
    const [entries] = await pool.execute(
        `SELECT
            MONTH(entry_date) AS month,
            COUNT(*) AS total,
            SUM(completed) AS completed
        FROM habit_entries
        WHERE user_id = ?
        AND YEAR(entry_date) = ?
        GROUP BY MONTH(entry_date)
        ORDER BY MONTH(entry_date)`,
        [userId, year]
    );

    let totalAll = 0;
    let completedAll = 0;
    let bestMonth = '';
    let bestMonthPct = 0;

    const monthlyBreakdown = Array.from({ length: 12}, (_,i) => {
        const month = i + 1;

        const found = entries.find(e => e.month === month) || { total: 0, completed: 0 };

        const pct = found.total > 0 ? round1((Number(found.completed)/found.total) * 100) : 0;

        totalAll += found.total;
        completedAll += Number(found.completed);

        if (pct > bestMonthPct && found.total > 0) {
            bestMonthPct = pct;
            bestMonth = MONTH_NAMES[month];
        }

        return {
            year,
            month,
            monthName: MONTH_NAMES[month],
            totalEntries: found.total,
            completedEntries: Number(found.completed),
            completionPct: pct,
        };
    });

    return {
        year,
        totalHabits: totalAll,
        completedHabits: completedAll,
        completionPct: totalAll > 0 ? round1((completedAll/totalAll)*100) : 0,
        monthlyBreakdown,
        bestMonth,
        bestMonthPct,
    };
};

export const getMonthlyStats = async (userId, year, month) => {

    const numDays = daysInMonth(year, month);

    const [entries] = await pool.execute(
        `SELECT
            e.habit_id,
            h.name AS habit_name,
            h.color,
            DAY(e.entry_date) AS  day,
            e.completed
        FROM habit_entries e
        JOIN  habits h ON h.id = e.habit_id
        WHERE e.user_id = ? 
        AND YEAR(e.entry_date) = ?
        AND MONTH(e.entry_date) = ?`,
        [userId, year, month]
    );

    const habits = await getHabits(userId);

    const dailyBreakdown = Array.from({ length: numDays }, (_, i) => {
        const day = i + 1;
        const dayEntries = entries.filter(e => e.day === day);
        const done = dayEntries.filter(e => e.completed).length;

        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return {
            date: dateStr,
            day,
            total: dayEntries.length,
            completed: done,
            pct: dayEntries.length > 0 ? round1((done / dayEntries.length)*100) : 0,
        };
    });

    const weeklyBreakdown = [];
    let weekNum = 1;

    for (let start = 1; start <= numDays; start += 7) {
        const end = Math.min(start + 6, numDays);
        const isPartial = (end - start + 1) < 7 && weekNum > 4;
        const weekEntries = entries.filter(
            e => e.day >= start && e.day <= end
        );
        const done = weekEntries.filter(e => e.completed).length;

        weeklyBreakdown.push({
            weekNumber: weekNum,
            label: isPartial ? `Week ${weekNum} (partial)` : `Week ${weekNum}`,
            completionPct: weekEntries.length > 0 ? round1((done/ weekEntries.length)*100) : 0,
            color: WEEK_COLORS[(weekNum - 1) % WEEK_COLORS.length],
        });
        weekNum++;
    }

    const habitBreakdown = habits.map(habit => {
        const habitEntries = entries.filter(
            e => e.habit_id === habit.id
        );
        const done = habitEntries.filter(e => e.completed).length;

        return {
            habitId: habit.id,
            name: habit.name,
            color: habit.color,
            total: numDays,
            completed: done,
            pct: round1((done/numDays)*100),
        };
    }).sort((a, b) => b.pct - a.pct);

    const streaks = await Promise.all(
        habits.map(async (habit) => {

            const [rows] = await pool.execute(
                `SELECT
                    DATE_FORMAT(entry_date, '%Y-%m-%d') AS date
                FROM habit_entries
                WHERE habit_id = ?
                AND completed = 1
                ORDER BY entry_date DESC`,
                [habit.id]
            );

            const dates = rows.map(r => r.date);

            let currentStreak = 0;
            const checkDate = new Date();
            checkDate.setHours(0, 0, 0, 0);

            for (const date of dates) {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);

                if (d.getTime() === checkDate.getTime()) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate()- 1);
                } else break;
            }

            let bestStreak = 0;
            let tempStreak = 0;
            let prevDate = null;

            for (const date of [...dates].reverse()) {
                if (!prevDate) {
                    tempStreak = 1;
                } else {
                    const prev = new Date(prevDate);
                    const curr = new Date(date);

                    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

                    tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
                }
                bestStreak = Math.max(bestStreak, tempStreak);
                prevDate = date;
            }

            return {
                habitId: habit.id,
                name: habit.name,
                currentStreak,
                bestStreak,
            };
        })
    );

    const totalEntries = entries.length;
    const completedEntries = entries.filter(e => e.completed).length;

    return {
        year,
        month,
        monthName: MONTH_NAMES[month],
        totalEntries,
        completedEntries,
        completionPct: totalEntries > 0 ? round1((completedEntries/totalEntries)*100): 0,
        daysTracked: dailyBreakdown.filter(d => d.total > 0).length,
        dailyBreakdown,
        weeklyBreakdown,
        habitBreakdown,
        streaks,
    };
};


export const getDashboard = async (userId, year, month) => {

    const [user, habits, monthEntries, annual, monthly] = await Promise.all([
        getUserSummary(userId),
        getHabits(userId),
        getMonthEntries(userId, year, month),
        getAnnualStats(userId, year),
        getMonthlyStats(userId, year, month),
    ]);

    const [allBadges] = await pool.execute(
        `SELECT * FROM badges`
    );

    const [earnedRows] = await pool.execute(
        `SELECT badge_id, earned_at
        FROM user_badges
        WHERE user_id = ?`,
        [userId]
    );

    const earnedMap = new Map(
        earnedRows.map(r => [r.badge_id, r.earned_at])
    );

    const badges = allBadges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        xpReward: badge.xp_reward,
        earned: earnedMap.has(badge.id),
        earnedAt: earnedMap.get(badge.id) || null,
    }));

    return {
        user,
        habits,
        monthEntries,
        annual,
        currentMonth: monthly,
        badges,
        earnedBadges: badges.filter(b => b.earned),
    };
};