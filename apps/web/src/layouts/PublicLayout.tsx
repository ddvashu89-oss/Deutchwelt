import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/brand/Logo.js';
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
  Sparkles
} from 'lucide-react';

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/courses', label: t('nav.courses') },
    { href: '/vocabulary', label: t('nav.vocabulary') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') }
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D17] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sandbox Environment Indicator */}
      <SandboxBanner />

      {/* Top Subtle Announcement Ribbon */}
      <div className="bg-[#080B14] text-slate-300 text-xs py-2 px-4 text-center font-medium border-b border-white/[0.08]">
        <span className="inline-flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30">
            {t('nav.ribbon.badge')}
          </span>
          <span>{t('nav.ribbon.text')}</span>
          <Link
            to="/courses"
            className="underline decoration-indigo-400 underline-offset-2 font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1 hidden sm:inline"
          >
            {t('nav.ribbon.cta')}
          </Link>
        </span>
      </div>

      {/* Main Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A0D17]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-white font-bold border-b-2 border-indigo-500 pb-0.5'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageToggle />

            {user ? (
              <Link to={getDashboardLink()}>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25">
                  <span>{t('nav.dashboard')}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-all backdrop-blur-sm">
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25">
                    <span>{t('nav.register')}</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#0D1120] px-4 pt-3 pb-6 space-y-4 shadow-2xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-200 hover:text-white py-2 border-b border-white/[0.06]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-bold shadow-md">
                    {t('nav.mobile.dashboard')}
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-full border border-white/10 bg-white/5 text-slate-200 text-sm font-bold">
                      {t('nav.login')}
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-bold shadow-md">
                      {t('nav.mobile.startFree')}
                    </button>
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

      {/* Linear & Stripe Style Dark Footer */}
      <footer className="bg-[#070913] text-slate-400 pt-16 pb-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" asLink={false} />
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {t('footer.tagline')}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" /> Berlin & Online
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> CEFR Zertifiziert A1–B2
                </span>
              </div>
            </div>

            {/* Courses Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t('footer.colCourses')}
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.a1')}</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.a2')}</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.b1')}</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.b2')}</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.examPrep')}</Link></li>
              </ul>
            </div>

            {/* Practice Tools Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t('footer.colTools')}
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/vocabulary" className="hover:text-white transition-colors">{t('footer.srs')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">{t('footer.speakingLab')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">{t('footer.liveClasses')}</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">{t('footer.flashcards')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.mentorship')}</Link></li>
              </ul>
            </div>

            {/* Academy & Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t('footer.colAcademy')}
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} DeutschWelt Coaching. {t('footer.rights')}</p>
            <p className="flex items-center gap-1 font-medium text-slate-400">
              {t('footer.certNote')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
