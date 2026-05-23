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

  beforeEach(() => jest.clearAllMocks());

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
        expect.stringContaining('WHERE  user_id'),
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

    it('throws 404 if habit belongs to another user', async () => {
      pool.execute.mockResolvedValueOnce([[]]); // wrong user_id check fails

      await expect(deleteHabit(1, 5))
        .rejects.toThrow('Habit not found.');
    });
  });

  // ─────────────────────────────────────────
  describe('toggleEntry()', () => {

    it('creates entry when habit is ticked', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 1, name: 'Push-Ups' }]])
        // habit ownership check
        .mockResolvedValueOnce([{}])
        // INSERT/UPDATE entry
        .mockResolvedValueOnce([[]])
        // updateUserStats: SELECT user
        .mockResolvedValueOnce([[{
          id: 1, habit_name: 'Push-Ups',
          completed: 1, entry_date: '2025-04-15'
        }]]);
        // final SELECT entry

      await toggleEntry(1, {
        habitId:   1,
        date:      '2025-04-15',
        completed: true,
      });

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('ON DUPLICATE KEY UPDATE'),
        [1, 1, '2025-04-15', true, 1]
      );
    });

    it('throws 404 if habit does not belong to user', async () => {
      pool.execute.mockResolvedValueOnce([[]]); // not found

      await expect(toggleEntry(1, { habitId: 99, date: '2025-04-15', completed: true }))
        .rejects.toThrow('Habit not found.');
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