import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CertificateModal } from '../../components/ui/CertificateModal.js';
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

  // Time Tracker State
  const [timerSeconds, setTimerSeconds] = useState(5048); // 01:24:08
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const handleOpenLiveClass = () => {
    // Google Meet / Zoom alert modal for test provision
    const confirmed = window.confirm(
      '🎥 Google Meet / Zoom Live Session\n\n' +
      'Deutsch Coaching B1: "Konjunktiv II & Berufsdeutsch"\n' +
      'Teacher: Frau Elena Schmidt\n' +
      'Platform: Google Meet (meet.google.com/dw-live-2026)\n\n' +
      'Click OK to open the meeting room in a new tab.'
    );
    if (confirmed) {
      window.open('https://meet.google.com/dw-deutsch-live', '_blank');
    }
  };

  const handleOpenCert = (cert?: any) => {
    if (cert) {
      setSelectedCert(cert);
    } else if (certificates.length > 0) {
      setSelectedCert(certificates[0]);
    } else {
      setSelectedCert({
        certificateNumber: 'DW-B1-2026-DEMO',
        studentName: user ? `${user.firstName} ${user.lastName}` : 'Max Mustermann',
        courseTitle: 'Deutsch B1 Intensivkurs — Beruf & Alltag',
        cefrLevel: 'B1',
        issueDate: new Date().toISOString(),
        grade: 'Sehr Gut (94%)',
        instructorName: 'Frau Elena Schmidt',
        instructorTitle: 'Head of German Faculty (Goethe-Prüferin)',
        isVerified: true
      });
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

  const streakDays = data?.streakDays || 10;
  const currentLevel = data?.currentLevel || 'B1';
  const minutesToday = data?.minutesSpentToday || 18;
  const dailyGoal = data?.dailyGoalMinutes || 25;
  const completedLessons = data?.completedLessons || 24;
  const certCount = certificates.length > 0 ? certificates.length : 2;

  // 7-day pill bar mock data
  const weeklyData = [
    { day: 'S', height: 40, active: false },
    { day: 'M', height: 60, active: false },
    { day: 'T', height: 95, active: true, pct: '74%' }, // highlighted
    { day: 'W', height: 45, active: false },
    { day: 'T', height: 70, active: false },
    { day: 'F', height: 85, active: false },
    { day: 'S', height: 50, active: false }
  ];

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
                41% {t('sdash.completed')}
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
            {weeklyData.map((item, idx) => (
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
            ))}
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

        {/* Column 2: Reminders & Live Class (Google Meet / Zoom) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-gray-950">
              {t('sdash.remindersTitle')}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-forest-800 border border-emerald-200">
              {t('sdash.today')}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                  {t('sdash.liveCoach')}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  18:30 – 19:30 CET
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                Sprechen & Argumentieren: Meinung äußern im Beruf
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                <div className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] font-bold flex items-center justify-center">
                  ES
                </div>
                <span>Frau Elena Schmidt (Goethe-Dozentin)</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 px-1">
              Live-Übertragung via Google Meet / Zoom. Interaktive Aussprache-Korrektur.
            </p>
          </div>

          {/* Big Meeting Pill Button */}
          <button
            onClick={handleOpenLiveClass}
            className="w-full mt-4 py-3 px-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all"
          >
            <Video className="w-4 h-4 text-mint" />
            {t('sdash.joinSession')}
          </button>
        </div>

        {/* Column 3: Active Lessons / Curriculum */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-gray-950">
              Lektionsübersicht
            </h2>
            <Link
              to="/courses"
              className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-0.5"
            >
              + Alle <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Lesson 1 (Completed) */}
            <div className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100/70 border border-gray-100 flex items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Wechselpräpositionen im Dativ
                  </p>
                  <p className="text-[11px] text-gray-500">Grammatik A2/B1 • 20 Min</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                Fertig
              </span>
            </div>

            {/* Lesson 2 (In Progress / Active) */}
            <div className="p-3 rounded-2xl bg-forest-50/60 border border-forest-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-mint" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-950">
                    Konjunktiv II: Höfliche Bitten
                  </p>
                  <p className="text-[11px] text-forest-800">Aktuelle Einheit • B1.2</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint text-forest-950">
                Aktiv
              </span>
            </div>

            {/* Lesson 3 (Upcoming) */}
            <div className="p-3 rounded-2xl bg-gray-50/60 border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-200/80 text-gray-500 flex items-center justify-center text-xs font-bold">
                  B2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    Wortschatz: Beruf & Vorstellungsgespräch
                  </p>
                  <p className="text-[11px] text-gray-400">Goethe B2 • 35 Min</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                Gesperrt
              </span>
            </div>
          </div>

          <Link
            to="/courses"
            className="w-full mt-3 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>+ Neue Lektion starten</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW (3 Columns): Batchmates | Gauge | Time Tracker   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Team Collaboration (Student Batchmates) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-gray-950">
              Team Collaboration
            </h2>
            <span className="text-xs font-semibold text-gray-400">Batch 2026-B1</span>
          </div>

          <div className="space-y-3">
            {/* Peer 1 */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-900 text-white font-bold text-xs flex items-center justify-center">
                  LW
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Lukas Weber</p>
                  <p className="text-[11px] text-gray-400">A2 Grammatik-Check</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Completed
              </span>
            </div>

            {/* Peer 2 */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  PS
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Priya Sharma</p>
                  <p className="text-[11px] text-gray-400">Sprechübung B1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                In Progress
              </span>
            </div>

            {/* Peer 3 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-800 text-white font-bold text-xs flex items-center justify-center">
                  MR
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Marco Rossi</p>
                  <p className="text-[11px] text-gray-400">Aussprache AI-Review</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                Pending
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Gemeinsam lernen</span>
            <Link
              to="/speech"
              className="text-xs font-bold text-forest-800 hover:text-forest-900"
            >
              Sprachlabor öffnen →
            </Link>
          </div>
        </div>

        {/* Column 2: Project Progress (Semi-Circular Radial Gauge) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-heading font-bold text-gray-950">
              Project Progress
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Gesamt
            </span>
          </div>

          {/* SVG Semi-Circle Radial Arc */}
          <div className="relative flex flex-col items-center justify-center py-2">
            <svg viewBox="0 0 200 115" className="w-48 h-28 overflow-visible">
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Active Mint Progress Arc (41% of semi-circle arc length: ~103 of 251) */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#34D399"
                strokeWidth="18"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 * (1 - 0.41)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Large centered metric */}
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-3xl font-heading font-black tracking-tight text-gray-950">
                41%
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                Mastery B1
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-around text-[11px] text-gray-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-mint" />
              Completed (41%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-800" />
              In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              Pending
            </span>
          </div>
        </div>

        {/* Column 3: Time Tracker (Dark Textured Organic Card) */}
        <div className="rounded-3xl bg-[#111827] text-white p-6 shadow-md border border-gray-800 flex flex-col justify-between bg-mesh-dark relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {t('sdash.timerLabel')}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-mint animate-ping' : 'bg-gray-500'}`} />
              <span className="text-xs text-gray-400">
                {isTimerRunning ? t('sdash.timerRunning') : t('sdash.timerPaused')}
              </span>
            </div>
          </div>

          {/* Digital Timer Display */}
          <div className="my-5 flex flex-col items-center justify-center">
            <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-white drop-shadow-sm select-none">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {t('sdash.timerSession')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 py-3 px-4 rounded-full bg-mint hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-gray-950" /> {t('sdash.pauseTimer')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-gray-950" /> {t('sdash.startTimer')}
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="w-11 h-11 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-gray-700/60"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
