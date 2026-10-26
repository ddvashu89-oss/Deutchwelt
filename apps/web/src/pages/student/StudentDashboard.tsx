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
        <Skeleton className="h-12 w-72 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 bg-slate-800 rounded-3xl" />
          <Skeleton className="h-64 bg-slate-800 rounded-3xl" />
          <Skeleton className="h-64 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Days of current streak
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
      description: 'Greetings, personal introduction, shopping, directions, and essential verb tenses.',
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
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. GREETING HEADER (Matching Image 3: Guten Tag! 👋) */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight flex items-center gap-2">
          <span>{t('student.greeting')}, {user?.firstName || 'Student'}!</span>
          <span className="inline-block animate-wiggle">👋</span>
        </h1>
        <p className="text-sm font-medium text-slate-400">
          {t('student.ready')}
        </p>
      </div>

      {/* 2. 4 COLORFUL METRIC CARDS (Exact match to Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: 25 Words Learned (Blue) */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-slate-700/60 shadow-lg flex items-center gap-4 hover:border-slate-600 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-heading font-black text-white">
              {data?.wordsLearned || 25}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {t('student.wordsLearned')}
            </p>
            <span className="text-[10px] font-bold text-blue-400 mt-0.5 block">
              +5 today
            </span>
          </div>
        </div>

        {/* Card 2: 7 Day Streak (Orange/Flame) */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-slate-700/60 shadow-lg flex items-center gap-4 hover:border-slate-600 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30 shadow-inner">
            <Flame className="w-6 h-6 fill-orange-400/30" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-heading font-black text-white">
              {data?.streakDays || 7}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {t('student.streak')}
            </p>
            <span className="text-[10px] font-bold text-orange-400 mt-0.5 block">
              Personal Best! 🔥
            </span>
          </div>
        </div>

        {/* Card 3: 180m Study Time (Purple) */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-slate-700/60 shadow-lg flex items-center gap-4 hover:border-slate-600 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-heading font-black text-white">
              {data?.studyTimeMinutes || 180}m
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {t('student.studyTime')}
            </p>
            <span className="text-[10px] font-bold text-purple-400 mt-0.5 block">
              This week
            </span>
          </div>
        </div>

        {/* Card 4: 12 Exercises Done (Emerald) */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-slate-700/60 shadow-lg flex items-center gap-4 hover:border-slate-600 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-heading font-black text-white">
              {data?.exercisesDone || 12}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {t('student.exercisesDone')}
            </p>
            <span className="text-[10px] font-bold text-emerald-400 mt-0.5 block">
              92% Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* 3. THREE FEATURE CARDS (Current Level A1, 7 Day Streak, Quick Tips - Matching Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Current Level A1 (with 20% progress bar) */}
        <div className="bg-[#1E293B] p-5 sm:p-6 rounded-3xl border border-slate-700/60 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {t('student.currentLevel')}
            </span>
            <h2 className="text-xl font-heading font-black text-white">
              A1 - Beginner
            </h2>
            <p className="text-xs text-slate-400">
              {t('student.levelProgress')}: 20% • Next Milestone: A1 Exam Prep
            </p>
          </div>

          {/* Progress Bar (20% glowing emerald) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Einheit 1 von 5</span>
              <span className="text-emerald-400 font-extrabold">20%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-500"
                style={{ width: '20%' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/lessons/lesson-101"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold text-center transition-all shadow-md active:scale-95"
            >
              {t('student.continueLesson')}
            </Link>
            <Link
              to="/student/courses"
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              {t('student.viewCurriculum')}
            </Link>
          </div>
        </div>

        {/* Card 2: 7 Day Streak! 🔥 (Matching Image 3) */}
        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700/60 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400/40" />
              <h2 className="text-xl font-heading font-black text-white">
                {t('student.streakTitle')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('student.streakSub')}
            </p>
          </div>

          {/* 7 Days pills Mon-Sun */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {streakDays.map((item, idx) => (
              <div
                key={idx}
                className={`py-1.5 sm:py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 min-w-0 ${
                  item.today
                    ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                    : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-bold truncate">{item.day}</span>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center shrink-0">
                  <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
            <span>Next goal: 14 Day Streak</span>
            <span className="font-bold text-orange-400">+50 XP</span>
          </div>
        </div>

        {/* Card 3: Quick Tips for Learning German (Matching Image 3) */}
        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700/60 shadow-lg flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-5 h-5" />
            <h2 className="text-base font-heading font-black text-white">
              {t('student.quickTips')}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-2">
              <span className="font-bold text-emerald-400 shrink-0">1.</span>
              <p>Always learn nouns with their gender (<strong>der</strong>, <strong>die</strong>, <strong>das</strong>) and plural forms.</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-2">
              <span className="font-bold text-blue-400 shrink-0">2.</span>
              <p>In standard main clauses, the conjugated German verb is strictly placed in <strong>Position 2</strong>.</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-2">
              <span className="font-bold text-purple-400 shrink-0">3.</span>
              <p>Practice speaking in the <strong>Speaking Lab</strong> for immediate AI pronunciation feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LEARNING MODULES (A1, A2, B1, B2) - User Specified Core Requirement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-black text-white tracking-tight">
              {t('student.learningModules')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured German curriculum compliant with CEFR / Goethe-Institut framework
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>All Courses</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((m) => (
            <div
              key={m.level}
              className={`p-6 rounded-3xl border transition-all ${
                m.active
                  ? 'bg-[#1E293B] border-emerald-500/40 shadow-xl'
                  : 'bg-[#1E293B]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
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
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    20% Complete
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {m.description}
              </p>

              {m.units && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-700/60">
                  {m.units.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        {u.done ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <span className={u.done ? 'text-slate-300 line-through' : 'text-slate-200 font-medium'}>
                          {u.name}
                        </span>
                      </div>
                      {!u.done && (
                        <Link
                          to="/lessons/lesson-101"
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                        >
                          Start →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <Link
                  to={m.active ? '/lessons/lesson-101' : '/courses'}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    m.active
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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

      {/* 5. INTERACTIVE PRACTICE HUB & CERTIFICATES */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-heading font-black text-white tracking-tight">
            {t('student.practiceHub')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Scientific learning tools for maximum vocabulary retention and pronunciation accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Practice Tool 1: SRS Vocabulary */}
          <Link
            to="/student/vocabulary"
            className="p-5 rounded-3xl bg-[#1E293B] border border-slate-700/60 hover:border-slate-500 transition-all group flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-blue-400 transition-colors">
                {t('student.vocabulary')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Leitner 5-box spaced repetition system with color-coded gender articles.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              Practice 25 Words <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 2: Audio Speaking Lab */}
          <Link
            to="/student/speaking"
            className="p-5 rounded-3xl bg-[#1E293B] border border-slate-700/60 hover:border-slate-500 transition-all group flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-emerald-400 transition-colors">
                {t('student.speakingLab')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Record German sentences with live browser audio analysis and pitch feedback.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              Start Speaking Lab <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 3: Grammar Drills */}
          <Link
            to="/student/materials"
            className="p-5 rounded-3xl bg-[#1E293B] border border-slate-700/60 hover:border-slate-500 transition-all group flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-purple-400 transition-colors">
                {t('student.grammar')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Akkusativ, Dativ, Wechselpräpositionen and verb conjugations.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
              Download Worksheets <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Practice Tool 4: Goethe Certificates */}
          <div
            onClick={() => handleOpenCert()}
            className="p-5 rounded-3xl bg-[#1E293B] border border-slate-700/60 hover:border-slate-500 transition-all group flex flex-col justify-between space-y-4 shadow-lg cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white group-hover:text-amber-400 transition-colors">
                {t('student.certificates')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verifiable CEFR completion certificate with unique verification code.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
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