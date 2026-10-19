import { z } from 'zod';
import { GermanLevel } from '../types/enums.js';

export const createSpeakingPromptSchema = z.object({
  title: z.string().trim().min(3).max(150),
  topic: z.string().trim().min(2).max(100),
  level: z.nativeEnum(GermanLevel),
  scenario: z.string().trim().min(10),
  instructions: z.string().trim().min(10),
  sampleAnswerDe: z.string().trim().optional().nullable(),
  sampleAnswerEn: z.string().trim().optional().nullable(),
  minDurationSeconds: z.number().int().min(5).default(15),
  maxDurationSeconds: z.number().int().max(300).default(120)
});

export const submitSpeakingAttemptSchema = z.object({
  promptId: z.string().uuid(),
  transcriptText: z.string().trim().optional().nullable(),
  durationSeconds: z.number().int().min(1).optional()
});

export const evaluateSpeakingAttemptSchema = z.object({
  score: z.number().min(0).max(100),
  teacherFeedback: z.string().trim().min(5),
  rubricScores: z.object({
    pronunciation: z.number().min(0).max(25),
    grammar: z.number().min(0).max(25),
    fluency: z.number().min(0).max(25),
    vocabulary: z.number().min(0).max(25)
  })
});

export type CreateSpeakingPromptInput = z.infer<typeof createSpeakingPromptSchema>;
export type SubmitSpeakingAttemptInput = z.infer<typeof submitSpeakingAttemptSchema>;
export type EvaluateSpeakingAttemptInput = z.infer<typeof evaluateSpeakingAttemptSchema>;
