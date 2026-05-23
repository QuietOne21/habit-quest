import { jest } from '@jest/globals';

// Mock the database module BEFORE importing
// the service that uses it
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    execute: jest.fn(),
    query:   jest.fn(),
  }
}));

// Dynamic imports AFTER mocking
const { default: pool }       = await import('../src/config/db.js');
const { register, login }     = await import('../src/services/auth.service.js');

// ─────────────────────────────────────────────
describe('Auth Service', () => {

  // Reset all mocks before each test
  // Stops one test's setup affecting the next
  beforeEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────
  describe('register()', () => {

    it('creates a new user and returns a token', async () => {
      // Arrange — configure what the fake DB returns
      pool.execute
        .mockResolvedValueOnce([[]])
        // Call 1: SELECT email check → empty = not taken
        .mockResolvedValueOnce([[]])
        // Call 2: SELECT username check → empty = not taken
        .mockResolvedValueOnce([{ insertId: 1 }])
        // Call 3: INSERT user → returns new id
        .mockResolvedValueOnce([[{
          id: 1, username: 'alex', email: 'alex@test.com',
          xp: 0, level: 1, current_streak: 0, longest_streak: 0
        }]]);
        // Call 4: SELECT user → returns full user row

      pool.query.mockResolvedValueOnce([{}]);
      // seedDefaultHabits bulk INSERT

      // Act
      const result = await register({
        username: 'alex',
        email:    'alex@test.com',
        password: 'password123',
      });

      // Assert
      expect(result.token).toBeDefined();
      expect(result.username).toBe('alex');
      expect(result.level).toBe(1);
      expect(result.xp).toBe(0);
    });

    it('throws 400 if email is already registered', async () => {
      // First DB call returns an existing user
      pool.execute.mockResolvedValueOnce([[{ id: 99 }]]);

      await expect(
        register({ username: 'new', email: 'taken@test.com', password: 'password123' })
      ).rejects.toThrow('Email is already registered.');
    });

    it('throws 400 if username is already taken', async () => {
      pool.execute
        .mockResolvedValueOnce([[]])
        // email check passes
        .mockResolvedValueOnce([[{ id: 5 }]]);
        // username check fails

      await expect(
        register({ username: 'taken', email: 'new@test.com', password: 'password123' })
      ).rejects.toThrow('Username is already taken.');
    });
  });

  // ─────────────────────────────────────────
  describe('login()', () => {

    it('returns token for valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hash   = await bcrypt.default.hash('password123', 12);

      pool.execute.mockResolvedValueOnce([[{
        id: 1, username: 'alex', email: 'alex@test.com',
        password_hash:  hash,
        xp: 100, level: 2,
        current_streak: 5, longest_streak: 15,
      }]]);

      const result = await login({
        email:    'alex@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.username).toBe('alex');
      expect(result.level).toBe(2);
    });

    it('throws 401 if user does not exist', async () => {
      pool.execute.mockResolvedValueOnce([[]]);
      // Empty array = user not found

      await expect(
        login({ email: 'nobody@test.com', password: 'pass' })
      ).rejects.toThrow('Invalid email or password.');
    });

    it('throws 401 if password is wrong', async () => {
      const bcrypt = await import('bcryptjs');
      const hash   = await bcrypt.default.hash('correctpassword', 12);

      pool.execute.mockResolvedValueOnce([[{
        id: 1, username: 'alex', email: 'alex@test.com',
        password_hash:  hash,
        xp: 0, level: 1,
        current_streak: 0, longest_streak: 0,
      }]]);

      await expect(
        login({ email: 'alex@test.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid email or password.');
    });

    it('gives same error for wrong email and wrong password', async () => {
      // Security test: both cases return identical message
      // Prevents attackers discovering valid emails

      pool.execute.mockResolvedValueOnce([[]]); // user not found

      const error1 = await login({ email: 'x@x.com', password: 'x' }).catch(e => e);

      const bcrypt = await import('bcryptjs');
      const hash   = await bcrypt.default.hash('correct', 12);
      pool.execute.mockResolvedValueOnce([[{
        id: 1, username: 'u', email: 'u@u.com',
        password_hash: hash,
        xp: 0, level: 1, current_streak: 0, longest_streak: 0,
      }]]);

      const error2 = await login({ email: 'u@u.com', password: 'wrong' }).catch(e => e);

      // Both errors have the exact same message
      expect(error1.message).toBe(error2.message);
    });
  });
});