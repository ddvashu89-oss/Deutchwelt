import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
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
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', href: '/student/courses', icon: CheckSquare, badge: '12+' },
    { label: 'Calendar', href: '/student/materials', icon: Calendar },
    { label: 'Analytics', href: '/student/vocabulary', icon: BarChart2 },
    { label: 'Team', href: '/student/speaking', icon: Users },
  ];

  const teacherMenu = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', href: '/teacher/submissions', icon: CheckSquare, badge: '5' },
    { label: 'Calendar', href: '/teacher/materials', icon: Calendar },
    { label: 'Analytics', href: '/teacher/assignments/new', icon: BarChart2 },
    { label: 'Team', href: '/teacher/batches', icon: Users },
  ];

  const adminMenu = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', href: '/admin/courses', icon: CheckSquare },
    { label: 'Calendar', href: '/admin/enquiries', icon: Calendar, badge: '3' },
    { label: 'Analytics', href: '/admin/audit-logs', icon: BarChart2 },
    { label: 'Team', href: '/admin/students', icon: Users },
  ];

  const generalMenu = [
    { label: 'Settings', href: isStudent ? '/student/profile' : isAdmin ? '/admin/settings' : '/teacher/dashboard', icon: Settings },
    { label: 'Help', href: '/faq', icon: HelpCircle },
  ];

  const currentMenu = isAdmin ? adminMenu : isTeacher ? teacherMenu : studentMenu;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row font-sans text-dark antialiased selection:bg-mint selection:text-forest-950">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR (DONEZO CLEAN WHITE DESIGN) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
              <Logo size="md" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-dark-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Group 1: MENU */}
            <div className="px-6 pt-6 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                MENU
              </p>
              <nav className="space-y-1">
                {currentMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-forest font-bold bg-forest-50/80'
                          : 'text-dark-muted hover:text-dark hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-forest' : 'text-gray-400 group-hover:text-dark'}`} />
                        <span>{item.label}</span>
                      </div>

                      {/* Pill badge if present (e.g. 12+) */}
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-forest text-white'
                            : 'bg-forest-100/70 text-forest-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Left vertical active bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-forest" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Menu Group 2: GENERAL */}
            <div className="px-6 pt-6 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                GENERAL
              </p>
              <nav className="space-y-1">
                {generalMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-forest font-bold bg-forest-50/80'
                          : 'text-dark-muted hover:text-dark hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-dark transition-colors" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark-muted hover:text-red-600 hover:bg-red-50/60 transition-all text-left"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Sidebar Widget: Download Mobile App (matching screenshot) */}
          <div className="p-4 m-4 rounded-2xl bg-mesh-dark text-white relative overflow-hidden shadow-card border border-forest-800/80">
            {/* Background circular overlay */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-mint/10 pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center text-mint border border-forest-600/60">
                <Smartphone className="w-3.5 h-3.5" />
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight text-white">
                  Download our <br />Mobile App
                </h4>
                <p className="text-[10px] text-gray-300 mt-1">
                  Get easy in another way
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert('DeutschWelt Mobile App for iOS and Android is in active beta preview!')}
                className="w-full py-1.5 px-3 rounded-full bg-forest-800 hover:bg-forest-700 text-white text-[11px] font-bold border border-forest-600/70 transition-all active:scale-95 shadow-xs"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT BODY */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Matching Donezo design) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Mobile Toggle & Search Bar */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-dark hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Pill Search Input with Keyboard Badge */}
            <div className="relative w-full max-w-sm hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search task or lesson..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f4f5f6] border border-transparent focus:border-forest/30 focus:bg-white text-xs text-dark placeholder:text-gray-400 pl-10 pr-12 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-forest/10"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                ⌘ F
              </span>
            </div>
          </div>

          {/* Right: Message Icon, Notification Bell, User Profile Pill */}
          <div className="flex items-center gap-3.5">
            {/* Mail Icon Button */}
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-gray-200/90 bg-white flex items-center justify-center text-dark-muted hover:text-dark hover:border-gray-300 transition-colors shadow-2xs"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Bell Icon Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-full border border-gray-200/90 bg-white flex items-center justify-center text-dark-muted hover:text-dark hover:border-gray-300 transition-colors relative shadow-2xs"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-germanRed ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-xl border border-gray-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest">Notifications</span>
                    <span className="text-[10px] bg-mint-50 text-mint-800 font-bold px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="divide-y divide-gray-50 text-xs max-h-60 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <p className="font-bold text-navy">Willkommen bei DeutschWelt!</p>
                      <p className="text-dark-muted mt-0.5">Welcome! Start with Einheit 1: Sich vorstellen.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                    </div>
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <p className="font-bold text-navy">Neue Sprechaufgabe bereit</p>
                      <p className="text-dark-muted mt-0.5">Instant AI Speech Check is now enabled in Speaking Lab.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill matching screenshot */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white font-extrabold text-sm border-2 border-white shadow-2xs overflow-hidden">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
