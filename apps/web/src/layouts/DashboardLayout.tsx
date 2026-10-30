import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
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
  Mail,
  Bell,
  Menu,
  X,
  Smartphone,
  BookOpen,
  Video,
  Layers,
  Mic,
  PenTool,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout, isStudent, isTeacher, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Student Navigation mapped to Donezo menu structure
  const studentMenu = [
    { label: t('dash.menu.dashboard'), href: '/student/dashboard', icon: LayoutDashboard },
    { label: t('dash.menu.tasks'), href: '/student/courses', icon: CheckSquare, badge: '12+' },
    { label: t('dash.menu.calendar'), href: '/student/materials', icon: Calendar },
    { label: t('dash.menu.analytics'), href: '/student/vocabulary', icon: BarChart2 },
    { label: t('dash.menu.team'), href: '/student/speaking', icon: Users },
  ];

  const teacherMenu = [
    { label: t('dash.menu.dashboard'), href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: t('dash.menu.tasks'), href: '/teacher/submissions', icon: CheckSquare, badge: '5' },
    { label: t('dash.menu.calendar'), href: '/teacher/materials', icon: Calendar },
    { label: t('dash.menu.analytics'), href: '/teacher/assignments/new', icon: BarChart2 },
    { label: t('dash.menu.team'), href: '/teacher/batches', icon: Users },
  ];

  const adminMenu = [
    { label: t('dash.menu.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('dash.menu.tasks'), href: '/admin/courses', icon: CheckSquare },
    { label: t('dash.menu.calendar'), href: '/admin/enquiries', icon: Calendar, badge: '3' },
    { label: t('dash.menu.analytics'), href: '/admin/audit-logs', icon: BarChart2 },
    { label: t('dash.menu.team'), href: '/admin/students', icon: Users },
  ];

  const generalMenu = [
    ...(isTeacher ? [] : [{ label: t('dash.menu.settings'), href: isStudent ? '/student/profile' : '/admin/settings', icon: Settings }]),
    { label: t('dash.menu.help'), href: '/faq', icon: HelpCircle },
  ];

  const currentMenu = isAdmin ? adminMenu : isTeacher ? teacherMenu : studentMenu;
  const dashboardRoot = isAdmin ? '/admin' : isTeacher ? '/teacher' : '/student';
  const isActivePath = (href: string) => {
    const currentPath = location.pathname === dashboardRoot ? `${dashboardRoot}/dashboard` : location.pathname;
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] font-sans text-[#17243a] antialiased selection:bg-[#f7dfdc] selection:text-[#14243a] md:flex md:flex-row">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#14243a]/40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR (DONEZO CLEAN WHITE DESIGN) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] shrink-0 flex-col justify-between overflow-y-auto border-r border-[#e8e3d8] bg-[#fffefa] transition-transform duration-300 ease-out md:sticky md:top-0 md:h-screen md:w-[248px] md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-full flex-col justify-between">
          <div>
            {/* Logo Header */}
            <div className="flex h-16 items-center justify-between border-b border-[#eee9df] px-4 sm:h-20 sm:px-6">
              <Logo size="md" />
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-[#687487] transition-colors hover:bg-[#f4f1e9] md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Group 1: MENU */}
            <div className="px-4 pb-2 pt-5 sm:px-5 sm:pt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9299a2]">
                MENU
              </p>
              <nav className="space-y-1">
                {currentMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#f8ece9] font-bold text-[#14243a]'
                          : 'text-[#687487] hover:bg-[#f7f5ef] hover:text-[#14243a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-[#c54346]' : 'text-[#98a0ab] group-hover:text-[#14243a]'}`} />
                        <span>{item.label}</span>
                      </div>

                      {/* Pill badge if present (e.g. 12+) */}
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#c54346] text-white'
                            : 'bg-[#f4efdf] text-[#6d5b36]'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Left vertical active bar */}
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#c54346]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Menu Group 2: GENERAL */}
            <div className="px-4 pb-2 pt-5 sm:px-5 sm:pt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9299a2]">
                GENERAL
              </p>
              <nav className="space-y-1">
                {generalMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#f8ece9] font-bold text-[#14243a]'
                          : 'text-[#687487] hover:bg-[#f7f5ef] hover:text-[#14243a]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-[#c54346]' : 'text-[#98a0ab] group-hover:text-[#14243a]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-[#687487] transition-colors hover:bg-[#fbefed] hover:text-[#b43e40]"
                >
                  <LogOut className="h-4 w-4 text-[#98a0ab] transition-colors group-hover:text-[#c54346]" />
                  <span>{t('dash.menu.logout')}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Sidebar Widget: Download Mobile App */}
          <div className="relative m-3 overflow-hidden rounded-2xl border border-[#2a3d56] bg-[#14243a] p-4 text-white shadow-card sm:m-4">
            {/* Background circular overlay */}
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative z-10 space-y-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-[#f0c6a3]">
                <Smartphone className="w-3.5 h-3.5" />
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight text-white">
                  {t('dash.app.title')}
                </h4>
                <p className="mt-1 text-[10px] text-white/65">
                  {t('dash.app.subtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(t('dash.app.alert'))}
                className="w-full rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-white/15 active:scale-[0.98]"
              >
                {t('dash.app.btn')}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT BODY */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar (Matching Donezo design) */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#e8e3d8] bg-[#fffefa]/95 px-3 backdrop-blur-md sm:h-[72px] sm:px-5 lg:px-8">
          {/* Left: Mobile Toggle & Search Bar */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#34445a] transition-colors hover:bg-[#f4f1e9] md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Pill Search Input with Keyboard Badge */}
            <div className="relative hidden w-full max-w-sm sm:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a0ab]" />
              <input
                type="text"
                placeholder={t('dash.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-transparent bg-[#f5f2eb] py-2.5 pl-10 pr-12 text-xs text-[#17243a] placeholder:text-[#9299a2] transition-all focus:border-[#c54346]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c54346]/10"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-[#e8e3d8] bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#9299a2] shadow-2xs">
                ⌘ F
              </span>
            </div>
          </div>

          {/* Right: Language Toggle, Message Icon, Notification Bell, User Profile Pill */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <LanguageToggle />

            {/* Mail Icon Button */}
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#e8e3d8] bg-white text-[#687487] shadow-2xs transition-colors hover:border-[#d5cfc2] hover:text-[#14243a] sm:flex"
              aria-label="Messages"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Bell Icon Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e3d8] bg-white text-[#687487] shadow-2xs transition-colors hover:border-[#d5cfc2] hover:text-[#14243a]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#c54346] ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-[#e8e3d8] bg-[#fffefa] py-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#eee9df] px-4 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#14243a]">Notifications</span>
                    <span className="rounded-full bg-[#f8ece9] px-2 py-0.5 text-[10px] font-bold text-[#c54346]">2 New</span>
                  </div>
                  <div className="max-h-[min(15rem,calc(100dvh-7rem))] divide-y divide-[#f2efe8] overflow-y-auto text-xs">
                    <div className="p-3 transition-colors hover:bg-[#f8f6f0]">
                      <p className="font-bold text-[#14243a]">Willkommen bei DeutschWelt!</p>
                      <p className="mt-0.5 text-[#687487]">Welcome! Start with Einheit 1: Sich vorstellen.</p>
                      <span className="mt-1 block text-[10px] text-[#9299a2]">Just now</span>
                    </div>
                    <div className="p-3 transition-colors hover:bg-[#f8f6f0]">
                      <p className="font-bold text-[#14243a]">Neue Sprechaufgabe bereit</p>
                      <p className="mt-0.5 text-[#687487]">Instant AI Speech Check is now enabled in Speaking Lab.</p>
                      <span className="mt-1 block text-[10px] text-[#9299a2]">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill matching screenshot */}
            <div className="flex items-center gap-2 pl-0 sm:pl-1">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#14243a] text-sm font-extrabold text-white shadow-2xs sm:h-10 sm:w-10">
                {/* 3D avatar representation */}
                <span className="text-xs font-bold">
                  {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                </span>
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-bold text-dark">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
