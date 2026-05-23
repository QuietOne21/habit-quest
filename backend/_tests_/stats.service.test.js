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
  }
}));

// Dynamic imports come AFTER the mock setup
// This ensures the service gets the fake db
const { default: pool } = await import('../src/config/db.js');

const {
  getHabits,
  createHabit,
  deleteHabit,
  toggleEntry,
  resetMonth,
} = await import('../src/services/habits.service.js');

// ─────────────────────────────────────────────
describe('Habits Service', () => {

  // Clear all mock call history before each test
  // Prevents one test affecting the next
  beforeEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────
  describe('getHabits()', () => {

    it('returns list of active habits for a user', async () => {
      // ARRANGE
      // Tell the fake db what to return when execute() is called
      const mockHabits = [
        { id: 1, name: 'Push-Ups',    color: '#67E8F9', is_active: 1 },
        { id: 2, name: 'Cold Shower', color: '#A78BFA', is_active: 1 },
      ];
      pool.execute.mockResolvedValueOnce([mockHabits]);
      // mockResolvedValueOnce = return this value ONE time
      // then stop (next call will need its own mock)

      // ACT
      const result = await getHabits(42);

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Push-Ups');
      expect(result[1].name).toBe('Cold Shower');

      // Verify the correct user id was passed to the query
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE  user_id'),
        [42]
      );
    });

    it('returns empty array when user has no habits', async () => {
      // Empty array means no rows found in the database
      pool.execute.mockResolvedValueOnce([[]]);

      const result = await getHabits(99);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ─────────────────────────────────────────
  describe('createHabit()', () => {

    it('inserts a habit and returns it', async () => {
      // First execute = INSERT → returns insertId
      pool.execute
        .mockResolvedValueOnce([{ insertId: 7 }])
        // Second execute = SELECT the new row
        .mockResolvedValueOnce([[{
          id:        7,
          name:      'Meditate',
          color:     '#A78BFA',
          is_active: 1,
          daily_goal: 1,
          sort_order: 0,
        }]]);

      const result = await createHabit(1, {
        name:      'Meditate',
        color:     '#A78BFA',
        dailyGoal: 1,
      });

      expect(result.id).toBe(7);
      expect(result.name).toBe('Meditate');
      expect(result.color).toBe('#A78BFA');
    });

    it('uses default color if none provided', async () => {
      pool.execute
        .mockResolvedValueOnce([{ insertId: 8 }])
        .mockResolvedValueOnce([[{
          id: 8, name: 'Journal',
          color: '#7C3AED', is_active: 1
        }]]);

      const result = await createHabit(1, { name: 'Journal' });

      // Should not throw even without color
      expect(result.id).toBe(8);
    });
  });

  // ─────────────────────────────────────────
  describe('deleteHabit()', () => {

    it('soft deletes the habit by setting is_active to 0', async () => {
      pool.execute
        // First: SELECT to verify ownership
        .mockResolvedValueOnce([[{ id: 3 }]])
        // Second: UPDATE is_active = 0
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      await deleteHabit(1, 3);

      // Verify the UPDATE query contains is_active = 0
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 0'),
        [3, 1]
      );
    });

    it('does NOT use DELETE query (data is preserved)', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 3 }]])
        .mockResolvedValueOnce([{}]);

      await deleteHabit(1, 3);

      // None of the execute calls should use DELETE
      const calls = pool.execute.mock.calls;
      calls.forEach(call => {
        expect(call[0]).not.toContain('DELETE');
      });
    });

    it('throws 404 if habit does not exist', async () => {
      // Empty array = no habit found with this id and user_id
      pool.execute.mockResolvedValueOnce([[]]);

      await expect(deleteHabit(1, 999))
        .rejects.toThrow('Habit not found.');
    });

    it('throws 404 if habit belongs to a different user', async () => {
      // When we query WHERE id=5 AND user_id=1
      // but habit 5 belongs to user 2, we get no results
      pool.execute.mockResolvedValueOnce([[]]);

      await expect(deleteHabit(1, 5))
        .rejects.toThrow('Habit not found.');
    });
  });

  // ─────────────────────────────────────────
  describe('toggleEntry()', () => {

    it('marks a habit as completed for a date', async () => {
      pool.execute
        // 1. Habit ownership check
        .mockResolvedValueOnce([[{ id: 1, name: 'Push-Ups' }]])
        // 2. INSERT ON DUPLICATE KEY UPDATE
        .mockResolvedValueOnce([{}])
        // 3. updateUserStats: SELECT user
        .mockResolvedValueOnce([[]])
        // 4. SELECT updated entry to return
        .mockResolvedValueOnce([[{
          id:         1,
          habit_id:   1,
          habit_name: 'Push-Ups',
          completed:  1,
          entry_date: '2025-04-15',
        }]]);

      await toggleEntry(1, {
        habitId:   1,
        date:      '2025-04-15',
        completed: true,
      });

      // Verify the UPSERT was called
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('ON DUPLICATE KEY UPDATE'),
        [1, 1, '2025-04-15', true, 1]
        // [habitId, userId, date, completed, value]
      );
    });

    it('marks a habit as NOT completed (untick)', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 1, name: 'Push-Ups' }]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{
          id: 1, habit_id: 1,
          completed: 0, entry_date: '2025-04-15'
        }]]);

      await toggleEntry(1, {
        habitId:   1,
        date:      '2025-04-15',
        completed: false,
      });

      // When completed=false, value should be 0
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('ON DUPLICATE KEY UPDATE'),
        [1, 1, '2025-04-15', false, 0]
      );
    });

    it('throws 404 if habit does not belong to user', async () => {
      // Ownership check returns empty
      pool.execute.mockResolvedValueOnce([[]]);

      await expect(
        toggleEntry(1, {
          habitId:   99,
          date:      '2025-04-15',
          completed: true,
        })
      ).rejects.toThrow('Habit not found.');
    });
  });

  // ─────────────────────────────────────────
  describe('resetMonth()', () => {

    it('deletes all entries for a specific month', async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 30 }]);

      await resetMonth(1, 2025, 4);

      // Verify DELETE was called with correct args
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM habit_entries'),
        [1, 2025, 4]
        // [userId, year, month]
      );
    });

    it('does not throw if there are no entries to delete', async () => {
      // affectedRows: 0 means nothing was deleted
      // This is fine — not an error
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await expect(resetMonth(1, 2025, 1))
        .resolves.toBeUndefined();
    });
  });
});