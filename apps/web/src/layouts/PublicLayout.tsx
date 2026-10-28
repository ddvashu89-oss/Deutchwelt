import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
import { LanguageToggle } from '../components/ui/LanguageToggle.js';
import { SandboxBanner } from '../components/ui/SandboxBanner.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers
} from 'lucide-react';

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/courses', label: t('nav.courses'), icon: BookOpen },
    { href: '/vocabulary', label: t('nav.vocabulary'), icon: Sparkles },
    { href: '/about', label: t('nav.about'), icon: GraduationCap },
    { href: '/contact', label: t('nav.contact'), icon: Globe }
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  const getDashboardLabel = () => {
    if (!user) return t('nav.login');
    if (user.role === 'ADMIN') return 'Admin Hub';
    if (user.role === 'TEACHER') return 'Faculty Studio';
    return 'Campus Portal';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sandbox Environment Indicator */}
      <SandboxBanner />

      {/* Top Subtle Announcement Ribbon */}
      <div className="bg-[#050B17] text-slate-300 text-xs py-2 px-4 text-center font-medium border-b border-white/[0.06] relative z-40">
        <span className="inline-flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-extrabold tracking-wider uppercase border border-blue-500/30 shadow-xs">
            {t('nav.ribbon.badge') || 'GERMAN ACADEMY'}
          </span>
          <span className="text-slate-300 text-xs">{t('nav.ribbon.text') || 'Goethe-Institut & Telc Examination Prep A1–B2'}</span>
          <Link
            to="/courses"
            className="underline decoration-blue-400 underline-offset-2 font-bold text-blue-400 hover:text-blue-300 transition-colors ml-1 hidden sm:inline"
          >
            {t('nav.ribbon.cta') || 'Explore Courses →'}
          </Link>
        </span>
      </div>

      {/* Main Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 bg-[#070D1A]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" showTagline={true} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageToggle />

            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="sm" className="gap-2">
                  <span>{getDashboardLabel()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="germanGold" size="sm">
                    {t('nav.register') || 'Get Started'}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#070D1A] px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
              {user ? (
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    {getDashboardLabel()}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="germanGold" className="w-full">
                      {t('nav.register') || 'Get Started'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Teutonic Footer */}
      <footer className="bg-[#040814] text-slate-400 pt-16 pb-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" asLink={false} />
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                {t('footer.tagline') || 'Precision German language coaching tailored for global careers, European university admissions, and Goethe/Telc certification.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Globe className="w-4 h-4 text-blue-400" /> Berlin & Virtual Campus
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> CEFR Certified A1–B2
                </span>
              </div>
            </div>

            {/* Courses Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                {t('footer.colCourses') || 'Courses'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/courses" className="hover:text-blue-400 transition-colors">German A1 Beginner</Link></li>
                <li><Link to="/courses" className="hover:text-blue-400 transition-colors">German A2 Elementary</Link></li>
                <li><Link to="/courses" className="hover:text-blue-400 transition-colors">German B1 Intermediate</Link></li>
                <li><Link to="/courses" className="hover:text-blue-400 transition-colors">German B2 Professional</Link></li>
                <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Goethe & Telc Exam Prep</Link></li>
              </ul>
            </div>

            {/* Practice Tools Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                {t('footer.colTools') || 'Academy Tools'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/vocabulary" className="hover:text-blue-400 transition-colors">Leitner SRS Flashcards</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">AI Speaking & Phonetics</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Faculty Live Batches</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Grammar Exercise Engine</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">1-on-1 Faculty Mentorship</Link></li>
              </ul>
            </div>

            {/* Academy & Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                {t('footer.colAcademy') || 'DeutschWelt'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">{t('footer.about')}</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">{t('footer.contact')}</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 transition-colors">{t('footer.terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-400 transition-colors">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} DeutschWelt Academy. {t('footer.rights') || 'All rights reserved.'}</p>
            <p className="flex items-center gap-1 font-medium text-slate-400">
              {t('footer.certNote') || 'Curriculum aligned with CEFR standards for the Federal Republic of Germany.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
