import { z } from 'zod';
import { GermanLevel } from '../types/enums.js';

export const createAssignmentSchema = z.object({
  courseId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10),
  level: z.nativeEnum(GermanLevel),
  dueDate: z.string().datetime(),
  maxPoints: z.number().int().min(10).max(100).default(100),
  instructions: z.string().trim().min(10),
  rubricCriteria: z.array(z.object({
    name: z.string().min(2),
    description: z.string().min(5),
    maxPoints: z.number().int().min(1)
  })).min(1)
});

export const submitAssignmentSchema = z.object({
  content: z.string().trim().min(10, 'Your submission must contain at least 10 characters'),
  isDraft: z.boolean().default(false)
});

export const gradeAssignmentSchema = z.object({
  score: z.number().min(0),
  teacherFeedback: z.string().trim().min(5),
  rubricScores: z.record(z.number().min(0)).optional()
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeAssignmentInput = z.infer<typeof gradeAssignmentSchema>;
