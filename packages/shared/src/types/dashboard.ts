import { GermanLevel, EnquiryStatus } from './enums.js';

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  level: GermanLevel;
  message: string;
  status: EnquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardStats {
  level: GermanLevel;
  streakDays: number;
  dailyGoalMinutes: number;
  minutesSpentToday: number;
  wordsLearned: number;
  wordsMastered: number;
  exerciseAccuracy: number;
  completedLessonsCount: number;
  enrolledCoursesCount: number;
  upcomingAssignmentsCount: number;
  recentActivity: Array<{
    id: string;
    type: 'LESSON_COMPLETED' | 'VOCAB_PRACTICED' | 'EXERCISE_COMPLETED' | 'SPEAKING_RECORDED' | 'ASSIGNMENT_SUBMITTED';
    title: string;
    timestamp: string;
    score?: number | null;
  }>;
}

export interface TeacherDashboardStats {
  totalBatches: number;
  totalStudents: number;
  pendingSubmissionsCount: number;
  reviewedThisWeek: number;
  averageScorePercentage: number;
  recentSubmissions: Array<{
    id: string;
    studentName: string;
    assignmentTitle: string;
    submittedAt: string;
    type: 'WRITING' | 'SPEAKING';
  }>;
}

export interface AdminAnalytics {
  totalStudents: number;
  activeStudentsLast30Days: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCompletedLessons: number;
  averageExerciseScore: number;
  enquiriesCount: number;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  levelDistribution: Array<{
    level: string;
    count: number;
  }>;
  courseEnrollmentBreakdown: Array<{
    courseTitle: string;
    enrollments: number;
  }>;
}
