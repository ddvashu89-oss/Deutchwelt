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
  isActive?: boolean;
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
  accountBlocked: boolean;
  blockedMessage: string | null;
  dismissBlockedAlert: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountBlocked, setAccountBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      if (res.authenticated && res.user) {
        setUser(res.user);
        setAccountBlocked(false);
        setBlockedMessage(null);
      } else {
        setUser(null);
      }
    } catch (e: any) {
      if (e?.code === 'ACCOUNT_BLOCKED' || e?.status === 403 || e?.message?.includes('suspended') || e?.message?.includes('blocked')) {
        setAccountBlocked(true);
        setBlockedMessage(e?.message || 'Your student account has been suspended or blocked by an administrator.');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res: any = await api.post('/auth/login', credentials);
      if (res.success && res.user) {
        setUser(res.user);
        setAccountBlocked(false);
        setBlockedMessage(null);
        return res.user;
      }
      return null;
    } catch (err: any) {
      if (err?.code === 'ACCOUNT_BLOCKED' || err?.message?.includes('suspended') || err?.message?.includes('blocked')) {
        setAccountBlocked(true);
        setBlockedMessage(err?.message || 'Your account has been suspended or blocked by an administrator.');
      }
      throw err;
    }
  };

  const register = async (data: any) => {
    const res: any = await api.post('/auth/register', data);
    if (res.success && res.user) {
      setUser(res.user);
      setAccountBlocked(false);
      setBlockedMessage(null);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setAccountBlocked(false);
      setBlockedMessage(null);
    }
  };

  const dismissBlockedAlert = () => {
    setAccountBlocked(false);
    setBlockedMessage(null);
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
        isAdmin,
        accountBlocked,
        blockedMessage,
        dismissBlockedAlert
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
