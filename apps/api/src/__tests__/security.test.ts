import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { store } from '../services/store.js';

describe('Security & Sandbox Testbed Integration Tests', () => {
  it('GET /api/v1/system/environment returns sandbox status and security controls', async () => {
    const res = await request(app).get('/api/v1/system/environment');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.securityControls).toBeDefined();
    expect(res.body.securityControls.xssSanitization).toBe(true);
    expect(res.body.securityControls.strictCors).toBe(true);
    expect(res.body.securityControls.accountSuspensionEnforced).toBe(true);
  });

  it('XSS Sanitization middleware strips dangerous script tags and event handlers', async () => {
    const maliciousInput = {
      name: 'Tester <script>alert("xss")</script>',
      email: 'xss-safe@example.com',
      phone: '+49 12345678',
      level: 'A1',
      message: 'Hello <img src="x" onerror="stealCookies()"> and javascript:alert(1)',
      consentToContact: true
    };

    const res = await request(app)
      .post('/api/v1/enquiries')
      .send(maliciousInput);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify stored enquiry has neutralized payload
    const stored = store.enquiries.find(e => e.email === 'xss-safe@example.com');
    expect(stored).toBeDefined();
    expect(stored?.name).not.toContain('<script>');
    expect(stored?.message).not.toContain('onerror=');
    expect(stored?.message).not.toContain('javascript:');
  });

  it('POST /api/v1/system/sandbox/reset restores factory demo state', async () => {
    const res = await request(app)
      .post('/api/v1/system/sandbox/reset')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('restored to factory demo state');

    // Confirm default demo users exist
    const admin = store.users.find(u => u.email === 'admin@deutschwelt.de');
    const teacher = store.users.find(u => u.email === 'teacher@deutschwelt.de');
    const student = store.users.find(u => u.email === 'student@deutschwelt.de');

    expect(admin).toBeDefined();
    expect(teacher).toBeDefined();
    expect(student).toBeDefined();
  });

  it('Suspended / Blocked student is immediately blocked from logging in', async () => {
    // 1. Temporarily block the student in store
    const student = store.users.find(u => u.email === 'student@deutschwelt.de');
    expect(student).toBeDefined();
    student!.isActive = false;

    // 2. Attempt login as blocked student
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@deutschwelt.de',
        password: 'Student@1234'
      });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.code).toBe('ACCOUNT_BLOCKED');
    expect(loginRes.body.error).toContain('suspended or blocked');

    // 3. Unblock student back to active
    student!.isActive = true;
  });

  it('Admin login works and passwordHash is never leaked in student directory', async () => {
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@deutschwelt.de',
        password: 'Admin@1234'
      });

    expect(adminLoginRes.status).toBe(200);
    const token = adminLoginRes.body.token;

    // Fetch students list
    const studentsRes = await request(app)
      .get('/api/v1/admin/students')
      .set('Authorization', `Bearer ${token}`);

    expect(studentsRes.status).toBe(200);
    expect(studentsRes.body.success).toBe(true);
    expect(Array.isArray(studentsRes.body.students)).toBe(true);

    // Verify none of the student objects contain passwordHash
    for (const s of studentsRes.body.students) {
      expect(s.passwordHash).toBeUndefined();
    }
  });
});
