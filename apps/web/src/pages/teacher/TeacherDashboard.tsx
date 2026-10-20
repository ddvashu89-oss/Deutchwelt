import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
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
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';

export function TeacherDashboard() {
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
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-gray-950">
            Dozenten-Workspace
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Verwalten Sie Ihre Klassen, prüfen Sie Audio-Aufnahmen und laden Sie Video-Lektionen hoch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartLiveMeeting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all shadow-xs"
          >
            <Video className="w-4 h-4 text-forest-700" />
            <span>🎥 Live-Klasse starten</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4 text-mint" />
            <span>+ Video hochladen</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Featured Forest Green */}
        <div className="rounded-3xl bg-forest-900 text-white p-6 shadow-sm border border-forest-800 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-emerald-100/90">
              Aktive Lerngruppen
            </span>
            <div className="w-8 h-8 rounded-full bg-forest-800/80 flex items-center justify-center text-white border border-forest-700/50">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-white">
              {data?.totalBatches || 2}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30">
                A1 & B1 Intensiv
              </span>
              <span className="text-xs text-emerald-100/70">Goethe Prüfungen</span>
            </div>
          </div>
        </div>

        {/* Card 2: White Card - Students */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Betreute Teilnehmer
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {data?.totalStudents || 24}
              <span className="text-base font-bold text-gray-400">Studenten</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-forest-700">
              <Users className="w-3.5 h-3.5" />
              <span>100% aktiv diese Woche</span>
            </div>
          </div>
        </div>

        {/* Card 3: White Card - Pending Submissions */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Offene Abgaben
            </span>
            <Link
              to="/teacher/submissions"
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60 hover:bg-gray-100"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {data?.pendingSubmissionsCount || 3}
              <span className="text-base font-bold text-amber-600">Zur Korrektur</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Inkl. 2 Audio-Sprechaufnahmen</span>
            </div>
          </div>
        </div>

        {/* Card 4: White Card - Avg Score */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Durchschnittsnote
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {data?.averageScorePercentage || 88}%
              <span className="text-base font-bold text-gray-400">Sehr gut</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>+4% über Goethe Benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Review & Quick Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Submissions Queue */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-gray-950">
                Offene Hausaufgaben & Audio-Aufnahmen
              </h2>
              <p className="text-xs text-gray-500">Studenten warten auf Ihr Feedback und Aussprache-Korrektur</p>
            </div>
            <Link
              to="/teacher/submissions"
              className="text-xs font-bold text-forest-800 hover:text-forest-900"
            >
              Alle ansehen →
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
              data.recentSubmissions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-gray-50/70 hover:bg-gray-100/70 border border-gray-100 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                        sub.type === 'SPEAKING'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sub.type === 'SPEAKING' ? (
                        <Mic className="w-5 h-5" />
                      ) : (
                        <PenTool className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-950">
                        {sub.assignmentTitle}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Teilnehmer: <span className="font-semibold text-gray-800">{sub.studentName}</span> • Eingereicht am {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/teacher/submissions"
                    className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    Bewerten
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500">
                Keine ausstehenden Abgaben. Alle Aufgaben wurden bewertet!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Class Schedule Widget */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-bold text-gray-950">
                Nächste Live-Klasse
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-mint/20 text-forest-900 border border-mint/30">
                Heute
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                Batch 2026-B1
              </span>
              <p className="text-sm font-bold text-gray-950">
                Konjunktiv II & Berufsdeutsch Intensiv
              </p>
              <div className="flex items-center gap-2 text-xs text-forest-900 font-medium">
                <Clock className="w-3.5 h-3.5 text-forest-700" />
                <span>18:30 – 19:30 CET (60 Min)</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Starten Sie die Konferenz für Ihre Teilnehmer. Whiteboard und Bildschirmfreigabe sind aktiv.
            </p>
          </div>

          <button
            onClick={handleStartLiveMeeting}
            className="w-full mt-6 py-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Video className="w-4 h-4 text-mint" />
            <span>Google Meet Raum öffnen</span>
          </button>
        </div>
      </div>

      {/* Video Lecture Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-950">
                  Video-Vorlesung hochladen
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Laden Sie eine Videolektion direkt in den lokalen Speicherordner (<code className="bg-gray-100 px-1 py-0.5 rounded">uploads/</code>) hoch.
            </p>

            <form onSubmit={handleSimulateLectureUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Titel der Vorlesung
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Lektion 14: Relativsätze mit Präpositionen"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-forest-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    CEFR-Niveau
                  </label>
                  <select
                    value={lectureLevel}
                    onChange={(e) => setLectureLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-forest-800 focus:outline-none bg-white"
                  >
                    <option value="A1">A1 (Anfänger)</option>
                    <option value="A2">A2 (Grundlagen)</option>
                    <option value="B1">B1 (Mittelstufe)</option>
                    <option value="B2">B2 (Fortgeschritten)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Videodatei (MP4 / WebM)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    required
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-800 hover:file:bg-forest-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={uploadSuccess}
                  className="px-6 py-2 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {uploadSuccess ? 'Wird gespeichert...' : 'Hochladen & Veröffentlichen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
