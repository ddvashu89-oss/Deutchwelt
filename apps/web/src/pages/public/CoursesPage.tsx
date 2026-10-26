import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { BookOpen, Clock, CheckCircle, ArrowRight, ArrowUpRight, Filter, ShieldCheck, Sparkles } from 'lucide-react';

export function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  useEffect(() => {
    async function loadCourses() {
      try {
        const query = selectedLevel !== 'ALL' ? { level: selectedLevel } : undefined;
        const res: any = await api.get('/courses', query);
        if (res.success) {
          setCourses(res.courses);
        }
      } catch (e) {
        console.error('Error fetching courses:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
          {t('courses.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-gray-950 tracking-tight">
          {t('courses.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {t('courses.subtitle')}
        </p>
      </div>

      {/* Testing Sandbox Alert */}
      <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Testbetrieb aktiv:</strong> Alle Kurseinschreibungen können im Testmodus kostenfrei ohne Zahlungsdaten freigeschaltet werden.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0 self-start sm:self-auto border border-amber-200">
          Sandbox Modus
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200/80">
        <span className="text-xs font-bold uppercase text-gray-400 mr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['ALL', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => { setSelectedLevel(lvl); setLoading(true); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedLevel === lvl
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-950'
            }`}
          >
            {lvl === 'ALL' ? 'Alle Niveaus (A1–B2)' : `Niveau ${lvl}`}
          </button>
        ))}
      </div>

      {/* Course List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-7 bg-white rounded-3xl border border-gray-200/80 space-y-4">
              <Skeleton className="h-6 w-1/3 rounded-xl" />
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 shadow-xs">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-950">Keine Kurse gefunden</h3>
          <p className="text-xs text-gray-500 mt-1">Bitte wählen Sie einen anderen Filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl bg-white p-7 border border-gray-200/80 shadow-xs hover:shadow-card hover:border-gray-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-forest-900 text-mint text-xs font-black tracking-wider">
                    {course.level}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-forest-700" /> ca. {course.estimatedHours} Stunden
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-gray-950 tracking-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Objectives */}
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-forest-900">
                      Lernziele & Kompetenzen:
                    </p>
                    <ul className="space-y-1.5">
                      {course.learningObjectives.slice(0, 3).map((obj: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-mint mt-0.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">
                  {course.units?.length || 2} Lerneinheiten
                </span>

                <Link
                  to={`/courses/${course.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Lehrplan & Einschreiben</span>
                  <ArrowUpRight className="w-4 h-4 text-mint" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
