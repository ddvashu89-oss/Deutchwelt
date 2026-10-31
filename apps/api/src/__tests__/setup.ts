import { randomBytes } from 'node:crypto';

process.env.TEST_ADMIN_PASSWORD = randomBytes(24).toString('base64url');
process.env.TEST_TEACHER_PASSWORD = randomBytes(24).toString('base64url');
process.env.TEST_STUDENT_PASSWORD = randomBytes(24).toString('base64url');
