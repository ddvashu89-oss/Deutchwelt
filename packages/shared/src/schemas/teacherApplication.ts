import { z } from 'zod';

export const teacherApplicationSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254).toLowerCase(),
  phone: z.string().trim().max(40).optional().default(''),
  germanProficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE']),
  teachingExperienceYears: z.coerce.number().int().min(0).max(60),
  qualifications: z.string().trim().min(2).max(4000),
  specialization: z.string().trim().min(2).max(2000),
  availability: z.string().trim().min(2).max(2000),
  motivation: z.string().trim().min(20).max(5000),
  preferredLanguage: z.enum(['en', 'de']).default('en'),
  consentToPrivacy: z.literal(true)
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;
