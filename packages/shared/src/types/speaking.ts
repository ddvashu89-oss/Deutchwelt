import { GermanLevel, SubmissionStatus } from './enums.js';

export interface SpeakingPrompt {
  id: string;
  title: string;
  topic: string;
  level: GermanLevel;
  scenario: string;
  instructions: string;
  sampleAnswerDe?: string | null;
  sampleAnswerEn?: string | null;
  minDurationSeconds: number;
  maxDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpeakingAttempt {
  id: string;
  userId: string;
  promptId: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  transcriptText?: string | null;
  status: SubmissionStatus;
  score?: number | null;
  teacherFeedback?: string | null;
  teacherId?: string | null;
  rubricScores?: {
    pronunciation?: number;
    grammar?: number;
    fluency?: number;
    vocabulary?: number;
  } | null;
  submittedAt: string;
  evaluatedAt?: string | null;
  prompt?: SpeakingPrompt;
}
