import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { CertificateModal } from '../../components/ui/CertificateModal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Flame,
  Clock,
  BookOpen,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Users,
  ChevronRight,
  TrendingUp,
  FileText,
  Volume2,
  Mic,
  GraduationCap,
  Play,
  Lightbulb,
  Check,
  CheckSquare
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, certsRes]: any = await Promise.all([
          api.get('/student/dashboard').catch(() => ({ success: false })),
          api.get('/student/certificates').catch(() => ({ success: false, certificates: [] }))
        ]);

        if (dashRes?.success) {
          setData(dashRes.stats);
        }
        if (certsRes?.success && certsRes.certificates) {
          setCertificates(certsRes.certificates);
        }
      } catch (e) {
        console.error('Error loading student dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleOpenCert = (cert?: any) => {
    if (cert) {
      setSelectedCert(cert);
    } else if (certificates.length > 0) {
      setSelectedCert(certificates[0]);
    } else {
      setSelectedCert({
        certificateNumber: 'DW-2026-A1-8849',
        recipientName: `${user?.firstName || 'Student'} ${user?.lastName || 'DeutschWelt'}`,
        courseTitle: 'German A1: Comprehensive Beginner Immersion',
        level: 'A1',
        issueDate: 'October 2026',
        gradeScore: '94%',
        hoursCompleted: '80',
        issuerName: 'DeutschWelt Language Academy Berlin'
      });
    }
    setIsCertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-white">
        <Skeleton className="h-12 w-72 bg-[#0B1325] rounded-2xl border border-[rgba(255,255,255,0.08)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 bg-[#0B1325] rounded-3xl border border-[rgba(255,255,255,0.08)]" />
          ))}
        </div>
        <Skeleton className="h-64 bg-[#0B1325] rounded-3xl border border-[rgba(255,255,255,0.08)]" />
        <Skeleton className="h-44 bg-[#0B1325] rounded-3xl border border-[rgba(255,255,255,0.08)]" />
      </div>
    );
  }

  // Days of current streak matching Image 3
  const streakDays = [
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: true },
    { day: 'Sun', completed: true, today: true }
  ];

  // Learning Modules A1-B2 matching user requirements
  const modules = [
    {
      level: 'A1',
      title: 'A1 - Beginner Immersion',
      badge: 'Current Level',
      progress: 20,
      color: 'from-emerald-500 to-teal-600',
      description: 'Greetings, personal introductions, shopping, directions, and essential verb tenses.',
      active: true,
      units: [
        { id: 'u1', name: 'Einheit 1: Sich vorstellen & Begrüßung', done: true },
        { id: 'u2', name: 'Einheit 2: Familie, Freunde & Berufe', done: false },
        { id: 'u3', name: 'Einheit 3: Essen, Trinken & Restaurant', done: false },
        { id: 'u4', name: 'Einheit 4: Akkusativ & Dativ Grundlagen', done: false }
      ]
    },
    {
      level: 'A2',
      title: 'A2 - Elementary Fluency',
      badge: 'Next Milestone',
      progress: 0,
      color: 'from-blue-500 to-indigo-600',
      description: 'Modal verbs, past tense (Perfekt & Präteritum), reflexive verbs, and everyday life in Germany.',
      active: false
    },
    {
      level: 'B1',
      title: 'B1 - Goethe-Zertifikat B1 Prep',
      badge: 'Accredited',
      progress: 0,
      color: 'from-purple-500 to-violet-600',
      description: 'Subjunctive II (Konjunktiv II), passive voice, complex sentence connectors, and Goethe exam simulation.',
      active: false
    },
    {
      level: 'B2',
      title: 'B2 - Upper-Intermediate Professional',
      badge: 'Career & University',
      progress: 0,
      color: 'from-amber-500 to-orange-600',
      description: 'Advanced business idioms, academic presentations, argumentation, and Telc B2 certification prep.',
      active: false
    }
  ];

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* 1. GREETING HEADER (Matching Image 3: Guten Tag, Alex! 👋) */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight flex items-center gap-2.5">
          <span>{t('student.greeting')}, {user?.firstName || 'Alex'}!</span>
          <span className="inline-block animate-wiggle text-3xl">👋</span>
        </h1>
        <p className="text-sm sm:text-base font-medium text-slate-400">
          {t('student.ready')}
        </p>
      </div>

      {/* 2. 4 COLORFUL METRIC CARDS (Exact match to Image 3 colors, spacing & top-aligned vertical layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: 25 Words Learned (Sky Blue #2891ED) */}
        <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 hover:border-[#2891ED]/50 transition-all duration-200 group flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#2891ED]/15 text-[#2891ED] border border-[#2891ED]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight block">
              {data?.wordsLearned || 25}
            </span>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {t('student.wordsLearned')}
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-[#2891ED] bg-[#2891ED]/10 border border-[#2891ED]/20">
                +5 today
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: 7 Day Streak (Vibrant Flame Orange #F87B08) */}
        <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 hover:border-[#F87B08]/50 transition-all duration-200 group flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#F87B08]/15 text-[#F87B08] border border-[#F87B08]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 fill-[#F87B08] stroke-[1.5]" />
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight block">
              {data?.streakDays || 7}
            </span>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {t('student.streak')}
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-[#F87B08] bg-[#F87B08]/10 border border-[#F87B08]/20">
                Personal Best! 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: 180m Study Time (Purple/Violet #C250D6) */}
        <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 hover:border-[#C250D6]/50 transition-all duration-200 group flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#C250D6]/15 text-[#C250D6] border border-[#C250D6]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight block">
              {data?.studyTimeMinutes || 180}m
            </span>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {t('student.studyTime')}
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-[#C250D6] bg-[#C250D6]/10 border border-[#C250D6]/20">
                This week
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: 12 Exercises Done (Emerald Green #1BC363) */}
        <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 hover:border-[#1BC363]/50 transition-all duration-200 group flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#1BC363]/15 text-[#1BC363] border border-[#1BC363]/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="mt-5">
            <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight block">
              {data?.exercisesDone || 12}
            </span>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {t('student.exercisesDone')}
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-[#1BC363] bg-[#1BC363]/10 border border-[#1BC363]/20">
                92% Accuracy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO CURRENT LEVEL A1 CARD (Full Width Banner matching Image 3) */}
      <div className="bg-[#0B1325] p-6 sm:p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Emerald Circular Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-heading font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/20 shrink-0">
              A1
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                  {t('student.currentLevel')}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">• CEFR Beginner</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                A1 - Beginner
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Unit 1 of 5 Completed • Next Milestone: Goethe-Zertifikat A1 Prep
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/lessons/lesson-101"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{t('student.continueLesson')}</span>
            </Link>
            <Link
              to="/student/courses"
              className="px-5 py-3 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 border border-[#2D385E] text-sm font-bold transition-colors text-center"
            >
              {t('student.viewCurriculum')}
            </Link>
          </div>
        </div>

        {/* 20% Glowing Emerald Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="text-slate-400">
              {language === 'de' ? 'Fortschritt' : 'Course Progress'}: 1 / 5 {language === 'de' ? 'Einheiten' : 'Units'}
            </span>
            <span className="text-emerald-400 font-black text-base">20%</span>
          </div>
          <div className="w-full bg-[#0B0F21] h-3.5 rounded-full overflow-hidden p-0.5 border border-[rgba(255,255,255,0.08)]">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full shadow-[0_0_16px_rgba(27,195,99,0.5)] transition-all duration-700"
              style={{ width: '20%' }}
            />
          </div>
        </div>
      </div>

      {/* 4. 7 DAY STREAK BANNER (Exact match to Image 3) */}
      <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <Flame className="w-7 h-7 fill-white stroke-[1.5]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                  {t('student.streakTitle')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-black border border-orange-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                {t('student.streakSub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto px-4 py-2 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-xs">
            <span className="text-slate-400">Next goal: <strong className="text-white">14 Day Streak</strong></span>
            <span className="font-extrabold text-[#F87B08] bg-[#F87B08]/10 px-2 py-0.5 rounded-md border border-[#F87B08]/30">
              +50 XP
            </span>
          </div>
        </div>

        {/* 7 Days pills Mon-Sun */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 pt-1">
          {streakDays.map((item, idx) => (
            <div
              key={idx}
              className={`py-2.5 sm:py-3 px-1 rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                item.today
                  ? 'bg-orange-500/20 border-2 border-orange-500/60 shadow-lg shadow-orange-500/20 text-orange-300'
                  : 'bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-bold tracking-tight">{item.day}</span>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. QUICK TIPS FOR LEARNING GERMAN (3-Column Card Layout) */}
      <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-lg font-heading font-black text-white">
            {t('student.quickTips')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-500/30">
              1
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-white block">Noun Gender Articles</strong>
              <p className="text-slate-400">Always memorize nouns with their article (<strong className="text-blue-400">der</strong>, <strong className="text-rose-400">die</strong>, <strong className="text-amber-400">das</strong>) and plural suffix.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-black flex items-center justify-center shrink-0 border border-blue-500/30">
              2
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-white block">Verb Position 2 Rule</strong>
              <p className="text-slate-400">In standard German main clauses, the conjugated verb is placed strictly in <strong className="text-white">Position 2</strong>.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center shrink-0 border border-purple-500/30">
              3
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-white block">Practice Pronunciation</strong>
              <p className="text-slate-400">Use the <strong className="text-emerald-400">Speaking Lab</strong> to practice German umlauts (ä, ö, ü) with instant audio pitch feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LEARNING MODULES (A1, A2, B1, B2) - User Specified Core Requirement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
              {t('student.learningModules')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Structured German curriculum compliant with CEFR / Goethe-Institut framework
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>All Courses</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((m) => (
            <div
              key={m.level}
              className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                m.active
                  ? 'bg-[#0B1325] border-emerald-500/40 shadow-xl shadow-black/50 ring-1 ring-emerald-500/20'
                  : 'bg-[#0B1325]/70 border-[rgba(255,255,255,0.08)] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.color} text-white font-heading font-black text-base flex items-center justify-center shadow-md`}>
                    {m.level}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-white">
                      {m.title}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      {m.badge}
                    </span>
                  </div>
                </div>

                {m.active && (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    20% Complete
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-3.5 leading-relaxed">
                {m.description}
              </p>

              {m.units && (
                <div className="space-y-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  {m.units.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-[#0B0F21]/60 transition-colors">
                      <div className="flex items-center gap-2.5">
                        {u.done ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <span className={u.done ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'}>
                          {u.name}
                        </span>
                      </div>
                      {!u.done && (
                        <Link
                          to="/lessons/lesson-101"
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 ml-2"
                        >
                          Start →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                <Link
                  to={m.active ? '/lessons/lesson-101' : '/student/courses'}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    m.active
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-[#1A2238] hover:bg-[#253050] text-slate-300 border border-[#2D385E]'
                  }`}
                >
                  {m.active ? 'Continue A1 Course' : `Enroll in ${m.level}`}
                </Link>
                <span className="text-[11px] text-slate-400 font-semibold">
                  80 CEFR Units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. INTERACTIVE PRACTICE HUB & CERTIFICATES */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
            {t('student.practiceHub')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Scientific learning tools for maximum vocabulary retention and pronunciation accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Practice Tool 1: SRS Vocabulary */}
          <Link
            to="/student/vocabulary"
            className="p-6 rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)] hover:border-[#2891ED]/50 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-xl shadow-black/40"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2891ED]/15 text-[#2891ED] flex items-center justify-center border border-[#2891ED]/30 group-hover:scale-110 transition-transform shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white group-hover:text-[#2891ED] transition-colors">
                {t('student.vocabulary')}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Leitner 5-box spaced repetition system with color-coded gender articles.
              </p>
            </div>
            <span className="text-xs font-bold text-[#2891ED] flex items-center gap-1 pt-1">
              Practice 25 Words <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 2: Audio Speaking Lab */}
          <Link
            to="/student/speaking"
            className="p-6 rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)] hover:border-emerald-500/50 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-xl shadow-black/40"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform shadow-inner">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white group-hover:text-emerald-400 transition-colors">
                {t('student.speakingLab')}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Record German sentences with live browser audio analysis and pitch feedback.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
              Start Speaking Lab <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 3: Grammar Drills */}
          <Link
            to="/student/materials"
            className="p-6 rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)] hover:border-[#C250D6]/50 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-xl shadow-black/40"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#C250D6]/15 text-[#C250D6] flex items-center justify-center border border-[#C250D6]/30 group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white group-hover:text-[#C250D6] transition-colors">
                {t('student.grammar')}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Akkusativ, Dativ, Wechselpräpositionen and verb conjugations worksheets.
              </p>
            </div>
            <span className="text-xs font-bold text-[#C250D6] flex items-center gap-1 pt-1">
              Download Worksheets <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 4: Goethe Certificates */}
          <div
            onClick={() => handleOpenCert()}
            className="p-6 rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)] hover:border-amber-400/50 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-xl shadow-black/40 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center border border-amber-400/30 group-hover:scale-110 transition-transform shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white group-hover:text-amber-400 transition-colors">
                {t('student.certificates')}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Verifiable CEFR completion certificate with unique verification code.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-1">
              View Certificate <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
}

export default StudentDashboard;
