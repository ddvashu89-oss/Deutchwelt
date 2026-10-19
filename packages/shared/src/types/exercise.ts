import { ExerciseType, GermanLevel } from './enums.js';

export interface ExerciseOption {
  id: string;
  label: string;
  isCorrect?: boolean; // Kept server-side or hidden from student attempts
  order: number;
}

export interface ExerciseQuestion {
  id: string;
  exerciseId: string;
  type: ExerciseType;
  prompt: string;
  instructions?: string | null;
  hint?: string | null;
  explanation?: string | null;
  points: number;
  order: number;
  options?: ExerciseOption[];
  correctAnswer?: string | string[] | Record<string, string>; // Kept on server
  contextPassage?: string | null; // For reading/listening
  audioUrl?: string | null;
}

export interface Exercise {
  id: string;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  level: GermanLevel;
  type: ExerciseType;
  passingScore: number;
  questions: ExerciseQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnswerSubmission {
  questionId: string;
  answer: string | string[] | Record<string, string>;
}

export interface ExerciseAttemptResult {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  breakdown: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    userAnswer: any;
    correctAnswer?: any;
    explanation?: string | null;
  }>;
}
