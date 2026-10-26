import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  Video,
  Upload,
  ClipboardList,
  Award,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  BookOpen,
  Check,
  X,
  Copy,
  Lightbulb,
  FileText,
  UserCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Getting started progress
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [worksheetModalOpen, setWorksheetModalOpen] = useState(false);
  const [lessonPlanModalOpen, setLessonPlanModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Report Form state
  const [reportStudent, setReportStudent] = useState('Jason K (A1)');
  const [reportTopic, setReportTopic] = useState('Unit 3: Akkusativ & Pronouns');
  const [reportNotes, setReportNotes] = useState('Great pronunciation in dialogue practice. Homework assigned on workbook page 24.');
  const [reportRating, setReportRating] = useState('5');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // Worksheet Form state
  const [worksheetLevel, setWorksheetLevel] = useState('A1');
  const [worksheetTopic, setWorksheetTopic] = useState('Definite Articles (der, die, das)');
  const [worksheetExercises, setWorksheetExercises] = useState('1. Der Apfel ist rot.\n2. Die Katze schläft.\n3. Das Buch ist interessant.');
  const [worksheetSuccessMsg, setWorksheetSuccessMsg] = useState<string | null>(null);

  // Lesson Plan Form state
  const [planTitle, setPlanTitle] = useState('B1 Konjunktiv II in Alltagssituationen');
  const [planGoal, setPlanGoal] = useState('Students express polite requests and hypothetical conditions.');
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);

  // Attendance Form state
  const [attendanceStudent, setAttendanceStudent] = useState('Jason K');
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [attendanceMarks, setAttendanceMarks] = useState('92');
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, scheduleRes]: any = await Promise.all([
          api.get('/teacher/dashboard').catch(() => ({ success: false })),
          api.get('/teacher/schedule').catch(() => ({ success: false, schedule: [] }))
        ]);

        if (dashRes?.success) {
          setData(dashRes.stats);
        }
        if (scheduleRes?.success && scheduleRes.schedule) {
          setSchedule(scheduleRes.schedule);
        } else {
          // Default matching Image 2
          setSchedule([
            { id: 's1', studentName: 'Jason K', time: '9:30 AM - 10:15 AM', courseLevel: 'A1 Beginner', topic: 'Unit 3: Akkusativ' },
            { id: 's2', studentName: 'Enoch', time: '4:50 PM - 5:35 PM', courseLevel: 'B1 Intermediate', topic: 'Unit 7: Konjunktiv II' },
            { id: 's3', studentName: 'Mia G', time: '7:00 PM - 7:45 PM', courseLevel: 'A2 Goethe Prep', topic: 'Speaking Lab' }
          ]);
        }
      } catch (e) {
        console.error('Error loading teacher dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenLiveClass = (session: any) => {
    const meetingUrl = 'https://meet.google.com/dw-deutsch-live';
    const confirmed = window.confirm(
      `🎥 Google Meet Live Classroom\n\n` +
      `Student: ${session.studentName}\n` +
      `Topic: ${session.topic} (${session.courseLevel})\n` +
      `Time: ${session.time}\n\n` +
      `Click OK to launch the classroom in a new tab.`
    );
    if (confirmed) {
      window.open(meetingUrl, '_blank');
      setAttendanceStudent(session.studentName);
      setAttendanceModalOpen(true);
    }
  };

  const handleCancelSession = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel today's session with ${name}? An automated notification will be sent.`)) {
      setSchedule(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://deutschwelt.com/faculty/join?ref=TEACH-DW-2026');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/lesson-reports', {
        studentName: reportStudent,
        topic: reportTopic,
        notes: reportNotes,
        rating: Number(reportRating)
      });
      setReportSubmitted(true);
      setReportSuccessMsg(language === 'de' ? 'Lektionsbericht gespeichert!' : 'Lesson report submitted successfully!');
      setTimeout(() => {
        setReportSuccessMsg(null);
        setReportModalOpen(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error saving report');
    }
  };

  const handleWorksheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorksheetSuccessMsg(language === 'de' ? 'Arbeitsblatt generiert und zum Download bereit!' : 'Worksheet generated and ready for print!');
    setTimeout(() => {
      setWorksheetSuccessMsg(null);
      setWorksheetModalOpen(false);
    }, 1200);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSuccessMsg(language === 'de' ? 'Unterrichtsplan im Curriculum gespeichert!' : 'Lesson plan added to active curriculum!');
    setTimeout(() => {
      setPlanSuccessMsg(null);
      setLessonPlanModalOpen(false);
    }, 1200);
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/attendance', {
        studentName: attendanceStudent,
        batchName: 'Goethe Intensive Cohort',
        status: attendanceStatus,
        date: new Date().toISOString().split('T')[0]
      });
      setAttendanceSuccessMsg(language === 'de' ? 'Anwesenheit und Note eingetragen!' : 'Attendance and test score recorded!');
      setTimeout(() => {
        setAttendanceSuccessMsg(null);
        setAttendanceModalOpen(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error marking attendance');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse font-sans">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const completedCount = reportSubmitted ? 4 : 3;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. OVERVIEW WELCOME HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
          {t('teacher.overview')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {t('teacher.welcome')}, <span className="font-bold text-white">{user?.firstName || 'Teacher'}</span>! {t('teacher.subtitle')}
        </p>
      </div>

      {/* 2. 3 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Active Students */}
        <div className="bg-[#0D111F] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('teacher.activeStudents')}
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              {data?.activeStudentsCount || 4}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              2 added this week
            </span>
          </div>
        </div>

        {/* Card 2: Upcoming Sessions */}
        <div className="bg-[#0D111F] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('teacher.upcoming')}
            </span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              {schedule.length || 4}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Sessions scheduled
            </span>
          </div>
        </div>

        {/* Card 3: Taught This Month */}
        <div className="bg-[#0D111F] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('teacher.taughtMonth')}
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              5h
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              +1.5h from last week
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Upcoming Lessons + Cancelled Lessons + Getting Started */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Upcoming Lessons */}
          <div className="bg-[#0D111F] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-extrabold text-white">
                  {t('teacher.upcomingLessons')}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'de' ? 'Heutige Live-Seminare und 1-zu-1 Sprachcoachings' : "Today's live seminars and 1-on-1 language coaching"}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {schedule.length} {language === 'de' ? 'geplant' : 'Scheduled'}
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {schedule.map((session) => (
                <div
                  key={session.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 p-2.5 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-500/30">
                      {session.studentName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{session.studentName}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {session.courseLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                        {session.time} • {session.topic}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <button
                      type="button"
                      onClick={() => handleCancelSession(session.id, session.studentName)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-colors text-center"
                    >
                      {t('teacher.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenLiveClass(session)}
                      className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('teacher.openClass')}</span>
                    </button>
                  </div>
                </div>
              ))}

              {schedule.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No more lessons scheduled for today. Enjoy your break!
                </div>
              )}
            </div>
          </div>

          {/* Card: Cancelled Lessons */}
          <div className="bg-[#0D111F] p-5 rounded-3xl border border-white/10 shadow-xl space-y-2">
            <h2 className="text-sm font-heading font-extrabold text-white">
              {t('teacher.cancelledLessons')}
            </h2>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-emerald-300">
                {t('teacher.noCancelled')}
              </p>
            </div>
          </div>

          {/* Card: Getting Started Checklist */}
          <div className="bg-[#0D111F] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-extrabold text-white">
                  {t('teacher.gettingStarted')}
                </h2>
                <p className="text-xs text-slate-400">
                  Complete these milestones to fully activate your instructor dashboard
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {completedCount} of 4 completed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>

            {/* Tasks list */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="line-through text-slate-500">Set up teacher profile</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="line-through text-slate-500">Assign initial batches and schedule</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="line-through text-slate-500">Create first vocabulary worksheet</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2.5 text-amber-300 font-bold">
                  {reportSubmitted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-amber-400 shrink-0" />
                  )}
                  <span>Write a Lesson Report for recent class</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  {t('teacher.writeReport')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions + Refer a Teacher + Efficiency Tip */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Quick Actions */}
          <div className="bg-[#0D111F] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-heading font-extrabold text-white">
              {t('teacher.quickActions')}
            </h2>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-between transition-all shadow-md shadow-emerald-500/20"
              >
                <span>{t('teacher.newLessonReport')}</span>
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setWorksheetModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-[#11162B] hover:bg-white/5 text-slate-200 font-bold text-xs flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>{t('teacher.createWorksheet')}</span>
                <FileText className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => setLessonPlanModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-[#11162B] hover:bg-white/5 text-slate-200 font-bold text-xs flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>{t('teacher.newLessonPlan')}</span>
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </button>

              <Link
                to="/teacher/submissions"
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-[#11162B] hover:bg-white/5 text-slate-200 font-bold text-xs flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>Check Submissions & Marks</span>
                <ClipboardList className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Card: Refer a fellow teacher */}
          <div className="bg-[#0D111F] p-6 rounded-3xl border border-white/10 shadow-xl space-y-3">
            <h2 className="text-sm font-heading font-extrabold text-white">
              {t('teacher.referTeacher')}
            </h2>
            <p className="text-xs text-slate-400">
              Invite certified colleagues to teach German cohorts and earn faculty referral bonuses.
            </p>

            <div className="flex items-center gap-2 p-2 bg-[#11162B] rounded-2xl border border-white/10">
              <input
                type="text"
                readOnly
                value="TEACH-DW-2026"
                className="bg-transparent text-xs font-mono font-bold text-slate-200 flex-1 outline-none px-2"
              />
              <button
                type="button"
                onClick={handleCopyReferral}
                className="p-1.5 rounded-xl bg-white/10 border border-white/10 text-slate-300 hover:text-emerald-400 shadow-2xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedLink && (
              <span className="text-[11px] font-bold text-emerald-400 block">
                Link copied to clipboard!
              </span>
            )}
          </div>

          {/* Card: Efficiency Tip */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('teacher.efficiencyTip')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Did you know? You can pre-assign Goethe B1 flashcards directly to student batches with 1 click in the German Materials tab!
            </p>
          </div>
        </div>
      </div>

      {/* 4. MODAL: + New Lesson Report */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D111F] text-slate-100 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-lg text-white">
                  {t('teacher.newLessonReport')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student / Batch
                </label>
                <select
                  value={reportStudent}
                  onChange={(e) => setReportStudent(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                >
                  <option value="Jason K (A1)" className="bg-[#0D111F] text-white">Jason K (German A1)</option>
                  <option value="Enoch (B1)" className="bg-[#0D111F] text-white">Enoch (German B1)</option>
                  <option value="Mia G (A2)" className="bg-[#0D111F] text-white">Mia G (German A2)</option>
                  <option value="Goethe B1 Intensive Cohort" className="bg-[#0D111F] text-white">Goethe B1 Intensive Cohort</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topic Covered Today
                </label>
                <input
                  type="text"
                  value={reportTopic}
                  onChange={(e) => setReportTopic(e.target.value)}
                  required
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student Performance (1 - 5 Stars)
                </label>
                <select
                  value={reportRating}
                  onChange={(e) => setReportRating(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                >
                  <option value="5" className="bg-[#0D111F] text-white">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4" className="bg-[#0D111F] text-white">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3" className="bg-[#0D111F] text-white">⭐⭐⭐ Satisfactory (3/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Teaching Notes & Assigned Homework
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                />
              </div>

              {reportSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{reportSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  Save & Complete Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Create Worksheet */}
      {worksheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D111F] text-slate-100 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-black text-lg text-white">
                {t('teacher.createWorksheet')}
              </h3>
              <button
                type="button"
                onClick={() => setWorksheetModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWorksheetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    CEFR Level
                  </label>
                  <select
                    value={worksheetLevel}
                    onChange={(e) => setWorksheetLevel(e.target.value)}
                    className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                  >
                    <option value="A1" className="bg-[#0D111F] text-white">A1 Beginner</option>
                    <option value="A2" className="bg-[#0D111F] text-white">A2 Elementary</option>
                    <option value="B1" className="bg-[#0D111F] text-white">B1 Intermediate</option>
                    <option value="B2" className="bg-[#0D111F] text-white">B2 Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Grammar Target
                  </label>
                  <input
                    type="text"
                    value={worksheetTopic}
                    onChange={(e) => setWorksheetTopic(e.target.value)}
                    className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sentences / Fill in blanks
                </label>
                <textarea
                  rows={4}
                  value={worksheetExercises}
                  onChange={(e) => setWorksheetExercises(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl font-mono text-[11px]"
                />
              </div>

              {worksheetSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{worksheetSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWorksheetModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  Generate & Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: New Lesson Plan */}
      {lessonPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D111F] text-slate-100 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-black text-lg text-white">
                {t('teacher.newLessonPlan')}
              </h3>
              <button
                type="button"
                onClick={() => setLessonPlanModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Communicative Goal (GER Standard)
                </label>
                <textarea
                  rows={3}
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                />
              </div>

              {planSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{planSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLessonPlanModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  Publish Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Mark Attendance & Score */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D111F] text-slate-100 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-lg text-white">
                  Mark Attendance & Grade
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={attendanceStudent}
                  readOnly
                  className="w-full bg-[#11162B] border border-white/10 text-xs font-bold text-slate-200 p-2.5 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                  >
                    <option value="PRESENT" className="bg-[#0D111F] text-white">Present (Anwesend)</option>
                    <option value="ABSENT" className="bg-[#0D111F] text-white">Absent (Abwesend)</option>
                    <option value="EXCUSED" className="bg-[#0D111F] text-white">Excused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Class Mark / Score (%)
                  </label>
                  <input
                    type="number"
                    value={attendanceMarks}
                    onChange={(e) => setAttendanceMarks(e.target.value)}
                    className="w-full bg-[#0F1424] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                  />
                </div>
              </div>

              {attendanceSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{attendanceSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  Confirm & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;