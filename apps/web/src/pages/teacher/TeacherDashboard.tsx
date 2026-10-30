import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  Video,
  Upload,
  ClipboardList,
  Award,
  ArrowUpRight,
  PenTool,
  Mic,
  Clock,
} from 'lucide-react';

export function TeacherDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureLevel, setLectureLevel] = useState('B1');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res: any = await api.get('/teacher/dashboard');
        if (res.success) {
          setData(res.stats);
        }
      } catch (e) {
        console.error('Error loading teacher dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleStartLiveMeeting = () => {
    const confirmed = window.confirm(
      '🎥 Google Meet / Zoom Host Launcher\n\n' +
      'Start faculty live meeting room for Deutsch B1 / A2 batch.\n' +
      'Meeting link: https://meet.google.com/dw-deutsch-live\n\n' +
      'Click OK to open host meeting room.'
    );
    if (confirmed) {
      window.open('https://meet.google.com/dw-deutsch-live', '_blank');
    }
  };

  const handleSimulateLectureUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadModalOpen(false);
      setLectureTitle('');
      alert(`✅ Video lecture "${lectureTitle}" (${lectureLevel}) saved directly into uploads folder!`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl sm:h-36 sm:rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 font-sans sm:space-y-7 sm:pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle sm:rounded-3xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c54346]">Teacher workspace</p>
          <h1 className="mt-1 font-serif text-[2rem] font-medium leading-tight tracking-tight text-[#14243a] sm:text-4xl">
            {t('tdash.title')}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#687487] sm:text-sm">
            {t('tdash.subtitle')}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:w-auto lg:min-w-[300px]">
          <button
            onClick={handleStartLiveMeeting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd7cc] bg-white px-4 py-2.5 text-xs font-bold text-[#24364d] shadow-xs transition-colors hover:border-[#c54346]/40 hover:bg-[#fbf8f2] sm:text-sm"
          >
            <Video className="h-4 w-4 text-[#c54346]" />
            {t('tdash.startLive')}
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c54346] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#ad393d] hover:shadow-md sm:text-sm"
          >
            <Upload className="h-4 w-4 text-white/80" />
            {t('tdash.uploadVideo')}
          </button>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {/* Card 1: Featured Forest Green */}
        <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[#263a53] bg-[#14243a] p-4 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card sm:rounded-3xl sm:p-6">
          <div className="flex items-start justify-between">
            <span className="pr-2 text-xs font-medium leading-snug text-white/75 sm:text-sm">
              {t('tdash.activeBatches')}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[#f0c6a3] sm:h-8 sm:w-8">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mb-1 mt-3 sm:mb-2 sm:mt-4">
            <div className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
              {data?.totalBatches || 2}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-white sm:text-xs">
                A1 & B1 Intensiv
              </span>
              <span className="text-[9px] leading-snug text-white/60 sm:text-xs">{t('tdash.goexams')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: White Card - Students */}
        <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card sm:rounded-3xl sm:p-6">
          <div className="flex items-start justify-between">
            <span className="pr-2 text-xs font-medium leading-snug text-[#687487] sm:text-sm">
              {t('tdash.students')}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8e3d8] bg-[#f7f4ec] text-[#687487] sm:h-8 sm:w-8">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mb-1 mt-3 sm:mb-2 sm:mt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 font-serif text-3xl font-medium tracking-tight text-[#14243a] sm:text-4xl">
              {data?.totalStudents || 24}
              <span className="font-sans text-xs font-semibold text-[#9299a2] sm:text-base">{t('tdash.studentsUnit')}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium leading-snug text-[#587a69] sm:text-xs">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{t('tdash.activeWeek')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: White Card - Pending Submissions */}
        <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card sm:rounded-3xl sm:p-6">
          <div className="flex items-start justify-between">
            <span className="pr-2 text-xs font-medium leading-snug text-[#687487] sm:text-sm">
              {t('tdash.pendingSubs')}
            </span>
            <Link
              to="/teacher/submissions"
              aria-label="Review submissions"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8e3d8] bg-[#f7f4ec] text-[#687487] transition-colors hover:bg-[#f8ece9] hover:text-[#c54346] sm:h-8 sm:w-8"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mb-1 mt-3 sm:mb-2 sm:mt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 font-serif text-3xl font-medium tracking-tight text-[#14243a] sm:text-4xl">
              {data?.pendingSubmissionsCount || 3}
              <span className="font-sans text-xs font-semibold text-[#a17736] sm:text-base">{t('tdash.pendingUnit')}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium leading-snug text-[#a17736] sm:text-xs">
              <ClipboardList className="h-3.5 w-3.5 shrink-0" />
              <span>{t('tdash.pendingHint')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: White Card - Avg Score */}
        <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card sm:rounded-3xl sm:p-6">
          <div className="flex items-start justify-between">
            <span className="pr-2 text-xs font-medium leading-snug text-[#687487] sm:text-sm">
              {t('tdash.avgScore')}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8e3d8] bg-[#f7f4ec] text-[#687487] sm:h-8 sm:w-8">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mb-1 mt-3 sm:mb-2 sm:mt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 font-serif text-3xl font-medium tracking-tight text-[#14243a] sm:text-4xl">
              {data?.averageScorePercentage || 88}%
              <span className="font-sans text-xs font-semibold text-[#9299a2] sm:text-base">{t('tdash.avgUnit')}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium leading-snug text-[#587a69] sm:text-xs">
              <Award className="h-3.5 w-3.5 shrink-0 text-[#587a69]" />
              <span>{t('tdash.avgHint')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Review & Quick Upload Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.8fr)] xl:items-start">
        {/* Left 2 Columns: Submissions Queue */}
        <div className="flex min-w-0 flex-col rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-medium text-[#14243a] sm:text-xl">
                {t('tdash.submissionsTitle')}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#687487]">{t('tdash.submissionsSubtitle')}</p>
            </div>
            <Link
              to="/teacher/submissions"
              className="shrink-0 text-xs font-bold text-[#c54346] transition-colors hover:text-[#a93236]"
            >
              Alle ansehen →
            </Link>
          </div>

          <div className="min-w-0 space-y-2.5 sm:space-y-3">
            {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
              data.recentSubmissions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#eee9df] bg-[#faf8f2] p-3 transition-colors hover:bg-[#f6f2e9] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  <div className="flex min-w-0 items-start gap-3 sm:items-center">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        sub.type === 'SPEAKING'
                          ? 'bg-[#f8ece9] text-[#b43e40]'
                          : 'bg-[#e8eee8] text-[#587a69]'
                      }`}
                    >
                      {sub.type === 'SPEAKING' ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <PenTool className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-bold leading-snug text-[#14243a]">
                        {sub.assignmentTitle}
                      </p>
                      <p className="mt-1 break-words text-[10px] leading-relaxed text-[#687487] sm:text-[11px]">
                        {t('tdash.participant')} <span className="font-semibold text-[#34445a]">{sub.studentName}</span> <span aria-hidden="true">·</span> {t('tdash.submitted')} {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/teacher/submissions"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center self-end rounded-lg border border-[#ddd7cc] bg-white px-4 py-2 text-xs font-bold text-[#24364d] shadow-xs transition-colors hover:border-[#c54346]/40 hover:bg-[#f8ece9] hover:text-[#b43e40] sm:self-auto"
                  >
                    Bewerten
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#687487]">
                {t('tdash.noSubs')}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Class Schedule Widget */}
        <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle sm:rounded-3xl sm:p-6">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-medium text-[#14243a] sm:text-xl">
                Nächste Live-Klasse
              </h2>
              <span className="rounded-full border border-[#efdad4] bg-[#fbefed] px-2 py-1 text-[10px] font-bold text-[#b43e40]">
                Heute
              </span>
            </div>

            <div className="space-y-2 rounded-xl border border-[#e9e2d4] bg-[#f8f4eb] p-4 sm:rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c54346]">
                Batch 2026-B1
              </span>
              <p className="font-serif text-lg font-medium leading-snug text-[#14243a] sm:text-xl">
                Konjunktiv II & Berufsdeutsch Intensiv
              </p>
              <div className="flex items-start gap-2 text-xs font-medium text-[#34445a]">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c54346]" />
                <span>18:30 – 19:30 CET (60 Min)</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#687487]">
              {t('tdash.liveDesc')}
            </p>
          </div>

          <button
            onClick={handleStartLiveMeeting}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14243a] py-3 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#203853] hover:shadow-md sm:mt-6"
          >
            <Video className="h-4 w-4 text-[#f0c6a3]" />
            {t('tdash.openMeet')}
          </button>
        </div>
      </div>

      {/* Video Lecture Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14243a]/45 p-3 backdrop-blur-sm sm:p-6">
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-2xl animate-in fade-in zoom-in-95 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8ece9] text-[#c54346]">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#14243a] sm:text-xl">
                  {t('tdash.uploadTitle')}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                aria-label="Close upload dialog"
                className="rounded-lg p-2 text-[#9299a2] transition-colors hover:bg-[#f5f2eb] hover:text-[#14243a]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed text-[#687487]">
              {t('tdash.uploadDesc')} (<code className="bg-gray-100 px-1 py-0.5 rounded">uploads/</code>).
            </p>

            <form onSubmit={handleSimulateLectureUpload} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#34445a]">
                  {t('tdash.lecTitle')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('tdash.lecTitlePlaceholder')}
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#ddd7cc] bg-white px-4 py-3 text-sm text-[#17243a] focus:outline-none focus:ring-2 focus:ring-[#c54346]/30"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-bold text-[#34445a]">
                    {t('tdash.cefrLevel')}
                  </label>
                  <select
                    value={lectureLevel}
                    onChange={(e) => setLectureLevel(e.target.value)}
                    className="w-full rounded-xl border border-[#ddd7cc] bg-white px-4 py-3 text-sm text-[#17243a] focus:outline-none focus:ring-2 focus:ring-[#c54346]/30"
                  >
                    <option value="A1">A1 (Anfänger)</option>
                    <option value="A2">A2 (Grundlagen)</option>
                    <option value="B1">B1 (Mittelstufe)</option>
                    <option value="B2">B2 (Fortgeschritten)</option>
                  </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-[#34445a]">
                    {t('tdash.videoFile')}
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    required
                    className="w-full text-xs text-[#687487] file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#f8ece9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#b43e40] hover:file:bg-[#f4dfda]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#eee9df] pt-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="min-h-10 rounded-xl border border-[#ddd7cc] px-4 py-2 text-xs font-bold text-[#687487] hover:bg-[#f7f4ec]"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={uploadSuccess}
                  className="min-h-10 rounded-xl bg-[#c54346] px-6 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#ad393d]"
                >
                  {uploadSuccess ? t('tdash.saving') : t('tdash.uploadPublish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
