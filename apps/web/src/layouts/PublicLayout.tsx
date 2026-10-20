import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
import { LanguageToggle } from '../components/ui/LanguageToggle.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Menu,
  X,
  BookOpen,
  Award,
  Users,
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
    <div className="min-h-screen flex flex-col bg-canvas text-gray-900 font-sans antialiased">
      {/* Top Subtle Announcement Ribbon */}
      <div className="bg-forest-950 text-white text-xs py-2 px-4 text-center font-medium border-b border-forest-900">
        <span className="inline-flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint text-[10px] font-bold tracking-wider uppercase border border-mint/30">
            Intensivkurse 2026
          </span>
          <span>Goethe & Telc Vorbereitung A1–B2 • Kleine Gruppen & 1-zu-1 Coaching.</span>
          <Link
            to="/courses"
            className="underline decoration-mint underline-offset-2 font-bold text-mint hover:text-white transition-colors ml-1 hidden sm:inline"
          >
            Jetzt Einstufen →
          </Link>
        </span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
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
                      ? 'text-forest-900 font-bold border-b-2 border-mint pb-0.5'
                      : 'text-gray-600 hover:text-forest-900'
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
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg">
                  <span>{t('nav.dashboard')}</span>
                  <ArrowRight className="w-4 h-4 text-mint" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all shadow-xs">
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg">
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
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-gray-800 hover:text-forest-900 py-2 border-b border-gray-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-full bg-forest-900 text-white text-sm font-bold shadow-md">
                    Zum Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-full border border-gray-200 text-gray-800 text-sm font-bold">
                      Anmelden
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-full bg-forest-900 text-white text-sm font-bold">
                      Kostenlos starten
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

      {/* Cinematic Forest Dark Footer */}
      <footer className="bg-forest-950 text-white pt-16 pb-12 border-t border-forest-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-forest-800/60">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-sm">
                <Logo size="md" asLink={false} />
              </div>
              <p className="text-sm text-emerald-100/70 max-w-sm leading-relaxed">
                DeutschWelt Coaching ist Ihre Akademie für deutsche Sprachkompetenz nach dem Gemeinsamen Europäischen Referenzrahmen (GER A1 bis B2).
              </p>
              <div className="flex items-center gap-4 text-xs text-emerald-200/80 pt-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-mint" /> Berlin & Online
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-mint" /> CEFR Zertifiziert A1–B2
                </span>
              </div>
            </div>

            {/* Courses Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Kursstufen
              </h4>
              <ul className="space-y-2 text-sm text-emerald-100/70">
                <li><Link to="/courses" className="hover:text-white transition-colors">A1 Anfänger (Start from Zero)</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">A2 Grundstufe (Konversation)</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">B1 Mittelstufe (Beruf & Alltag)</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">B2 Fortgeschritten (Goethe Zertifikat)</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Prüfungstraining</Link></li>
              </ul>
            </div>

            {/* Practice Tools Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Lernwerkzeuge
              </h4>
              <ul className="space-y-2 text-sm text-emerald-100/70">
                <li><Link to="/vocabulary" className="hover:text-white transition-colors">Wortschatz-Trainer (SRS)</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Aussprache-Labor</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Live-Unterricht (Meet/Zoom)</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Leitner-Karteikartensystem</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">1-zu-1 Dozentenbetreuung</Link></li>
              </ul>
            </div>

            {/* Academy & Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Akademie
              </h4>
              <ul className="space-y-2 text-sm text-emerald-100/70">
                <li><Link to="/about" className="hover:text-white transition-colors">Über DeutschWelt</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Kontakt & Beratung</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Datenschutz</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">AGB & Nutzungsbedingungen</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie-Richtlinie</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-100/60 gap-4">
            <p>© {new Date().getFullYear()} DeutschWelt Coaching. Alle Rechte vorbehalten.</p>
            <p className="flex items-center gap-1 font-medium">
              Zertifizierte Deutschkurse nach Goethe- & Telc-Standards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
