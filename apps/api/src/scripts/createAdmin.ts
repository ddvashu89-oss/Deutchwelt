import dotenv from 'dotenv';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const firstName = process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim();
const lastName = process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim();

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  throw new Error('Set a valid BOOTSTRAP_ADMIN_EMAIL before running this command.');
}
if (!password || password.length < 14) {
  throw new Error('Set a unique BOOTSTRAP_ADMIN_PASSWORD of at least 14 characters before running this command.');
}
if (!firstName || !lastName) {
  throw new Error('Set BOOTSTRAP_ADMIN_FIRST_NAME and BOOTSTRAP_ADMIN_LAST_NAME before running this command.');
}

const prisma = new PrismaClient();

try {
  const [existingUser, existingAdmin] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findFirst({ where: { role: UserRole.ADMIN }, select: { id: true } })
  ]);
  if (existingUser) throw new Error('That email already has an account; no account was changed.');
  if (existingAdmin) throw new Error('An administrator already exists; this one-time bootstrap command is disabled.');

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      firstName,
      lastName,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true
    }
  });
  console.log(`Initial administrator created for ${email}. Remove the BOOTSTRAP_ADMIN_* values from the deployment environment now.`);
} finally {
  await prisma.$disconnect();
}
