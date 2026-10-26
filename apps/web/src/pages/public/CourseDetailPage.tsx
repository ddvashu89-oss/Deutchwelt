import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  PlayCircle,
  Lock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res: any = await api.get(`/courses/${slug}`);
        if (res.success) {
          setCourse(res.course);
          setIsEnrolled(res.isEnrolled);
        }
      } catch (e) {
        console.error('Error loading course:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      const res: any = await api.post(`/courses/${course.id}/enroll`);
      if (res.success) {
        setIsEnrolled(true);
        setMessage('Sie sind nun offiziell für diesen Kurs eingeschrieben!');
      }
    } catch (e: any) {
      setMessage(e.message || 'Einschreibung fehlgeschlagen.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-pulse font-sans">
        <Skeleton className="h-6 w-48 rounded-full bg-white/5" />
        <Skeleton className="h-64 w-full rounded-4xl bg-white/5" />
        <Skeleton className="h-96 w-full rounded-4xl bg-white/5" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-sans text-white">
        <BookOpen className="w-16 h-16 text-slate-500 mx-auto" />
        <h2 className="text-2xl font-heading font-black text-white">Kurs nicht gefunden</h2>
        <p className="text-sm text-slate-400">Der angeforderte Deutschkurs existiert nicht oder wurde verschoben.</p>
        <Link to="/courses">
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md">
            Alle Kurse ansehen
          </button>
        </Link>
      </div>
    );
  }

  const firstLesson = course.units?.[0]?.lessons?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans text-slate-100">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-slate-400 gap-1.5">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        <Link to="/courses" className="hover:text-white transition-colors">Kurse</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-white truncate">{course.title}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-[#11162B] rounded-4xl p-8 sm:p-10 border border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black tracking-wider shadow-md shadow-indigo-500/20">
              Niveau {course.level}
            </span>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-400" /> ca. {course.estimatedHours} Stunden
            </span>
          </div>
          {isEnrolled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Eingeschrieben
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0D1120] border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Empfohlene Vorkenntnisse: </span>
              {course.prerequisites.map((p: any) => p.prerequisiteCourse?.title).join(', ')}
            </div>
          </div>
        )}

        {/* Payment Sandbox Alert */}
        <div className="p-4 rounded-2xl bg-[#0D1120] border border-indigo-500/30 text-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong className="text-white">Testmodus aktiv:</strong> Kursgebühren (€299) werden zu Testzwecken automatisch erlassen.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 shrink-0 self-start sm:self-auto border border-indigo-500/30">
            Sandbox Aktiv
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-4">
          {isEnrolled ? (
            firstLesson ? (
              <Link to={`/lessons/${firstLesson.id}`}>
                <button className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all">
                  <PlayCircle className="w-4 h-4 text-white" />
                  <span>Kurs starten / Lektion fortsetzen</span>
                </button>
              </Link>
            ) : null
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>{enrolling ? 'Wird freigeschaltet...' : 'Jetzt kostenlos einschreiben'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}
          {message && <p className="text-xs text-emerald-400 font-bold">{message}</p>}
        </div>
      </div>

      {/* Curriculum Units & Lessons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-black text-white tracking-tight">
          Lehrplan & Lektionen
        </h2>

        <div className="space-y-4">
          {course.units?.map((unit: any, idx: number) => (
            <div key={unit.id} className="bg-[#11162B] rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Einheit {idx + 1}
                  </span>
                  <h3 className="text-lg font-heading font-bold text-white mt-0.5">
                    {unit.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {unit.lessons?.length || 0} Lektionen
                </span>
              </div>

              {unit.description && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {unit.description}
                </p>
              )}

              {/* Lessons List */}
              <div className="space-y-2 pt-2">
                {unit.lessons?.map((lesson: any, lIdx: number) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-2xl bg-[#0D1120] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-[#141A32] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {lIdx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{lesson.title}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{lesson.durationMinutes} Min</span>
                          {lesson.exercises?.length > 0 && <span>• {lesson.exercises.length} Übungen</span>}
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                      >
                        Starten →
                      </Link>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
