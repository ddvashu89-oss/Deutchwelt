import { z } from 'zod';
import { GermanLevel, PublicationStatus, LessonContentType } from '../types/enums.js';

export const createCourseSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10),
  level: z.nativeEnum(GermanLevel),
  learningObjectives: z.array(z.string().trim().min(2)).min(1),
  estimatedHours: z.number().int().min(1).max(300),
  thumbnailUrl: z.string().url().optional().nullable(),
  status: z.nativeEnum(PublicationStatus).default(PublicationStatus.DRAFT),
  order: z.number().int().default(0)
});

export const updateCourseSchema = createCourseSchema.partial();

export const createUnitSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5),
  order: z.number().int().default(0)
});

export const createLessonSchema = z.object({
  unitId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5),
  durationMinutes: z.number().int().min(1).max(240).default(15),
  order: z.number().int().default(0),
  status: z.nativeEnum(PublicationStatus).default(PublicationStatus.PUBLISHED)
});

export const createContentBlockSchema = z.object({
  lessonId: z.string().uuid(),
  type: z.nativeEnum(LessonContentType),
  title: z.string().trim().max(150).optional().nullable(),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional().nullable(),
  transcript: z.string().optional().nullable(),
  order: z.number().int().default(0),
  meta: z.record(z.any()).optional().nullable()
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateContentBlockInput = z.infer<typeof createContentBlockSchema>;
