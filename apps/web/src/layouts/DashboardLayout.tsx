import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Logo } from '../components/brand/Logo.js';
import { LanguageToggle } from '../components/ui/LanguageToggle.js';
import { SandboxBanner } from '../components/ui/SandboxBanner.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  BookOpen,
  Mic,
  PenTool,
  GraduationCap,
  Sparkles,
  Flame,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Award,
  Layers,
  User as UserIcon,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout, isStudent, isTeacher, isAdmin, accountBlocked, blockedMessage } = useAuth();
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

  // Immediate Security Suspension Lockout for Blocked Accounts
  if (accountBlocked) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 bg-mesh-cosmic">
        <div className="max-w-md w-full bg-[#0B1325]/95 rounded-3xl p-8 border border-rose-500/30 text-center space-y-6 shadow-2xl shadow-rose-950/50 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Access Restricted
            </span>
            <h2 className="text-2xl font-heading font-black text-white pt-2">Account Suspended</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {blockedMessage || 'Your account access has been suspended or blocked by a platform administrator. Course access, speaking exercises, and batch materials are currently restricted.'}
          </p>
          <div className="p-4 bg-[#070D1A] rounded-2xl border border-white/10 text-xs text-slate-400 text-left space-y-1">
            <p className="font-bold text-slate-200">Admissions & Security Desk:</p>
            <p className="text-slate-300">support@deutschwelt.de • Tel: +49 89 12345678</p>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="w-full uppercase tracking-wider text-xs font-bold"
          >
            Sign Out & Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // ROLE 1: STUDENT EXPERIENCE — DeutschWelt Campus (Cyan/Emerald Accents)
  // ----------------------------------------------------------------------
  if (isStudent) {
    const studentNavTabs = [
      { label: language === 'de' ? 'Übersicht' : 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: language === 'de' ? 'Wortschatz' : 'Vocabulary', href: '/student/vocabulary', icon: Sparkles },
      { label: language === 'de' ? 'Grammatik & Material' : 'Materials', href: '/student/materials', icon: BookOpen },
      { label: language === 'de' ? 'KI-Sprachlabor' : 'Speaking Lab', href: '/student/speaking', icon: Mic },
      { label: language === 'de' ? 'Kurse' : 'Courses', href: '/student/courses', icon: Layers },
      { label: language === 'de' ? 'Aufgaben' : 'Assignments', href: '/student/assignments', icon: PenTool },
    ];

    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <SandboxBanner />
        
        {/* Campus Header */}
        <header className="h-18 bg-[#070D1A]/90 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40 px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-xl shadow-black/20">
          {/* Left: Brand with Campus Role Badge */}
          <div className="flex items-center gap-6">
            <Logo size="md" roleBadge="student" asLink={true} />

            {/* Desktop Center Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {studentNavTabs.map((tab) => {
                const isActive = location.pathname === tab.href || (tab.href === '/student/dashboard' && (location.pathname === '/student' || location.pathname === '/student/'));
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.href}
                    to={tab.href}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Language Toggle, Streak, Level, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle className="scale-90 sm:scale-100 origin-right" />

            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-black">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>A1 • Goethe</span>
            </div>

            {/* Streak Counter Pill */}
            <div className="hidden xs:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>7 Days 🔥</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl bg-[#0B1325] hover:bg-[#111C35] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10 relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl bg-[#0B1325] shadow-2xl border border-white/10 py-3 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="px-4 pb-2 border-b border-white/[0.08] flex items-center justify-between">
                    <span className="font-heading font-black text-white uppercase text-[11px] tracking-wider">Campus Alerts</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">1 Active</span>
                  </div>
                  <div className="p-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Daily Practice Ready
                    </p>
                    <p className="text-slate-400 mt-0.5 text-[11px]">Keep your 7-day streak alive with today's 10-minute vocabulary session.</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Just now</span>
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Pill */}
            <Link to="/student/profile" className="flex items-center gap-2 pl-1 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                {user?.firstName?.[0] || 'S'}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{user?.firstName}</p>
                <p className="text-[10px] text-slate-400">Student</p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="xl:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#070D1A] border-b border-white/[0.08] px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {studentNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.href || (tab.href === '/student/dashboard' && (location.pathname === '/student' || location.pathname === '/student/'));
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between px-2">
              <span className="text-xs text-amber-300 font-bold">Streak: 7 Days 🔥</span>
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

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-mesh-cosmic">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // ROLE 2: TEACHER EXPERIENCE — DeutschWelt Faculty Studio (Teal Accents)
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
      { label: language === 'de' ? 'Neue Aufgabe erstellen' : 'New Assignment', href: '/teacher/assignments/new', icon: PenTool },
    ];

    return (
      <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row font-sans text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* FACULTY STUDIO SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-[#070D1A] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static shrink-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Brand Header with Faculty Studio Tagline */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.08]">
                <Logo size="md" roleBadge="teacher" asLink={true} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Faculty Info Pill */}
              <div className="px-5 pt-5 pb-2">
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-teal-500/20">
                    {user?.firstName?.[0] || 'T'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-teal-400 font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Faculty Instructor
                    </p>
                  </div>
                </div>
              </div>

              {/* Group 1: WORKSPACE */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">
                  FACULTY WORKSPACE
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
                            ? 'text-teal-300 bg-teal-500/15 font-extrabold border border-teal-500/30 shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-teal-400 shadow-[0_0_8px_#2DD4BF]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Group 2: CURRICULUM CREATIONS */}
              <div className="px-5 pt-3 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">
                  CONTENT & CURRICULUM
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
                            ? 'text-teal-300 bg-teal-500/15 font-extrabold border border-teal-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-white/[0.08]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SandboxBanner />
          
          {/* Top Bar */}
          <header className="h-18 bg-[#070D1A]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-white/5"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative w-full hidden sm:block">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'de' ? 'Klasse oder Schüler suchen...' : 'Search classes, students, or submissions...'}
                  className="bg-[#0B1325] border border-white/10 focus:border-teal-500 focus:bg-[#101B33] text-xs text-slate-100 placeholder:text-slate-500 pl-9 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageToggle className="scale-90 sm:scale-100" />
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block leading-tight">
                  <p className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-teal-400">Faculty Studio</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-mesh-cosmic">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // ROLE 3: ADMIN EXPERIENCE — DeutschWelt Command Center (Violet Accents)
  // ----------------------------------------------------------------------
  const adminOverview = [
    { label: language === 'de' ? 'Übersicht' : 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: language === 'de' ? 'Kurse & Lehrplan' : 'Courses & Curriculum', href: '/admin/courses', icon: BookOpen },
    { label: language === 'de' ? 'Dozenten' : 'Instructors', href: '/admin/teachers', icon: GraduationCap },
    { label: language === 'de' ? 'Studenten' : 'Students', href: '/admin/students', icon: Users },
    { label: language === 'de' ? 'Anfragen & Leads' : 'Enquiries & Leads', href: '/admin/enquiries', icon: FileText, badge: '3' },
    { label: language === 'de' ? 'Systemprotokolle' : 'Audit Logs & Telemetry', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const adminSettings = [
    { label: language === 'de' ? 'Einstellungen' : 'Platform Settings', href: '/admin/settings', icon: Settings },
    { label: language === 'de' ? 'Hilfe & FAQ' : 'Help & FAQ', href: '/faq', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row font-sans text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* COMMAND CENTER SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-[#070D1A] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header with Command Role Badge */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.08]">
              <Logo size="md" roleBadge="admin" asLink={true} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Telemetry Status Pill */}
            <div className="px-5 pt-5 pb-2">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">Command Live</span>
                </div>
                <Badge variant="admin" className="text-[10px]">v1.0</Badge>
              </div>
            </div>

            {/* OPERATIONS OVERVIEW GROUP */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">
                OPERATIONS & CONTROL
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
                          ? 'text-purple-300 bg-purple-500/15 font-extrabold border border-purple-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-purple-500 to-indigo-500 shadow-[0_0_8px_#A855F7]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SETTINGS GROUP */}
            <div className="px-5 pt-3 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">
                PLATFORM CONFIG
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
                          ? 'text-purple-300 bg-purple-500/15 font-extrabold border border-purple-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Logout */}
          <div className="p-5 border-t border-white/[0.08]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'de' ? 'Abmelden' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SandboxBanner />
        
        {/* Top Header */}
        <header className="h-18 bg-[#070D1A]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'de' ? 'Plattform durchsuchen...' : 'Search platform metrics, users, courses...'}
                className="bg-[#0B1325] border border-white/10 focus:border-purple-500 focus:bg-[#101B33] text-xs text-slate-100 placeholder:text-slate-500 pl-9 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle className="scale-90 sm:scale-100" />
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center border border-purple-400/30 shadow-md shadow-purple-500/20">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-purple-400 font-semibold">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-mesh-cosmic">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
