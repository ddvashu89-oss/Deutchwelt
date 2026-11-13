import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';

export function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const de = language === 'de';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-white my-8 rounded-3xl border border-gray-200">
      <h1 className="text-3xl font-extrabold text-navy">Privacy Policy</h1>
      <p className="text-xs text-dark-muted">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">1. Data Minimization & Collection</h2>
          <p>
            DeutschWelt respects your privacy. We collect only information necessary to deliver educational services: your name, email address, German learning level, study goals, and assignment submissions. We do not collect unnecessary demographic details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">{de ? 'Bewerbungen als Lehrkraft' : 'Teacher applications'}</h2>
          <p>
            {de
              ? 'Wenn Sie sich als Lehrkraft bewerben, verarbeiten wir Ihre Kontaktdaten, Deutschkenntnisse, Unterrichtserfahrung, Qualifikationen, Verfügbarkeit, Motivation sowie Ihren Lebenslauf und optionale Nachweise. Unser Admin-Team nutzt diese Angaben ausschließlich zur Prüfung Ihrer Bewerbung, zur Planung eines Vorstellungsgesprächs und zur Einstellungsentscheidung. Die Dokumente werden in unserem geschützten DeutschWelt-Speicher abgelegt und nur dem Admin-Team zugänglich gemacht.'
              : 'When you apply to teach, we process your contact details, German proficiency, teaching experience, qualifications, availability, motivation, CV, and any optional certificates. Our admin team uses this information to review your application, arrange an interview, and make a hiring decision. Documents are stored in DeutschWelt’s private storage and are accessible to the admin team for this process.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">2. Audio Recordings in the Speaking Lab</h2>
          <p>
            When you use our Speaking Practice Lab, your audio is recorded solely upon your explicit action. Audio files are private to you and authorized teachers evaluating your progress. Audio files are never shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">3. Data Security & Storage</h2>
          <p>
            Passwords are cryptographically hashed using salted modern algorithms. Sessions are protected via secure HTTP-only cookies.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-white my-8 rounded-3xl border border-gray-200">
      <h1 className="text-3xl font-extrabold text-navy">Terms of Service</h1>
      <p className="text-xs text-dark-muted">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">1. Acceptance of Terms</h2>
          <p>
            By creating an account on DeutschWelt, you agree to abide by these terms. DeutschWelt provides language learning materials, exercises, vocabulary flashcards, and coaching services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">2. User Conduct & Academic Honesty</h2>
          <p>
            Students must submit their own written and spoken work for assignments and examinations to benefit honestly from instructional review.
          </p>
        </section>
      </div>
    </div>
  );
}

export function CookieNoticePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-white my-8 rounded-3xl border border-gray-200">
      <h1 className="text-3xl font-extrabold text-navy">Cookie Information</h1>
      <p className="text-xs text-dark-muted">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-navy">Essential Cookies Only</h2>
          <p>
            DeutschWelt uses strictly necessary HTTP-only session cookies (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-navy">dw_session</code>) to keep you authenticated securely across lesson pages. We do not use intrusive third-party cross-site tracking cookies.
          </p>
        </section>
      </div>
    </div>
  );
}
