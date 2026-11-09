import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN (
        'User', 'users', 'TeacherProfile', 'teacher_profiles',
        'TeacherBatch', 'teacher_batches', 'TeacherBatchAssignment',
        'teacher_batch_assignments', 'BatchMembership', 'batch_memberships',
        'Exam', 'ExamAttempt'
      )
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);
  console.log('[Read-only schema inspection]', JSON.stringify(rows));
} finally {
  await prisma.$disconnect();
}
