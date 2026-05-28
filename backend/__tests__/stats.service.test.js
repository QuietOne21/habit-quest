import { jest } from '@jest/globals';

// ─────────────────────────────────────────────
// MOCK THE DATABASE BEFORE IMPORTING ANYTHING
// jest.unstable_mockModule replaces the real
// db.js with a fake version that has mock functions
// ─────────────────────────────────────────────
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    execute: jest.fn(),
    query:   jest.fn(),
    getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
  }
}));

jest.unstable_mockModule('../src/services/auth.service.js', () => ({
  getUserSummary: jest.fn(),
}));

jest.unstable_mockModule('../src/services/habits.service.js', () => ({
  getHabits:        jest.fn(),
  getMonthEntries:  jest.fn(),
}));

const { default: pool }             = await import('../src/config/db.js');
const { getUserSummary }             = await import('../src/services/auth.service.js');
const { getHabits, getMonthEntries } = await import('../src/services/habits.service.js');
const { getAnnualStats, getDashboard } = await import('../src/services/stats.service.js');

describe('Stats Service', () => {

  beforeEach(() => jest.resetAllMocks());

  // ─────────────────────────────────────────
  describe('getAnnualStats()', () => {

    it('returns annual stats with monthly breakdown', async () => {
      pool.execute.mockResolvedValueOnce([[
        { month: 1, total: 279, completed: 200 },
        { month: 2, total: 252, completed: 180 },
        { month: 3, total: 279, completed: 250 },
      ]]);

      const result = await getAnnualStats(1, 2025);

      expect(result.year).toBe(2025);
      expect(result.monthlyBreakdown).toHaveLength(12);
      expect(result.totalHabits).toBe(810);
      expect(result.completedHabits).toBe(630);
      expect(result.bestMonth).toBe('Mar');
    });

    it('returns all zeros when no entries exist', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      const result = await getAnnualStats(1, 2025);

      expect(result.totalHabits).toBe(0);
      expect(result.completedHabits).toBe(0);
      expect(result.completionPct).toBe(0);
      expect(result.bestMonth).toBe('');
    });
  });

  // ─────────────────────────────────────────
     describe('getDashboard()', () => {

    it('returns complete dashboard data', async () => {
      // Mock the non-pool functions
      getUserSummary.mockResolvedValue({
        username: 'alex',
        level: 2,
        xp: 200,
        xpToNextLevel: 200,
        currentStreak: 5,
        longestStreak: 15,
        totalBadges: 3,
      });

      getHabits.mockResolvedValue([
        { id: 1, name: 'Push-Ups', color: '#67E8F9' },
      ]);

      getMonthEntries.mockResolvedValue([]);

      // Now provide mock responses for all 5 pool.execute calls
      // The order matters! Calls happen in this sequence:

      // Call 1: getAnnualStats → monthly data query
      pool.execute.mockResolvedValueOnce([[]]);

      // Call 2: getMonthlyStats → entries for the month
      pool.execute.mockResolvedValueOnce([[]]);

      // Call 3: getMonthlyStats → streak data for habit 1
      pool.execute.mockResolvedValueOnce([[]]);

      // Call 4: getDashboard → all badges query
      pool.execute.mockResolvedValueOnce([[{
        id: 1,
        name: 'First Step',
        description: 'Complete your first habit',
        icon: '🌱',
        xp_reward: 10,
      }]]);

      // Call 5: getDashboard → earned badges query
      pool.execute.mockResolvedValueOnce([[]]);

      const result = await getDashboard(1, 2025, 4);

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('alex');
      expect(result.habits).toBeDefined();
      expect(result.habits).toHaveLength(1);
      expect(result.annual).toBeDefined();
      expect(result.currentMonth).toBeDefined();
      expect(result.badges).toBeDefined();
      expect(result.badges).toHaveLength(1);
      expect(result.earnedBadges).toBeDefined();
    });
  });
});