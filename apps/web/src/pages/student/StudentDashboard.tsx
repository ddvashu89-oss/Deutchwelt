import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CertificateModal } from '../../components/ui/CertificateModal.js';
import { StudentIdCard } from '../../components/student/StudentIdCard.js';
import {
  Flame,
  Clock,
  BookOpen,
  Award,
  Play,
  Pause,
  RotateCcw,
  Video,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Users,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, certsRes]: any = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/student/certificates').catch(() => ({ success: false, certificates: [] }))
        ]);
        if (dashRes.success) {
          setData(dashRes.stats);
        }
        if (certsRes?.success && certsRes?.certificates) {
          setCertificates(certsRes.certificates);
        }
      } catch (e) {
        console.error('Error loading dashboard:', e);
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
      if (!certificates.length) return;
      setSelectedCert(certificates[0]);
    }
    setIsCertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  const streakDays = data?.streakDays || 0;
  const currentLevel = data?.currentLevel || user?.studentProfile?.currentLevel || 'A1';
  const minutesToday = data?.minutesSpentToday || 0;
  const dailyGoal = data?.dailyGoalMinutes || 20;
  const completedLessons = data?.completedLessonsCount || 0;
  const certCount = certificates.length;
  const progressPercent = data?.enrollments?.length ? Math.round(data.enrollments.reduce((sum: number, item: any) => sum + (item.progressPercentage || 0), 0) / data.enrollments.length) : 0;

  const weeklyData: any[] = [];

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR: Big Title + Pill Action Buttons             */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-gray-950">
            {t('sdash.title')}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {t('sdash.subtitle')} <span className="font-semibold text-gray-900">{user?.firstName || 'Student'}</span>{t('sdash.subtitleSuffix')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCert()}
            disabled={certificates.length === 0}
            title={certificates.length === 0 ? 'Complete all lessons in a course to earn a certificate' : 'View your certificate'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all shadow-xs"
          >
            <Award className="w-4 h-4 text-forest-700" />
            {t('sdash.viewCert')}
          </button>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-mint" />
            {t('sdash.continueLearning')}
          </Link>
        </div>
      </div>

      <StudentIdCard userId={user?.id} />

      {/* ============================================================== */}
      {/* 2. STATS ROW: 4 Cards (Card 1 Dark Forest Green, 3 White Cards)*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Featured Forest Green Card */}
        <div className="relative rounded-3xl bg-forest-900 text-white p-6 shadow-sm border border-forest-800 flex flex-col justify-between overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-emerald-100/90">
              Active Course
            </span>
            <Link
              to="/courses"
              className="w-8 h-8 rounded-full bg-forest-800/80 hover:bg-forest-700 flex items-center justify-center text-white transition-colors border border-forest-700/50"
              title="View Courses"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-white">
              {completedLessons}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30">
                Level {currentLevel}
              </span>
              <span className="text-xs text-emerald-100/70 font-medium">
              {progressPercent}% {t('sdash.completed')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: White Card - Daily Streak */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              {t('sdash.streakLabel')}
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors border border-gray-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {streakDays}
              <span className="text-base font-bold text-gray-400">{t('sdash.streakUnit')}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{t('sdash.streakHint')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: White Card - Study Time */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              {t('sdash.studyTime')}
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors border border-gray-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {minutesToday}
              <span className="text-base font-bold text-gray-400">/ {dailyGoal} Min</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-forest-700">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>{Math.max(0, dailyGoal - minutesToday)} {t('sdash.studyGoalSuffix')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: White Card - Certificates */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              {t('sdash.certificates')}
            </span>
            <button
              onClick={() => handleOpenCert()}
              disabled={certificates.length === 0}
              title={certificates.length === 0 ? 'Complete every lesson in a course to earn a certificate' : 'View your certificate'}
              className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors border border-gray-200/60"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {certCount}
              <span className="text-base font-bold text-gray-400">{t('sdash.certUnit')}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('sdash.certHint')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MIDDLE ROW (3 Columns): Analytics | Reminders | Lessons List */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Project/Study Analytics (Weekly Pill Bar Chart) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-bold text-gray-950">
              {t('sdash.analyticsTitle')}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              Diese Woche
            </span>
          </div>

          {/* 7 Pill Bars matching Donezo aesthetic */}
          <div className="relative pt-8 pb-3 px-2 flex items-end justify-between gap-2 h-44">
            {weeklyData.length ? weeklyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                {/* Floating Tooltip Bubble for Tuesday */}
                {item.active && (
                  <div className="absolute -top-1 px-2.5 py-1 rounded-full bg-gray-950 text-white text-[11px] font-bold shadow-md animate-bounce">
                    {item.pct}
                  </div>
                )}

                {/* Pill Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-full transition-all duration-500 ${
                    item.active
                      ? 'bg-mint ring-4 ring-mint/20'
                      : 'bg-stripes-pattern border border-gray-200'
                  }`}
                  style={{ height: `${item.height}%` }}
                />

                {/* Day label */}
                <span className={`text-xs font-bold ${item.active ? 'text-gray-950' : 'text-gray-400'}`}>
                  {item.day}
                </span>
              </div>
            )) : <p className="m-auto text-center text-sm text-gray-500">Your weekly activity will appear after lessons and exercises are completed.</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-mint" />
              Aktiver Lerntag
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-gray-300 bg-gray-100" />
              Ruhetag
            </span>
          </div>
        </div>

        {/* Column 2: Upcoming classes */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-gray-950">
              {t('sdash.remindersTitle')}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-forest-800 border border-emerald-200">
              {t('sdash.today')}
            </span>
          </div>

          <div className="space-y-3">{(data?.upcomingClasses || []).slice(0, 2).map((item: any) => <article key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="font-bold text-gray-900">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.batchName} · {new Date(item.startsAt).toLocaleString()}</p><a className="mt-3 inline-block text-sm font-bold text-forest-800 underline" href={item.meetingUrl} target="_blank" rel="noreferrer">Join class</a></article>)}{!data?.upcomingClasses?.length && <p className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">No live classes are scheduled for your enrolled batches yet.</p>}</div>
          <Link to="/student/schedule" className="mt-4 text-sm font-bold text-forest-800 underline">View full schedule</Link>
        </div>

        {/* Column 3: Active Lessons / Curriculum */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-gray-950">
              Lektionsübersicht
            </h2>
            <Link
              to="/student/courses"
              className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-0.5"
            >
              + Alle <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">{data?.continueLesson ? <><p className="text-sm font-bold text-gray-900">{data.continueLesson.title}</p><p className="mt-1 text-xs text-gray-500">{data.continueLesson.courseTitle} · {data.continueLesson.unitTitle}</p><Link className="mt-3 inline-block text-sm font-bold text-forest-800 underline" to={`/lessons/${data.continueLesson.id}`}>Continue lesson</Link></> : <p className="text-sm text-gray-500">Enroll in a course to see your next lesson here.</p>}</div>

          <Link
            to="/student/courses"
            className="w-full mt-3 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>+ Neue Lektion starten</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Placement test', '/student/placement-test', 'Check your CEFR level and get a study plan'], ['AI tutor', '/student/ai-tutor', 'Practice German and ask grammar questions'], ['Community Q&A', '/student/community', 'Ask questions and learn with your class'], ['Study materials', '/student/materials', 'Open teacher-shared worksheets and recordings']].map(([title, href, description]) => <Link key={href} to={href} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-forest-400"><p className="font-bold text-gray-900">{title}</p><p className="mt-2 text-sm text-gray-500">{description}</p><span className="mt-3 inline-block text-sm font-bold text-forest-800">Open →</span></Link>)}
      </section>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          certificate={selectedCert}
        />
      )}
    </div>
  );
}
