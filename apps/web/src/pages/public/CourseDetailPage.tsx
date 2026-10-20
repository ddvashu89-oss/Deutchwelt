import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  PlayCircle,
  FileText,
  Lock,
  ChevronRight,
  ShieldCheck,
  Video,
  Award,
  Sparkles
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
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-64 w-full rounded-4xl" />
        <Skeleton className="h-96 w-full rounded-4xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-heading font-black text-gray-950">Kurs nicht gefunden</h2>
        <p className="text-sm text-gray-500">Der angeforderte Deutschkurs existiert nicht oder wurde verschoben.</p>
        <Link to="/courses">
          <button className="px-6 py-2.5 rounded-full bg-forest-900 text-white font-bold text-xs shadow-md">
            Alle Kurse ansehen
          </button>
        </Link>
      </div>
    );
  }

  const firstLesson = course.units?.[0]?.lessons?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-gray-500 gap-1.5">
        <Link to="/" className="hover:text-gray-950">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/courses" className="hover:text-gray-950">Kurse</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-950 truncate">{course.title}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-4xl p-8 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-forest-900 text-mint text-xs font-black tracking-wider">
              Niveau {course.level}
            </span>
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-forest-700" /> ca. {course.estimatedHours} Stunden
            </span>
          </div>
          {isEnrolled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Eingeschrieben
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-950 tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Empfohlene Vorkenntnisse: </span>
              {course.prerequisites.map((p: any) => p.prerequisiteCourse?.title).join(', ')}
            </div>
          </div>
        )}

        {/* Payment Sandbox / Testing Provision Alert */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Testmodus aktiv:</strong> Kursgebühren (€299) werden zu Testzwecken automatisch erlassen.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0 self-start sm:self-auto border border-amber-200">
            Sandbox Aktiv
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
          {isEnrolled ? (
            firstLesson ? (
              <Link to={`/lessons/${firstLesson.id}`}>
                <button className="px-8 py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                  <PlayCircle className="w-4 h-4 text-mint" />
                  <span>Kurs starten / Lektion fortsetzen</span>
                </button>
              </Link>
            ) : null
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-8 py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>{enrolling ? 'Wird freigeschaltet...' : 'Jetzt kostenlos einschreiben'}</span>
              <ArrowRight className="w-4 h-4 text-mint" />
            </button>
          )}
          {message && <p className="text-xs text-emerald-700 font-bold">{message}</p>}
        </div>
      </div>

      {/* Curriculum Units & Lessons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-black text-gray-950 tracking-tight">
          Lehrplan & Lektionen
        </h2>

        <div className="space-y-4">
          {course.units?.map((unit: any, idx: number) => (
            <div key={unit.id} className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
                    Einheit {idx + 1}
                  </span>
                  <h3 className="text-lg font-heading font-bold text-gray-950 mt-0.5">
                    {unit.title}
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {unit.lessons?.length || 0} Lektionen
                </span>
              </div>

              {unit.description && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  {unit.description}
                </p>
              )}

              {/* Lessons List */}
              <div className="space-y-2 pt-2">
                {unit.lessons?.map((lesson: any, lIdx: number) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-gray-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {lIdx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{lesson.title}</p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span>{lesson.durationMinutes} Min</span>
                          {lesson.exercises?.length > 0 && <span>• {lesson.exercises.length} Übungen</span>}
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="px-4 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-gray-800 text-xs font-bold shadow-xs transition-colors shrink-0"
                      >
                        Starten →
                      </Link>
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
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
