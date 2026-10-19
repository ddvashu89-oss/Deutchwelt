import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('DeutschWelt API End-to-End Route Integration Tests', () => {
  it('GET /api/v1/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('DeutschWelt API');
  });

  it('GET /api/v1/courses returns published German courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/courses/:slug returns course details and curriculum', async () => {
    const res = await request(app).get('/api/v1/courses/deutsch-a1-beginner-intensiv');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.level).toBe('A1');
    expect(Array.isArray(res.body.course.units)).toBe(true);
  });

  it('POST /api/v1/enquiries accepts valid inquiries', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries')
      .send({
        name: 'Sophie Miller',
        email: 'sophie.miller@example.com',
        phone: '+44 7911 123456',
        level: 'A2',
        message: 'I am interested in preparing for the Goethe-Zertifikat A2 examination.',
        consentToContact: true
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/auth/login validates credentials accurately', async () => {
    // Valid student login
    const validRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@deutschwelt.de',
        password: 'StudentDeutschWelt2026!'
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.user.email).toBe('student@deutschwelt.de');
    expect(validRes.header['set-cookie']).toBeDefined();

    // Invalid password
    const invalidRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@deutschwelt.de',
        password: 'WrongPassword!'
      });

    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.success).toBe(false);
  });

  it('Protected route rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/student/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
