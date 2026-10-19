import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Mic,
  PenTool,
  User,
  Users,
  GraduationCap,
  ClipboardList,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  Menu,
  X,
  FileCheck,
  ShieldCheck,
  Flame,
  ChevronRight
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout, isStudent, isTeacher, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { label: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/courses', icon: BookOpen },
    { label: 'Vocabulary Trainer', href: '/student/vocabulary', icon: Layers },
    { label: 'Speaking Lab', href: '/student/speaking', icon: Mic },
    { label: 'Assignments', href: '/student/assignments', icon: PenTool },
    { label: 'Profile & Goals', href: '/student/profile', icon: User }
  ];

  const teacherLinks = [
    { label: 'Overview', href: '/teacher', icon: LayoutDashboard },
    { label: 'Batches & Students', href: '/teacher/batches', icon: Users },
    { label: 'Review Submissions', href: '/teacher/submissions', icon: ClipboardList },
    { label: 'Create Assignment', href: '/teacher/assignments/new', icon: PenTool }
  ];

  const adminLinks = [
    { label: 'Overview Analytics', href: '/admin', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
    { label: 'Course Manager', href: '/admin/courses', icon: BookOpen },
    { label: 'Contact Enquiries', href: '/admin/enquiries', icon: FileCheck },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings }
  ];

  let currentNav = studentLinks;
  if (isAdmin) currentNav = adminLinks;
  else if (isTeacher) currentNav = teacherLinks;

  const currentLevel = user?.studentProfile?.currentLevel || 'A1';
  const streakCount = user?.studentProfile?.streakCount || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-navy-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-germanRed flex items-center justify-center font-heading font-black text-white text-sm">
                DW
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Deutsch<span className="text-germanRed">Welt</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-6 py-4 border-b border-navy-800/80 bg-navy-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Workspace</span>
              <Badge variant={isAdmin ? 'germanRed' : isTeacher ? 'warning' : 'default'} className="uppercase text-[10px]">
                {user?.role || 'STUDENT'}
              </Badge>
            </div>
            {isStudent && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold text-germanRed-300">Level: {currentLevel}</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streakCount} Days Streak
                </span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== '/student/dashboard' && item.href !== '/admin' && item.href !== '/teacher' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-germanRed text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-navy-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-navy-800 transition-colors border border-navy-700"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-dark hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-xs text-dark-muted gap-1.5">
              <Link to="/" className="hover:text-dark">DeutschWelt</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-dark capitalize">
                {location.pathname.split('/')[2] || location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-dark-muted hover:text-dark hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-germanRed ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-gray-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy">Notifications</span>
                    <span className="text-[10px] bg-red-50 text-germanRed font-bold px-1.5 py-0.5 rounded">2 New</span>
                  </div>
                  <div className="divide-y divide-gray-50 text-xs max-h-60 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <p className="font-bold text-navy">Willkommen bei DeutschWelt!</p>
                      <p className="text-dark-muted mt-0.5">Welcome! Start with Einheit 1: Sich vorstellen.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                    </div>
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <p className="font-bold text-navy">Neue Schreibaufgabe</p>
                      <p className="text-dark-muted mt-0.5">Dr. Weber assigned: "Eine kurze E-Mail an das Hotel".</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/courses">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <BookOpen className="w-3.5 h-3.5" /> Course Catalog
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
