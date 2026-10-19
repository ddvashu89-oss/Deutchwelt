import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, ApiError } from '../lib/api.js';
import { UserRole } from '@deutschwelt/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  role: UserRole;
  studentProfile?: any;
  teacherProfile?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res: any = await api.post('/auth/login', credentials);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    return null;
  };

  const register = async (data: any) => {
    const res: any = await api.post('/auth/register', data);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const isStudent = user?.role === UserRole.STUDENT;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isStudent,
        isTeacher,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
