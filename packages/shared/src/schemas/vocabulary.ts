import { z } from 'zod';
import { GermanLevel, GermanArticle, PartOfSpeech } from '../types/enums.js';

export const createVocabularySchema = z.object({
  german: z.string().trim().min(1).max(100),
  english: z.string().trim().min(1).max(150),
  hindi: z.string().trim().max(150).optional().nullable(),
  article: z.nativeEnum(GermanArticle).default(GermanArticle.NONE),
  plural: z.string().trim().max(100).optional().nullable(),
  partOfSpeech: z.nativeEnum(PartOfSpeech),
  level: z.nativeEnum(GermanLevel),
  category: z.string().trim().min(2).max(100),
  exampleSentenceDe: z.string().trim().min(3),
  exampleSentenceEn: z.string().trim().min(3),
  exampleSentenceHi: z.string().trim().optional().nullable(),
  ipa: z.string().trim().max(100).optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().trim()).default([]),
  difficulty: z.number().int().min(1).max(5).default(1)
});

export const updateVocabProgressSchema = z.object({
  quality: z.number().int().min(0).max(5) // 0-2 = fail/reset, 3-5 = correct/advance Leitner box
});

export const vocabularyQuerySchema = z.object({
  level: z.nativeEnum(GermanLevel).optional(),
  category: z.string().optional(),
  article: z.nativeEnum(GermanArticle).optional(),
  partOfSpeech: z.nativeEnum(PartOfSpeech).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabProgressInput = z.infer<typeof updateVocabProgressSchema>;
export type VocabularyQueryInput = z.infer<typeof vocabularyQuerySchema>;
