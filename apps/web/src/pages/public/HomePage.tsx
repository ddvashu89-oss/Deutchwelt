import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { ArticleBadge } from '../../components/ui/ArticleBadge.js';
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Mic,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Volume2,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  RotateCw,
  Users
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext.js';

export function HomePage() {
  const { t } = useLanguage();
  // Interactive Vocab Card State for Hero Preview
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Sample Interactive Vocabulary
  const previewWords = {
    A1: { german: 'Kaffee', article: 'der', english: 'Coffee', hindi: 'कॉफ़ी', example: 'Ich trinke morgens gerne einen Kaffee.', ipa: '/ˈkafe/' },
    A2: { german: 'Wohnung', article: 'die', english: 'Apartment', hindi: 'अपार्टमेंट', example: 'Meine Wohnung hat drei helle Zimmer.', ipa: '/ˈvoːnʊŋ/' },
    B1: { german: 'Erfolg', article: 'der', english: 'Success', hindi: 'सफलता', example: 'Geduld ist der Schlüssel zum Erfolg.', ipa: '/ɛɐ̯ˈfɔlk/' },
    B2: { german: 'Voraussetzung', article: 'die', english: 'Prerequisite', hindi: 'पूर्वशर्त', example: 'C1 ist eine Voraussetzung für die Universität.', ipa: '/ˈfoːɐ̯ʔaʊ̯szɛtsʊŋ/' }
  };

  const currentWord = previewWords[activeTab];

  const levels = [
    {
      code: 'A1',
      title: 'Beginner Breakthrough',
      cefr: 'Goethe-Zertifikat A1',
      desc: 'Master the German alphabet, phonetics, daily greetings, and the foundational Nominative & Accusative cases.',
      hours: '60 Hours',
      slug: 'deutsch-a1-beginner-intensiv',
      badge: 'Start from Zero'
    },
    {
      code: 'A2',
      title: 'Elementary Fluency',
      cefr: 'Goethe-Zertifikat A2',
      desc: 'Conquer the Dative case, two-way prepositions (Wechselpräpositionen), and narrating past events with the Perfekt tense.',
      hours: '75 Hours',
      slug: 'deutsch-a2-elementary-dialoge',
      badge: 'Conversational'
    },
    {
      code: 'B1',
      title: 'Intermediate Autonomy',
      cefr: 'Goethe-Zertifikat B1 / DTZ',
      desc: 'Achieve official citizenship fluency. Express polite requests with Konjunktiv II, use Passive voice, and handle German bureaucracy.',
      hours: '90 Hours',
      slug: 'deutsch-b1-intermediate-mastery',
      badge: 'Official Residence'
    },
    {
      code: 'B2',
      title: 'Professional Fluency',
      cefr: 'Goethe-Zertifikat B2 / TestDaF',
      desc: 'Specialized for university study, clinical medicine, and corporate engineering. Complex academic debates and Nominalstil.',
      hours: '120 Hours',
      slug: 'deutsch-b2-professional-fluency',
      badge: 'University Ready'
    }
  ];

  const faqs = [
    {
      q: 'Can I start if I have never spoken a single word of German?',
      a: 'Absolutely! Our A1 course begins with phonetics, alphabet sounds, and everyday introductions. You do not need any prior knowledge of German.'
    },
    {
      q: 'Are your courses aligned with official Goethe-Institut examinations?',
      a: 'Yes. Our curriculum directly mirrors the Common European Framework of Reference for Languages (CEFR) standards used by Goethe-Institut and telc. Our modules include specific exam exercises for Reading, Listening, Writing, and Speaking.'
    },
    {
      q: 'How does the Speaking Practice Lab work?',
      a: 'You receive level-appropriate prompts (e.g. hotel bookings, expressing opinions). You record your speech directly through your browser, listen back, and submit it. Our certified instructors review your pronunciation, grammar, and fluency with rubric-based feedback.'
    },
    {
      q: 'What is the Leitner Spaced Repetition System used in the Vocabulary Trainer?',
      a: 'The Leitner system uses 5 learning boxes with spaced intervals (1 day, 3 days, 7 days, 14 days, 30 days). Words you know well move to higher boxes, while words you struggle with return to Box 1 for reinforcement. This guarantees long-term retention.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-navy text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-germanRed animate-pulse" />
                {t('hero.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy tracking-tight leading-[1.15]">
                {t('hero.title').split(' ').slice(0, 3).join(' ')} <br />
                <span className="text-germanRed underline decoration-navy-200 decoration-wavy underline-offset-8">
                  {t('hero.title').split(' ').slice(3).join(' ')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-dark-muted max-w-2xl leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                    {t('hero.cta.start')} <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                    <BookOpen className="w-5 h-5 mr-1" /> {t('hero.cta.courses')}
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy">A1–B2</p>
                  <p className="text-xs text-dark-muted font-medium">CEFR Certified Paths</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy">100%</p>
                  <p className="text-xs text-dark-muted font-medium">Server-Graded Tests</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy">5-Box</p>
                  <p className="text-xs text-dark-muted font-medium">Leitner Spaced Repetition</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive CSS Learning Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-200/80 relative">
                {/* Level Tabs */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-muted">Interactive Preview</span>
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => { setActiveTab(lvl); setIsFlipped(false); }}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          activeTab === lvl ? 'bg-navy text-white shadow-xs' : 'text-gray-500 hover:text-dark'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flip Card Content */}
                <div className="py-6">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer group relative min-h-[190px] rounded-2xl bg-ivory/60 border border-gray-200/80 p-6 flex flex-col justify-between hover:border-navy-300 transition-all select-none shadow-xs"
                  >
                    {!isFlipped ? (
                      <>
                        <div className="flex items-start justify-between">
                          <ArticleBadge article={currentWord.article} size="md" />
                          <span className="text-[11px] text-gray-400 font-mono">{currentWord.ipa}</span>
                        </div>
                        <div className="text-center my-3">
                          <h3 className="text-3xl font-extrabold text-navy tracking-tight">{currentWord.german}</h3>
                          <p className="text-xs text-dark-muted mt-1 italic">Click to reveal English & Hindi translation</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5 text-germanRed" /> Tap to flip</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-semibold">{activeTab} Level</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold text-germanRed">
                          <span>Translation & Context</span>
                          <ArticleBadge article={currentWord.article} size="sm" />
                        </div>
                        <div className="text-center my-2 space-y-1">
                          <p className="text-2xl font-bold text-navy">{currentWord.english}</p>
                          <p className="text-sm font-medium text-dark-muted font-sans">{currentWord.hindi}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-dark leading-snug">
                          <p className="font-semibold text-navy">Beispiel (Example):</p>
                          <p className="italic text-gray-600 mt-0.5">"{currentWord.example}"</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Practice Prompt */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-dark-muted">Active Spaced Repetition (Box 1)</span>
                  </div>
                  <Link to="/vocabulary" className="text-xs font-bold text-germanRed hover:underline inline-flex items-center gap-1">
                    Full Word Bank <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CEFR LEARNING PATHS (A1 TO B2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <Badge variant="default" className="uppercase font-bold tracking-wider">Structured Roadmap</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy">
            Choose Your German Proficiency Goal
          </h2>
          <p className="text-base text-dark-muted">
            Each level includes comprehensive units, grammar breakdowns, authentic dialog audio, and official examination practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl) => (
            <Card key={lvl.code} className="flex flex-col justify-between hover:-translate-y-1 transition-transform border-gray-200/90">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-10 h-10 rounded-xl bg-navy text-white font-heading font-black text-lg flex items-center justify-center">
                    {lvl.code}
                  </span>
                  <Badge variant={lvl.code === 'A1' ? 'germanRed' : 'outline'} className="text-[10px]">
                    {lvl.badge}
                  </Badge>
                </div>
                <CardTitle>{lvl.title}</CardTitle>
                <p className="text-xs font-bold text-germanRed mt-1">{lvl.cefr}</p>
                <CardDescription className="pt-2 text-xs leading-relaxed">
                  {lvl.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="py-2 border-t border-gray-100 flex items-center justify-between text-xs text-dark-muted font-medium">
                  <span>Estimated: {lvl.hours}</span>
                  <span className="text-emerald-700 font-bold">Comprehensive</span>
                </div>
                <Link to={`/courses/${lvl.slug}`} className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full font-bold hover:bg-navy hover:text-white transition-colors">
                    View Curriculum <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. FOUR CORE METHODOLOGY PILLARS */}
      <section className="bg-white py-20 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <Badge variant="secondary" className="uppercase font-bold tracking-wider">The DeutschWelt Method</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy">
              Engineered for Serious Language Learners
            </h2>
            <p className="text-base text-dark-muted">
              Why our students succeed where generic gamified apps fail: genuine academic feedback, structured grammar, and real speaking practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-ivory/50 border border-gray-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Speaking Practice Lab</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Record real audio directly in the browser. Instructors grade your pronunciation, sentence cadence, and grammar based on Goethe evaluation rubrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory/50 border border-gray-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-germanRed flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Leitner Spaced Repetition</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Color-coded German articles (der, die, das) paired with an automated 5-box spaced repetition algorithm to ensure words stick permanently in your memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory/50 border border-gray-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Server-Scored Exercises</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Multiple choice, fill-in-the-blank, sentence ordering, and case matching. Evaluated by our backend scoring engine with step-by-step explanations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory/50 border border-gray-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Certified DACH Coaches</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Direct feedback from teachers holding degrees in Germanistik. Personalized correction of your writing submissions and spoken exam presentations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="default" className="uppercase font-bold tracking-wider">Comparison</Badge>
          <h2 className="text-3xl font-extrabold text-navy">Why DeutschWelt Stands Out</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-germanRed-200 font-extrabold">DeutschWelt</th>
                <th className="p-4 sm:p-5 text-gray-400">Casual Mobile Apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-dark">
              <tr>
                <td className="p-4 font-semibold">CEFR A1–B2 Structured Curriculum</td>
                <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Yes, Goethe Aligned</td>
                <td className="p-4 text-gray-400">Fragmented random phrases</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Grammatical Cases & Gender Colors</td>
                <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Standard der/die/das color badges</td>
                <td className="p-4 text-gray-400">Often omitted</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Audio Speaking Submissions</td>
                <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Browser recording + Teacher rubric</td>
                <td className="p-4 text-gray-400">Basic robotic voice matching</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Formal Writing & Essay Evaluation</td>
                <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Real teacher grading & feedback</td>
                <td className="p-4 text-gray-400">No human review</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. SAMPLE STUDENT TESTIMONIALS (CLEARLY IDENTIFIED SAMPLE CONTENT) */}
      <section className="bg-ivory py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-dark-muted bg-white px-3 py-1 rounded-full border border-gray-200">
              Demo Student Experiences
            </span>
            <h2 className="text-3xl font-extrabold text-navy">What Our Students Say</h2>
            <p className="text-xs text-dark-muted">Sample reviews representing typical learner outcomes in development.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-dark italic leading-relaxed">
                  "The grammar explanations for Akkusativ and Dativ finally made sense to me. I scored 94/100 on my Goethe-Zertifikat A1 exam!"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-navy-100 text-navy font-bold flex items-center justify-center text-xs">
                    ES
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Elena Sharma</p>
                    <p className="text-[11px] text-gray-500">Goethe A1 Graduate • Munich</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-dark italic leading-relaxed">
                  "The speaking lab gave me the confidence to actually talk. Getting real teacher audio feedback within 24 hours was invaluable."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-germanRed-100 text-germanRed font-bold flex items-center justify-center text-xs">
                    MC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Marcus Chen</p>
                    <p className="text-[11px] text-gray-500">A2 to B1 Learner • Frankfurt</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-dark italic leading-relaxed">
                  "The spaced repetition vocabulary trainer with der/die/das color coding saved me countless hours of rote memorization."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    PK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Pooja Kulkarni</p>
                    <p className="text-[11px] text-gray-500">B2 Professional Fluency Candidate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="default" className="uppercase font-bold tracking-wider">FAQ</Badge>
          <h2 className="text-3xl font-extrabold text-navy">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-subtle">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-navy hover:text-germanRed transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedFaq === idx ? 'rotate-180 text-germanRed' : ''}`} />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 pt-0 text-sm text-dark-muted leading-relaxed border-t border-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. REGISTRATION CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xl border border-navy-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-germanRed/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <Badge variant="germanRedSolid" className="uppercase font-bold tracking-wider mx-auto px-3.5 py-1 text-xs">
            Begin Your Learning Today
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">
            Ready to Speak Fluent German?
          </h2>

          <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
            Join DeutschWelt today and get immediate access to A1 beginner lessons, vocabulary flashcards, and speaking prompts.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold px-8 shadow-lg">
                Create Free Account <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline-white" size="lg" className="w-full sm:w-auto font-medium px-8">
                Speak with Academic Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
