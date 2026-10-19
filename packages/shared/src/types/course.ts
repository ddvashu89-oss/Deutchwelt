import { GermanLevel, PublicationStatus, LessonContentType } from './enums.js';

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: GermanLevel;
  learningObjectives: string[];
  estimatedHours: number;
  thumbnailUrl?: string | null;
  status: PublicationStatus;
  order: number;
  units?: CourseUnit[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseUnit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  durationMinutes: number;
  order: number;
  status: PublicationStatus;
  contentBlocks?: LessonContentBlock[];
  isCompleted?: boolean;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContentBlock {
  id: string;
  lessonId: string;
  type: LessonContentType;
  title?: string | null;
  content: string; // Markdown or rich text
  mediaUrl?: string | null;
  transcript?: string | null;
  order: number;
  meta?: Record<string, any> | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string | null;
  course?: Course;
}
