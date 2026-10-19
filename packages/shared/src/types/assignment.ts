import { GermanLevel, SubmissionStatus } from './enums.js';

export interface Assignment {
  id: string;
  courseId?: string | null;
  batchId?: string | null;
  teacherId: string;
  title: string;
  description: string;
  level: GermanLevel;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  rubricCriteria: Array<{
    name: string;
    description: string;
    maxPoints: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string; // Written submission text
  attachmentUrl?: string | null;
  status: SubmissionStatus;
  score?: number | null;
  teacherFeedback?: string | null;
  evaluatedAt?: string | null;
  submittedAt: string;
  rubricScores?: Record<string, number> | null;
  assignment?: Assignment;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
