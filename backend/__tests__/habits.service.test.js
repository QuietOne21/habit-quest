import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: { execute: jest.fn(), query: jest.fn() }
}));

const { default: pool } = await import('../src/config/db.js');
const {
  getHabits, createHabit, deleteHabit,
  toggleEntry, resetMonth
} = await import('../src/services/habits.service.js');

describe('Habits Service', () => {

  beforeEach(() => jest.resetAllMocks());

  // ─────────────────────────────────────────
  describe('getHabits()', () => {

    it('returns list of active habits', async () => {
      const mockHabits = [
        { id: 1, name: 'Push-Ups',    color: '#67E8F9', is_active: 1 },
        { id: 2, name: 'Cold Shower', color: '#A78BFA', is_active: 1 },
      ];
      pool.execute.mockResolvedValueOnce([mockHabits]);

      const result = await getHabits(42);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Push-Ups');
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id'),
        [42]
      );
    });

    it('returns empty array when user has no habits', async () => {
      pool.execute.mockResolvedValueOnce([[]]);
      const result = await getHabits(99);
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────
  describe('createHabit()', () => {

    it('inserts and returns the new habit', async () => {
      pool.execute
        .mockResolvedValueOnce([{ insertId: 7 }])
        .mockResolvedValueOnce([[{
          id: 7, name: 'Meditate', color: '#A78BFA', is_active: 1
        }]]);

      const result = await createHabit(1, {
        name: 'Meditate', color: '#A78BFA', dailyGoal: 1
      });

      expect(result.id).toBe(7);
      expect(result.name).toBe('Meditate');
    });
  });

  // ─────────────────────────────────────────
  describe('deleteHabit()', () => {

    it('soft deletes the habit (sets is_active to 0)', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 3 }]])
        // SELECT existing — found
        .mockResolvedValueOnce([{}]);
        // UPDATE is_active = 0

      await deleteHabit(1, 3);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 0'),
        [3, 1]
      );
    });

    it('throws 404 if habit does not exist', async () => {
      pool.execute.mockResolvedValueOnce([[]]); // not found

      await expect(deleteHabit(1, 999))
        .rejects.toThrow('Habit not found.');
    });

        it('throws 404 if habit does not belong to user', async () => {
      // Ownership check returns empty = habit not found for this user
      pool.execute.mockResolvedValueOnce([[]]);
      // Add fallback mocks in case code continues past the throw
      pool.execute.mockResolvedValue([[]]);

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
    describe('toggleEntry()', () => {

    it('creates entry when habit is ticked', async () => {
      // 1. Ownership check
      pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'Push-Ups' }]]);
      // 2. INSERT ON DUPLICATE KEY UPDATE
      pool.execute.mockResolvedValueOnce([{}]);
      // 3. updateUserStats: SELECT user
      pool.execute.mockResolvedValueOnce([[{
        id: 1, xp: 0, level: 1, current_streak: 0, longest_streak: 0
      }]]);
      // 4. updateUserStats: SELECT completed dates
      pool.execute.mockResolvedValueOnce([[]]);
      // 5. updateUserStats: UPDATE user
      pool.execute.mockResolvedValueOnce([{}]);
      // 6. SELECT entry to return
      pool.execute.mockResolvedValueOnce([[{
        id: 1, habit_id: 1, habit_name: 'Push-Ups',
        completed: 1, entry_date: '2025-04-15'
      }]]);

      const result = await toggleEntry(1, {
        habitId: 1, date: '2025-04-15', completed: true,
      });

      // Check the UPSERT call (index 1 in the call history)
      const calls = pool.execute.mock.calls;
      expect(calls[1][0]).toContain('ON DUPLICATE KEY UPDATE');
      expect(calls[1][1]).toEqual([1, 1, '2025-04-15', true, 1]);
      expect(result.completed).toBe(1);
    });

    it('marks a habit as NOT completed (untick)', async () => {
      pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'Push-Ups' }]]);
      pool.execute.mockResolvedValueOnce([{}]);
      pool.execute.mockResolvedValueOnce([[{
        id: 1, xp: 10, level: 1, current_streak: 1, longest_streak: 1
      }]]);
      pool.execute.mockResolvedValueOnce([[{ entry_date: '2025-04-14' }]]);
      pool.execute.mockResolvedValueOnce([{}]);
      pool.execute.mockResolvedValueOnce([[{
        id: 1, habit_id: 1, completed: 0, entry_date: '2025-04-15'
      }]]);

      const result = await toggleEntry(1, {
        habitId: 1, date: '2025-04-15', completed: false,
      });

      const calls = pool.execute.mock.calls;
      expect(calls[1][1]).toEqual([1, 1, '2025-04-15', false, 0]);
      expect(result.completed).toBe(0);
    });

    it('throws 404 if habit does not belong to user', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      await expect(
        toggleEntry(1, {
          habitId: 99, date: '2025-04-15', completed: true,
        })
      ).rejects.toThrow('Habit not found.');
    });
  });
  
  // ─────────────────────────────────────────
  describe('resetMonth()', () => {

    it('deletes all entries for the month', async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 30 }]);

      await resetMonth(1, 2025, 4);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM habit_entries'),
        [1, 2025, 4]
      );
    });
  });
});