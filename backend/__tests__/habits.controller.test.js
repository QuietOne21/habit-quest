import { jest }   from '@jest/globals';
import request    from 'supertest';

// Mock habits service
jest.unstable_mockModule('../src/services/habits.service.js', () => ({
  getHabits:       jest.fn(),
  createHabit:     jest.fn(),
  updateHabit:     jest.fn(),
  deleteHabit:     jest.fn(),
  toggleEntry:     jest.fn(),
  getMonthEntries: jest.fn(),
  resetMonth:      jest.fn(),
}));

// Mock auth middleware
// Pretend every request comes from user id 1
jest.unstable_mockModule('../src/middleware/auth.js', () => ({
  default: (req, _res, next) => {
    req.user = { id: 1, username: 'testuser' };
    next();
  }
}));

// Mock rate limiter
// Skip rate limiting in tests
jest.unstable_mockModule('../src/middleware/rateLimiter.js', () => ({
  globalLimiter:   (_req, _res, next) => next(),
  authLimiter:     (_req, _res, next) => next(),
  registerLimiter: (_req, _res, next) => next(),
  apiLimiter:      (_req, _res, next) => next(),
}));

// Mock db for server startup
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    execute:       jest.fn().mockResolvedValue([[]]),
    query:         jest.fn().mockResolvedValue([[]]),
    getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
  }
}));

const { default: app }    = await import('../server.js');
const habitsService        = await import('../src/services/habits.service.js');

describe('Habits Controller', () => {

  beforeEach(() => jest.resetAllMocks());

  // ─────────────────────────────────────────
  describe('GET /api/habits', () => {

    it('returns 200 with list of habits', async () => {
      const mockHabits = [
        { id: 1, name: 'Push-Ups', color: '#67E8F9' },
        { id: 2, name: 'Read',     color: '#A78BFA' },
      ];
      habitsService.getHabits.mockResolvedValue(mockHabits);

      const res = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer test.token.here');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Push-Ups');
    });

    it('returns 200 with empty array if no habits', async () => {
      habitsService.getHabits.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer test.token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─────────────────────────────────────────
  describe('POST /api/habits', () => {

    it('returns 201 with created habit', async () => {
      const newHabit = { id: 5, name: 'Meditate', color: '#FCD34D' };
      habitsService.createHabit.mockResolvedValue(newHabit);

      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', 'Bearer test.token')
        .send({ name: 'Meditate', color: '#FCD34D', dailyGoal: 1 });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Meditate');
    });

    it('returns 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', 'Bearer test.token')
        .send({ color: '#FCD34D' });
        // No name!

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 400 if color is invalid hex', async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', 'Bearer test.token')
        .send({ name: 'Test', color: 'notahexcolor' });

      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────
  describe('DELETE /api/habits/:id', () => {

    it('returns 204 on successful delete', async () => {
      habitsService.deleteHabit.mockResolvedValue();

      const res = await request(app)
        .delete('/api/habits/1')
        .set('Authorization', 'Bearer test.token');

      expect(res.status).toBe(204);
    });

    it('returns 404 if habit not found', async () => {
      const err = new Error('Habit not found.');
      err.statusCode = 404;
      habitsService.deleteHabit.mockRejectedValue(err);

      const res = await request(app)
        .delete('/api/habits/999')
        .set('Authorization', 'Bearer test.token');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Habit not found.');
    });
  });

  // ─────────────────────────────────────────
  describe('POST /api/habits/toggle', () => {

    it('returns 200 with toggled entry', async () => {
      habitsService.toggleEntry.mockResolvedValue({
        id: 1, habitId: 1, date: '2025-04-15', completed: true
      });

      const res = await request(app)
        .post('/api/habits/toggle')
        .set('Authorization', 'Bearer test.token')
        .send({ habitId: 1, date: '2025-04-15', completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });
  });
});