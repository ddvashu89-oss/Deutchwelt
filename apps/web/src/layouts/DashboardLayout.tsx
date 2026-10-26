import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Logo } from '../components/brand/Logo.js';
import { LanguageToggle } from '../components/ui/LanguageToggle.js';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  BookOpen,
  Video,
  Layers,
  Mic,
  PenTool,
  GraduationCap,
  Sparkles,
  Flame,
  FileText,
  ShieldCheck,
  Award,
  ChevronDown,
  User
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout, isStudent, isTeacher, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ----------------------------------------------------------------------
  // CASE 1: STUDENT VIEW (Image 3: German Learning Dark Dashboard with Top Nav)
  // ----------------------------------------------------------------------
  if (isStudent) {
    const studentNavTabs = [
      { label: language === 'de' ? 'Übersicht' : 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: language === 'de' ? 'Wortschatz' : 'Vocabulary', href: '/student/vocabulary', icon: Sparkles },
      { label: language === 'de' ? 'Grammatik' : 'Grammar', href: '/student/materials', icon: BookOpen },
      { label: language === 'de' ? 'KI-Sprachlabor' : 'AI Speaking Lab', href: '/student/speaking', icon: Mic },
      { label: language === 'de' ? 'Kurse' : 'Courses', href: '/student/courses', icon: Layers },
    ];

    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Top Navigation Bar matching Image 3 (Fully Responsive) */}
        <header className="h-16 sm:h-18 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Left: Brand with German Flag Icon matching Image 3 */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/student/dashboard" className="flex items-center gap-2 group shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-black via-red-600 to-yellow-400 flex items-center justify-center shadow-md">
                <span className="text-[9px] sm:text-[10px] font-black text-white">DE</span>
              </div>
              <span className="font-heading font-black text-base sm:text-lg text-white tracking-tight">
                German<span className="text-emerald-400 ml-1">Learning</span>
              </span>
            </Link>

            {/* Desktop Center Navigation Tabs matching Image 3 */}
            <nav className="hidden lg:flex items-center gap-1">
              {studentNavTabs.map((tab) => {
                const isActive = location.pathname === tab.href || (tab.href === '/student/dashboard' && (location.pathname === '/student' || location.pathname === '/student/'));
                return (
                  <Link
                    key={tab.href}
                    to={tab.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Language Switcher, Streak, Notifications, Profile (Responsive) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageToggle className="scale-90 sm:scale-100 origin-right" />

            {/* Streak Counter Pill matching Image 3 */}
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>7 🔥</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60 relative"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl bg-[#1E293B] shadow-2xl border border-slate-700 py-3 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-700/60 flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">Notifications</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">1 New</span>
                  </div>
                  <div className="p-3 hover:bg-slate-800/60 transition-colors">
                    <p className="font-bold text-white">Daily Streak Active!</p>
                    <p className="text-slate-400 mt-0.5">Complete your 10-minute German practice today to keep your streak.</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Just now</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                {user?.firstName?.[0] || 'S'}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-200">
                {user?.firstName}
              </span>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {studentNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.href || (tab.href === '/student/dashboard' && (location.pathname === '/student' || location.pathname === '/student/'));
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? 'bg-slate-800 text-emerald-400 border border-slate-700/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
              <span className="text-xs text-slate-400">Streak: 7 Days 🔥</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body (Responsive container) */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // CASE 2: TEACHER VIEW (Image 2: Goteach Workspace with Green Accents)
  // ----------------------------------------------------------------------
  if (isTeacher) {
    const teacherWorkspace = [
      { label: language === 'de' ? 'Übersicht' : 'Overview', href: '/teacher/dashboard', icon: LayoutDashboard },
      { label: language === 'de' ? 'Klassen & Schüler' : 'Students & Batches', href: '/teacher/batches', icon: Users },
      { label: language === 'de' ? 'Korrekturen & Noten' : 'Submissions & Marks', href: '/teacher/submissions', icon: CheckSquare, badge: '5' },
    ];

    const teacherCreations = [
      { label: language === 'de' ? 'Unterrichtspläne' : 'Lesson Plans', href: '/teacher/materials', icon: BookOpen },
      { label: language === 'de' ? 'Arbeitsblätter' : 'Worksheets', href: '/teacher/materials', icon: FileText },
      { label: language === 'de' ? 'Neue Aufgabe' : 'New Assignment', href: '/teacher/assignments/new', icon: PenTool },
    ];

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-gray-900 antialiased selection:bg-emerald-600 selection:text-white">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* GOTEACH SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-200/90 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static shrink-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Brand Header matching Image 2 Goteach */}
              <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    G
                  </div>
                  <div>
                    <span className="font-heading font-black text-lg text-gray-900 tracking-tight">
                      Go<span className="text-emerald-700">teach</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 block -mt-1">
                      Faculty Workspace
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Group 1: WORKSPACE */}
              <div className="px-5 pt-6 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-2">
                  WORKSPACE
                </p>
                <nav className="space-y-1">
                  {teacherWorkspace.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'text-emerald-800 bg-emerald-50/90 font-extrabold'
                            : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-700" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Group 2: MY CREATIONS */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-2">
                  MY CREATIONS
                </p>
                <nav className="space-y-1">
                  {teacherCreations.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'text-emerald-800 bg-emerald-50/90 font-extrabold'
                            : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-700" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 sm:h-18 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 md:px-10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative w-full hidden sm:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'de' ? 'Klasse oder Schüler suchen...' : 'Search classes or students...'}
                  className="bg-gray-50 border border-transparent focus:border-emerald-600/30 focus:bg-white text-xs text-gray-800 pl-9 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <LanguageToggle className="scale-90 sm:scale-100" />
              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200 shadow-2xs">
                  {user?.firstName?.[0] || 'T'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // CASE 3: ADMIN VIEW (Image 1: Lurni Design with Purple/Indigo Accents)
  // ----------------------------------------------------------------------
  const adminOverview = [
    { label: language === 'de' ? 'Übersicht' : 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: language === 'de' ? 'Kurse' : 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: language === 'de' ? 'Dozenten' : 'Instructors', href: '/admin/teachers', icon: GraduationCap },
    { label: language === 'de' ? 'Studenten' : 'Students', href: '/admin/students', icon: Users },
    { label: language === 'de' ? 'Anfragen' : 'Enquiries', href: '/admin/enquiries', icon: FileText, badge: '3' },
    { label: language === 'de' ? 'Systemprotokolle' : 'Audit Logs & Reports', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const adminSettings = [
    { label: language === 'de' ? 'Einstellungen' : 'Settings', href: '/admin/settings', icon: Settings },
    { label: language === 'de' ? 'Hilfe & FAQ' : 'Help & FAQ', href: '/faq', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-gray-900 antialiased selection:bg-indigo-600 selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LURNI SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-200/90 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Lurni Brand Header matching Image 1 */}
            <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                  L
                </div>
                <div>
                  <span className="font-heading font-black text-lg text-gray-900 tracking-tight">
                    Lurni <span className="text-indigo-600">Admin</span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 block -mt-1">
                    DeutschWelt Platform
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OVERVIEW GROUP */}
            <div className="px-5 pt-6 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-2">
                OVERVIEW
              </p>
              <nav className="space-y-1">
                {adminOverview.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'text-indigo-700 bg-indigo-50/90 font-extrabold'
                          : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SETTINGS GROUP */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-2">
                SETTINGS
              </p>
              <nav className="space-y-1">
                {adminSettings.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'text-indigo-700 bg-indigo-50/90 font-extrabold'
                          : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Logout */}
          <div className="p-5 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 sm:h-18 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 md:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'de' ? 'Suchen...' : 'Search...'}
                className="bg-gray-50 border border-transparent focus:border-indigo-600/30 focus:bg-white text-xs text-gray-800 pl-9 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <LanguageToggle className="scale-90 sm:scale-100" />
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-200 shadow-2xs">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400">System Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;