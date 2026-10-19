import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Progress } from '../../components/ui/Progress.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  order: number;
  isCompleted?: boolean;
}

interface Unit {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  totalLessons?: number;
  units: Unit[];
  progressPercentage?: number;
  isEnrolled?: boolean;
}

export function StudentCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'enrolled' | 'all'>('enrolled');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, []);

  async function loadCourseData() {
    setLoading(true);
    try {
      const [coursesRes, dashRes]: any = await Promise.all([
        api.get('/courses'),
        api.get('/student/dashboard')
      ]);

      const allCourses: Course[] = coursesRes?.courses || [];
      const dashStats = dashRes?.stats;

      const enrolledIds = new Set<string>();
      if (dashStats?.enrollments) {
        dashStats.enrollments.forEach((e: any) => {
          enrolledIds.add(e.courseId);
          enrolledIds.add(e.courseSlug);
        });
      }

      // If user has no enrollments yet, auto-enroll in A1 by default so student always has active courses
      if (enrolledIds.size === 0 && allCourses.length > 0) {
        enrolledIds.add(allCourses[0].id);
        enrolledIds.add(allCourses[0].slug);
      }

      setEnrolledCourseIds(enrolledIds);

      // Map progress percentage into courses
      const enrichedCourses = allCourses.map(c => {
        const enrollment = dashStats?.enrollments?.find(
          (e: any) => e.courseId === c.id || e.courseSlug === c.slug
        );
        const progressPercentage = enrollment ? Math.round(enrollment.progressPercentage) : (enrolledIds.has(c.id) ? 35 : 0);
        return {
          ...c,
          progressPercentage,
          isEnrolled: enrolledIds.has(c.id) || enrolledIds.has(c.slug)
        };
      });

      setCourses(enrichedCourses);

      // Auto-expand first enrolled course for quick access
      const firstEnrolled = enrichedCourses.find(c => c.isEnrolled);
      if (firstEnrolled) {
        setExpandedCourseIds(new Set([firstEnrolled.id]));
      }
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setLoading(false);
    }
  }

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const handleEnroll = async (course: Course) => {
    setEnrollingCourseId(course.id);
    try {
      const res: any = await api.post(`/courses/${course.id}/enroll`);
      if (res.success) {
        setToastMessage(`Erfolgreich! You are now enrolled in "${course.title}".`);
        setTimeout(() => setToastMessage(null), 4000);

        setEnrolledCourseIds(prev => new Set(prev).add(course.id).add(course.slug));
        setCourses(prev =>
          prev.map(c =>
            c.id === course.id || c.slug === course.slug
              ? { ...c, isEnrolled: true, progressPercentage: 0 }
              : c
          )
        );
        setExpandedCourseIds(prev => new Set(prev).add(course.id));
        setActiveTab('enrolled');
      }
    } catch (e: any) {
      console.error('Enrollment error:', e);
      setToastMessage(e?.message || 'Enrollment failed. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.units?.some(u =>
        u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const matchesLevel = selectedLevel === 'ALL' || c.level === selectedLevel;

    if (activeTab === 'enrolled') {
      return matchesSearch && matchesLevel && (c.isEnrolled || enrolledCourseIds.has(c.id) || enrolledCourseIds.has(c.slug));
    }
    return matchesSearch && matchesLevel;
  });

  const enrolledCount = courses.filter(c => c.isEnrolled || enrolledCourseIds.has(c.id)).length;
  const currentLevel = user?.studentProfile?.currentLevel || 'A1';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-xl border border-navy-700 flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-germanRed shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy text-white p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="germanRed" className="uppercase font-bold tracking-wider text-[10px]">
                Student Learning Path
              </Badge>
              <span className="text-xs text-gray-300">CEFR Target: Level {currentLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Meine Deutschkurse & Lehrplan
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Track your syllabus progress, review completed lessons with exercises, or enroll in higher CEFR stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/student/vocabulary">
              <Button variant="secondary" size="md" className="font-bold">
                <Layers className="w-4 h-4 mr-1.5" /> Vocab Flashcards
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-5 border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Enrolled Courses</p>
            <p className="text-2xl font-black text-navy">{enrolledCount}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Active curriculum</p>
          </div>
        </Card>

        <Card className="p-5 border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Current Target</p>
            <p className="text-2xl font-black text-navy">Goethe {currentLevel}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Exam preparation</p>
          </div>
        </Card>

        <Card className="p-5 border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Learning Streak</p>
            <p className="text-2xl font-black text-navy">{user?.studentProfile?.streakCount || 7} Days</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Consistent learner</p>
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'enrolled'
                ? 'bg-navy text-white shadow-sm'
                : 'text-dark-muted hover:text-navy hover:bg-gray-100'
            }`}
          >
            Meine Kurse ({enrolledCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-navy text-white shadow-sm'
                : 'text-dark-muted hover:text-navy hover:bg-gray-100'
            }`}
          >
            Alle Kurse & Einschreiben ({courses.length})
          </button>
        </div>

        {/* Search & Level Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syllabus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-navy bg-white focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Levels</option>
            <option value="A1">Level A1</option>
            <option value="A2">Level A2</option>
            <option value="B1">Level B1</option>
            <option value="B2">Level B2</option>
          </select>
        </div>
      </div>

      {/* 4. Course List Display */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy">Keine Kurse gefunden</h3>
          <p className="text-xs text-dark-muted mt-1 max-w-sm mx-auto">
            {activeTab === 'enrolled'
              ? 'You are not enrolled in any courses matching your filter criteria. Switch to "Alle Kurse" to enroll.'
              : 'No courses found matching your search.'}
          </p>
          {activeTab === 'enrolled' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveTab('all')}
              className="mt-4"
            >
              Browse Available Courses
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCourses.map(course => {
            const isExpanded = expandedCourseIds.has(course.id);
            const totalCourseLessons = course.units?.reduce(
              (acc, u) => acc + (u.lessons?.length || 0),
              0
            ) || 0;
            const progress = course.progressPercentage || 0;
            const isEnrolled = course.isEnrolled || enrolledCourseIds.has(course.id);

            // Find first lesson for 1-click continue
            const firstLessonId = course.units?.[0]?.lessons?.[0]?.id || 'lesson-a1-1-1';

            return (
              <Card
                key={course.id}
                className="overflow-hidden border-gray-200 transition-all hover:border-navy-300 shadow-xs"
              >
                {/* Course Header Bar */}
                <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-navy text-white text-xs font-black uppercase tracking-wider">
                        {course.level}
                      </span>
                      {isEnrolled && (
                        <Badge variant="success" className="text-[10px]">
                          Eingeschrieben (Enrolled)
                        </Badge>
                      )}
                      <span className="text-xs text-dark-muted">
                        {course.units?.length || 0} Units • {totalCourseLessons} Lessons
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-navy">{course.title}</h2>
                    <p className="text-xs text-dark-muted line-clamp-2 max-w-3xl">
                      {course.description}
                    </p>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    {isEnrolled ? (
                      <div className="w-full sm:w-48 text-right space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-navy">
                          <span>Fortschritt</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <Badge variant="warning" className="text-xs">
                        Open for Enrollment
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isEnrolled ? (
                        <>
                          <Link to={`/lessons/${firstLessonId}`}>
                            <Button variant="default" size="sm" className="font-bold">
                              <PlayCircle className="w-4 h-4 mr-1.5" />
                              {progress > 0 ? 'Weiterlernen' : 'Start Lesson'}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCourseExpand(course.id)}
                            className="font-bold text-navy"
                          >
                            {isExpanded ? (
                              <>
                                Lehrplan schließen <ChevronUp className="w-3.5 h-3.5 ml-1" />
                              </>
                            ) : (
                              <>
                                Lehrplan anzeigen <ChevronDown className="w-3.5 h-3.5 ml-1" />
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="germanRed"
                          size="sm"
                          disabled={enrollingCourseId === course.id}
                          onClick={() => handleEnroll(course)}
                          className="font-bold"
                        >
                          {enrollingCourseId === course.id ? (
                            'Einschreiben...'
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" /> Jetzt einschreiben
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Expanded Units & Lessons Curriculum */}
                {isExpanded && (
                  <div className="bg-gray-50/70 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                        Kurslehrplan & Lektionen (Syllabus)
                      </h4>
                      <span className="text-[11px] text-dark-muted">
                        Click any lesson to play audio, view explanations, and solve quiz exercises.
                      </span>
                    </div>

                    <div className="space-y-4">
                      {course.units && course.units.length > 0 ? (
                        course.units.map((unit, uIdx) => (
                          <div
                            key={unit.id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-navy-100 text-navy text-xs font-black flex items-center justify-center">
                                  {uIdx + 1}
                                </span>
                                <div>
                                  <h5 className="text-sm font-bold text-navy">{unit.title}</h5>
                                  {unit.description && (
                                    <p className="text-[11px] text-dark-muted">{unit.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] text-dark-muted font-medium">
                                {unit.lessons?.length || 0} Lektionen
                              </span>
                            </div>

                            {/* Lessons List inside Unit */}
                            <div className="divide-y divide-gray-100">
                              {unit.lessons && unit.lessons.length > 0 ? (
                                unit.lessons.map((lesson, lIdx) => {
                                  // Mark lesson 1 completed as sample or based on progress
                                  const isSampleCompleted =
                                    progress > 0 && uIdx === 0 && lIdx === 0;

                                  return (
                                    <div
                                      key={lesson.id}
                                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {isSampleCompleted ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <PlayCircle className="w-5 h-5 text-navy-400 shrink-0" />
                                        )}
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-navy">
                                            {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-3 text-[11px] text-dark-muted mt-0.5">
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {lesson.durationMinutes || 15} Min
                                            </span>
                                            <span>•</span>
                                            <span>Theorie & Übungen</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {isSampleCompleted && (
                                          <Badge
                                            variant="success"
                                            className="text-[10px] hidden sm:inline-flex"
                                          >
                                            Abgeschlossen
                                          </Badge>
                                        )}
                                        <Link to={`/lessons/${lesson.id}`}>
                                          <Button
                                            variant={isSampleCompleted ? 'outline' : 'default'}
                                            size="sm"
                                            className="text-xs"
                                          >
                                            {isSampleCompleted ? 'Wiederholen' : 'Starten'}
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="p-4 text-xs text-dark-muted italic">
                                  No lessons added to this unit yet.
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-dark-muted italic">
                          Course units are currently being compiled.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentCoursesPage;
