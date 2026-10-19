import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { ErrorBoundary } from './components/ui/ErrorBoundary.js';

// Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { CoursesPage } from './pages/public/CoursesPage.js';
import { CourseDetailPage } from './pages/public/CourseDetailPage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { FAQPage } from './pages/public/FAQPage.js';
import { PrivacyPolicyPage, TermsOfServicePage, CookieNoticePage } from './pages/public/LegalPages.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/auth/ForgotPasswordPage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { LessonPlayerPage } from './pages/student/LessonPlayerPage.js';
import { VocabularyTrainerPage } from './pages/student/VocabularyTrainerPage.js';
import { SpeakingLabPage } from './pages/student/SpeakingLabPage.js';
import { AssignmentsPage } from './pages/student/AssignmentsPage.js';
import { StudentProfilePage } from './pages/student/StudentProfilePage.js';
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage.js';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage.js';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.js';
import { TeacherSubmissionsPage } from './pages/teacher/TeacherSubmissionsPage.js';
import { TeacherBatchesPage } from './pages/teacher/TeacherBatchesPage.js';
import { TeacherAssignmentCreator } from './pages/teacher/TeacherAssignmentCreator.js';
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage.js';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage.js';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage.js';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage.js';
import { AdminSettingsPage, AdminAuditLogsPage } from './pages/admin/AdminSettingsPage.js';

const queryClient = new QueryClient();

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory text-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy text-white font-extrabold flex items-center justify-center text-sm">
            DW
          </div>
          <span className="font-heading font-extrabold text-2xl text-navy">
            Deutsch<span className="text-germanRed">Welt</span>
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border-4 border-navy border-t-germanRed animate-spin" />
        <p className="mt-3 text-xs font-semibold text-dark-muted">Laden...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Marketing & Courses Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:slug" element={<CourseDetailPage />} />
                  <Route path="/vocabulary" element={<VocabularyTrainerPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/cookies" element={<CookieNoticePage />} />
                </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCoursesPage />} />
              <Route path="materials" element={<StudentMaterialsPage />} />
              <Route path="vocabulary" element={<VocabularyTrainerPage />} />
              <Route path="speaking" element={<SpeakingLabPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>

            {/* Interactive Lesson Player */}
            <Route
              path="/lessons/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPlayerPage />
                </ProtectedRoute>
              }
            />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="submissions" element={<TeacherSubmissionsPage />} />
              <Route path="batches" element={<TeacherBatchesPage />} />
              <Route path="materials" element={<TeacherMaterialsPage />} />
              <Route path="assignments/new" element={<TeacherAssignmentCreator />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="teachers" element={<AdminTeachersPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
</ErrorBoundary>
  );
}

export default App;
