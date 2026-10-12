const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Contest = require('../src/models/Contest');

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codex_platform'
  );
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Codex Platform API Test Suite', () => {
  let studentToken = '';
  let instructorToken = '';
  let adminToken = '';
  let testProblemSlug = '';
  let testProblemId = '';
  let testContestId = '';

  // 1. Authentication & Authorization Tests
  describe('Authentication & Authorization', () => {
    it('should register a new student account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Newbie',
          username: `newbie_${Date.now()}`,
          email: `newbie_${Date.now()}@codex.dev`,
          password: 'password123',
          role: 'student',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('student');
    });

    it('should not allow registering directly as admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Try',
          username: `hack_${Date.now()}`,
          email: `hack_${Date.now()}@codex.dev`,
          password: 'password123',
          role: 'admin',
        });

      expect(res.statusCode).toBe(201);
      // Role is downgraded to student
      expect(res.body.user.role).toBe('student');
    });

    it('should login with seeded student account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'alex@codex.dev',
          password: 'student123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      studentToken = res.body.token;
    });

    it('should login with instructor account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'instructor@codex.dev',
          password: 'instructor123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('instructor');
      instructorToken = res.body.token;
    });

    it('should login with admin account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'admin@codex.dev',
          password: 'admin123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('should fetch current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe('alex_coder');
    });

    it('should reject unauthorized access without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  // 2. Problem Library & Test Cases
  describe('Problem Management & Library', () => {
    it('should list problems with pagination and filtering', async () => {
      const res = await request(app)
        .get('/api/problems?difficulty=Easy&limit=5');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.problems)).toBe(true);
      expect(res.body.problems.length).toBeGreaterThan(0);
      testProblemSlug = res.body.problems[0].slug;
      testProblemId = res.body.problems[0]._id;
    });

    it('should get single problem by slug and NOT expose hidden test cases to students', async () => {
      const res = await request(app)
        .get(`/api/problems/${testProblemSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.problem.slug).toBe(testProblemSlug);
      // Check that hidden test cases are not included
      const testCases = res.body.problem.testCases || [];
      testCases.forEach((tc) => {
        expect(tc.isPublic).toBe(true);
      });
    });

    it('should allow instructors to create a problem with public & hidden test cases', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: `Unit Test Problem ${Date.now()}`,
          description: 'A problem created by instructor automated test.',
          difficulty: 'Easy',
          topics: ['Math'],
          tags: ['Math'],
          testCases: [
            { input: '2', expectedOutput: '4', isPublic: true },
            { input: '5', expectedOutput: '10', isPublic: false },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.problem._id).toBeDefined();
    });

    it('should block students from creating problems (RBAC)', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Forbidden Problem',
          description: 'Should fail',
          difficulty: 'Easy',
        });

      expect(res.statusCode).toBe(403);
    });
  });

  // 3. Contest System
  describe('Contest System', () => {
    it('should list all contests with server time', async () => {
      const res = await request(app).get('/api/contests');
      expect(res.statusCode).toBe(200);
      expect(res.body.serverTime).toBeDefined();
      expect(res.body.contests.length).toBeGreaterThan(0);
      testContestId = res.body.contests[0]._id;
    });

    it('should fetch contest leaderboard', async () => {
      const res = await request(app).get(`/api/contests/${testContestId}/leaderboard`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
    });
  });

  // 4. Leaderboard & Coding Profile
  describe('Leaderboard & Profile', () => {
    it('should return global leaderboard ranking', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
      expect(res.body.leaderboard.length).toBeGreaterThan(0);
      expect(res.body.leaderboard[0].rank).toBe(1);
    });

    it('should return public coding profile with stats and activity heatmap', async () => {
      const res = await request(app).get('/api/users/alex_coder');
      expect(res.statusCode).toBe(200);
      expect(res.body.profile.username).toBe('alex_coder');
      expect(res.body.profile.stats).toBeDefined();
      expect(res.body.profile.activityHeatmap).toBeDefined();
    });
  });

  // 5. Admin Functionality
  describe('Admin Platform Controls', () => {
    it('should allow admin to view full platform stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.stats.users.total).toBeGreaterThan(0);
      expect(res.body.stats.problems.total).toBeGreaterThan(0);
    });

    it('should reject non-admin from admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
