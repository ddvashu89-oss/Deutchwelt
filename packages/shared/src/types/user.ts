import { UserRole, GermanLevel } from './enums.js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  currentLevel: GermanLevel;
  learningGoal?: string | null;
  preferredLanguage: string;
  dailyGoalMinutes: number;
  streakCount: number;
  lastActiveDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  bio?: string | null;
  qualifications?: string | null;
  specialization?: string | null;
  maxBatches: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
}
