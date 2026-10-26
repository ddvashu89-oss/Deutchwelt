import React from 'react';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#11162B] my-8 rounded-4xl border border-white/[0.08] shadow-2xl text-slate-100 font-sans">
      <h1 className="text-3xl font-heading font-black text-white">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Data Minimization & Collection</h2>
          <p>
            DeutschWelt respects your privacy. We collect only information necessary to deliver educational services: your name, email address, German learning level, study goals, and assignment submissions. We do not collect unnecessary demographic details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Audio Recordings in the Speaking Lab</h2>
          <p>
            When you use our Speaking Practice Lab, your audio is recorded solely upon your explicit action. Audio files are private to you and authorized teachers evaluating your progress. Audio files are never shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Data Security & Storage</h2>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#11162B] my-8 rounded-4xl border border-white/[0.08] shadow-2xl text-slate-100 font-sans">
      <h1 className="text-3xl font-heading font-black text-white">Terms of Service</h1>
      <p className="text-xs text-slate-400">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By creating an account on DeutschWelt, you agree to abide by these terms. DeutschWelt provides language learning materials, exercises, vocabulary flashcards, and coaching services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. User Conduct & Academic Honesty</h2>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#11162B] my-8 rounded-4xl border border-white/[0.08] shadow-2xl text-slate-100 font-sans">
      <h1 className="text-3xl font-heading font-black text-white">Cookie Information</h1>
      <p className="text-xs text-slate-400">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">Essential Cookies Only</h2>
          <p>
            DeutschWelt uses strictly necessary HTTP-only session cookies (<code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">dw_session</code>) to keep you authenticated securely across lesson pages. We do not use intrusive third-party cross-site tracking cookies.
          </p>
        </section>
      </div>
    </div>
  );
}
