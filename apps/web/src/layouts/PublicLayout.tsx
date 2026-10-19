import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/brand/Logo.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { Menu, X, ArrowRight, BookOpen, GraduationCap, Globe, ShieldCheck, Heart } from 'lucide-react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'Vocabulary', href: '/vocabulary' },
    { label: 'Methodology', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' }
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* Top Banner Notice */}
      <div className="bg-navy text-white text-xs py-2 px-4 text-center font-medium border-b border-navy-800">
        <span className="inline-flex items-center gap-2">
          <span className="bg-germanRed text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Goethe 2026</span>
          New Intensive Exam Prep Batches for A1–B2 are now open for enrollment!
          <Link to="/courses" className="underline font-bold hover:text-red-200 ml-1 inline-flex items-center gap-0.5">
            Explore paths <ArrowRight className="w-3 h-3" />
          </Link>
        </span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" showTagline />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-germanRed ${
                    isActive ? 'text-germanRed font-bold' : 'text-dark-muted'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="md">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="md">
                    Start Learning Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-dark hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-dark hover:text-germanRed"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Start Learning Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white pt-16 pb-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-navy-700/60">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-germanRed flex items-center justify-center font-heading font-black text-white text-sm">
                  DW
                </div>
                <span className="font-heading font-bold text-2xl tracking-tight text-white">
                  Deutsch<span className="text-germanRed">Welt</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                DeutschWelt is a premium German language learning and coaching academy. We combine rigorous academic Goethe-Institut curriculum standards with interactive spaced repetition and speaking labs.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-germanRed" /> Berlin & Online</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> CEFR Certified A1–B2</span>
              </div>
            </div>

            {/* Courses Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Learning Paths</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/courses/deutsch-a1-beginner-intensiv" className="hover:text-white transition-colors">A1 Beginner</Link></li>
                <li><Link to="/courses/deutsch-a2-elementary-dialoge" className="hover:text-white transition-colors">A2 Elementary</Link></li>
                <li><Link to="/courses/deutsch-b1-intermediate-mastery" className="hover:text-white transition-colors">B1 Intermediate</Link></li>
                <li><Link to="/courses/deutsch-b2-professional-fluency" className="hover:text-white transition-colors">B2 Upper Intermediate</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Goethe Exam Prep</Link></li>
              </ul>
            </div>

            {/* Platform Features Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Practice Tools</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/vocabulary" className="hover:text-white transition-colors">Vocabulary Trainer</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Speaking Practice Lab</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Exercise Engine</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">The Leitner SRS System</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Teacher Coaching</Link></li>
              </ul>
            </div>

            {/* Company & Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Academy</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About DeutschWelt</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact & Admissions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Notice</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} DeutschWelt Academy. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted for German language fluency from A1 to B2.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
