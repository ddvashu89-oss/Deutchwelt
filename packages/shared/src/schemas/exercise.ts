import { z } from 'zod';
import { ExerciseType, GermanLevel } from '../types/enums.js';

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string())
  ])
});

export const submitExerciseAttemptSchema = z.object({
  exerciseId: z.string().uuid(),
  answers: z.array(submitAnswerSchema).min(1)
});

export const createExerciseQuestionSchema = z.object({
  type: z.nativeEnum(ExerciseType),
  prompt: z.string().trim().min(2),
  instructions: z.string().trim().optional().nullable(),
  hint: z.string().trim().optional().nullable(),
  explanation: z.string().trim().optional().nullable(),
  points: z.number().int().min(1).default(1),
  order: z.number().int().default(0),
  contextPassage: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  options: z.array(z.object({
    label: z.string().min(1),
    isCorrect: z.boolean().default(false),
    order: z.number().int().default(0)
  })).optional(),
  correctAnswer: z.any()
});

export const createExerciseSchema = z.object({
  lessonId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().optional().nullable(),
  level: z.nativeEnum(GermanLevel),
  type: z.nativeEnum(ExerciseType),
  passingScore: z.number().min(0).max(100).default(70),
  questions: z.array(createExerciseQuestionSchema).min(1)
});

export type SubmitExerciseAttemptInput = z.infer<typeof submitExerciseAttemptSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
