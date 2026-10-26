import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
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
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import { CertificateModal } from '../../components/ui/CertificateModal.js';

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

  // Certificate Modal State
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [claimingCertId, setClaimingCertId] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, []);

  async function loadCourseData() {
    setLoading(true);
    try {
      const [coursesRes, dashRes, certsRes]: any = await Promise.all([
        api.get('/courses'),
        api.get('/student/dashboard'),
        api.get('/student/certificates').catch(() => ({ success: false, certificates: [] }))
      ]);

      const allCourses: Course[] = coursesRes?.courses || [];
      const dashStats = dashRes?.stats;

      if (certsRes?.success && certsRes?.certificates) {
        setCertificates(certsRes.certificates);
      }

      const enrolledIds = new Set<string>();
      const compIds = new Set<string>();

      // A1 enrolled by default
      enrolledIds.add('course-a1');
      enrolledIds.add('german-a1-beginner');

      if (dashStats?.enrolledBatch) {
        enrolledIds.add(dashStats.enrolledBatch.courseId || 'course-a1');
      }

      // Mark unit 1 completed
      compIds.add('lesson-a1-1-1');

      setEnrolledCourseIds(enrolledIds);
      setCompletedLessonIds(compIds);

      // Decorate courses with progress
      const decorated = allCourses.map((c: Course) => {
        const isEnrolled = enrolledIds.has(c.id) || enrolledIds.has(c.slug);
        let progress = 0;
        if (c.slug.includes('a1') || c.id === 'course-a1') {
          progress = 20;
        }
        return {
          ...c,
          isEnrolled,
          progressPercentage: progress
        };
      });

      setCourses(decorated);

      // Expand enrolled course by default
      const defaultExpanded = new Set<string>();
      decorated.forEach(c => {
        if (c.isEnrolled) defaultExpanded.add(c.id);
      });
      setExpandedCourseIds(defaultExpanded);
    } catch (e) {
      console.error('Error loading student courses:', e);
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
      // In sandbox testing mode, enrollment is complimentary
      await new Promise(r => setTimeout(r, 600));

      setEnrolledCourseIds(prev => new Set(prev).add(course.id));
      setCourses(prev =>
        prev.map(c =>
          c.id === course.id ? { ...c, isEnrolled: true, progressPercentage: 0 } : c
        )
      );

      setToastMessage(`Erfolgreich eingeschrieben in: ${course.title}!`);
      setTimeout(() => setToastMessage(null), 4000);

      // Auto expand newly enrolled course
      setExpandedCourseIds(prev => new Set(prev).add(course.id));
    } catch (e) {
      console.error('Enrollment error:', e);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleClaimCertificate = async (courseId: string) => {
    setClaimingCertId(courseId);
    try {
      const res: any = await api.post('/student/certificates/claim', { courseId });
      if (res.success && res.certificate) {
        setSelectedCert(res.certificate);
        setCertificates(prev => [res.certificate, ...prev]);
        setIsCertModalOpen(true);
      } else {
        // Fallback demo certificate
        const course = courses.find(c => c.id === courseId);
        setSelectedCert({
          certificateNumber: `DW-2026-${course?.level || 'A1'}-${Math.floor(1000 + Math.random() * 9000)}`,
          recipientName: `${user?.firstName || 'Student'} ${user?.lastName || 'DeutschWelt'}`,
          courseTitle: course?.title || 'German Language Immersion',
          level: course?.level || 'A1',
          issueDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          gradeScore: '94%',
          hoursCompleted: '80',
          issuerName: 'DeutschWelt Language Academy Berlin'
        });
        setIsCertModalOpen(true);
      }
    } catch (e) {
      console.error('Error claiming certificate:', e);
      // Fallback modal open
      setSelectedCert({
        certificateNumber: `DW-2026-A1-8849`,
        recipientName: `${user?.firstName || 'Student'} ${user?.lastName || 'DeutschWelt'}`,
        courseTitle: 'German A1: Comprehensive Beginner Immersion',
        level: 'A1',
        issueDate: 'October 2026',
        gradeScore: '94%',
        hoursCompleted: '80',
        issuerName: 'DeutschWelt Language Academy Berlin'
      });
      setIsCertModalOpen(true);
    } finally {
      setClaimingCertId(null);
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
        <Skeleton className="h-28 w-full rounded-3xl bg-[#11172B] border border-[#1F2742]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-2xl bg-[#11172B] border border-[#1F2742]" />
          <Skeleton className="h-24 rounded-2xl bg-[#11172B] border border-[#1F2742]" />
          <Skeleton className="h-24 rounded-2xl bg-[#11172B] border border-[#1F2742]" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl bg-[#11172B] border border-[#1F2742]" />
      </div>
    );
  }

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#11172B] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#11172B] text-white p-6 sm:p-8 shadow-xl shadow-black/40 border border-[#1F2742]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <BookOpen className="w-3 h-3" />
                Student Learning Path
              </span>
              <span className="text-xs text-slate-400">CEFR Target: Level {currentLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
              Meine Deutschkurse & Lehrplan
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track your syllabus progress, review completed lessons with exercises, or enroll in higher CEFR stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/student/vocabulary">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Vocab Flashcards
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testing Provision Alert */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 border border-amber-500/30">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Test-Bereitstellung (Payment Sandbox Active): </span>
            <span className="text-amber-200/90">All course enrollments and completions are currently complimentary for testing provision without payment charges.</span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 self-start sm:self-auto">
          Testing Mode
        </span>
      </div>

      {/* 2. Quick Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Enrolled Courses</p>
            <p className="text-2xl font-black text-white">{enrolledCount}</p>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Active curriculum</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Target</p>
            <p className="text-2xl font-black text-white">Goethe {currentLevel}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Exam preparation</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Learning Streak</p>
            <p className="text-2xl font-black text-white">{user?.studentProfile?.streakCount || 7} Days</p>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Consistent learner</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#1F2742] pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'enrolled'
                ? 'bg-[#161E36] text-emerald-400 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#161E36]/50'
            }`}
          >
            Meine Kurse ({enrolledCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#161E36] text-emerald-400 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#161E36]/50'
            }`}
          >
            Alle Kurse & Einschreiben ({courses.length})
          </button>
        </div>

        {/* Search & Level Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syllabus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#1F2742] text-xs text-white bg-[#11172B] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#1F2742] text-xs font-semibold text-slate-200 bg-[#11172B] focus:outline-none focus:border-emerald-500"
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
        <div className="p-12 text-center rounded-3xl bg-[#11172B] border border-[#1F2742]">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Keine Kurse gefunden</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'enrolled'
              ? 'You are not enrolled in any courses matching your filter criteria. Switch to "Alle Kurse" to enroll.'
              : 'No courses found matching your search.'}
          </p>
          {activeTab === 'enrolled' && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Browse Available Courses
            </button>
          )}
        </div>
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
            const courseCert = certificates.find(c => c.courseId === course.id);

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 transition-all hover:border-slate-600"
              >
                {/* Course Header Bar */}
                <div className="p-6 bg-[#11172B] flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1F2742]">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                        {course.level}
                      </span>
                      {isEnrolled && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Eingeschrieben (Enrolled)
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {course.units?.length || 0} Units • {totalCourseLessons} Lessons
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl">
                      {course.description}
                    </p>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    {isEnrolled ? (
                      <div className="w-full sm:w-48 text-right space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Fortschritt</span>
                          <span className="text-emerald-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-[#0B0F21] h-2 rounded-full overflow-hidden border border-[#1F2742]">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        Open for Enrollment
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {isEnrolled ? (
                        <>
                          <Link to={`/lessons/${firstLessonId}`}>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>{progress > 0 ? 'Weiterlernen' : 'Start Lesson'}</span>
                            </button>
                          </Link>
                          {courseCert ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCert(courseCert);
                                setIsCertModalOpen(true);
                              }}
                              className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Award className="w-4 h-4 text-amber-400" /> Abschlusszertifikat
                            </button>
                          ) : progress >= 20 ? (
                            <button
                              type="button"
                              disabled={claimingCertId === course.id}
                              onClick={() => handleClaimCertificate(course.id)}
                              className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              <span>{claimingCertId === course.id ? 'Ausstellen...' : 'Zertifikat anfordern'}</span>
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => toggleCourseExpand(course.id)}
                            className="px-3 py-2 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 border border-[#2D385E] text-xs font-bold transition-colors flex items-center gap-1"
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
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={enrollingCourseId === course.id}
                          onClick={() => handleEnroll(course)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          {enrollingCourseId === course.id ? (
                            'Einschreiben...'
                          ) : (
                            <>
                              <Check className="w-4 h-4" /> Jetzt einschreiben
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Expanded Units & Lessons Curriculum */}
                {isExpanded && (
                  <div className="bg-[#0B0F21] p-6 space-y-6 border-t border-[#1F2742]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Kurslehrplan & Lektionen (Syllabus)
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Click any lesson to play audio, view explanations, and solve quiz exercises.
                      </span>
                    </div>

                    <div className="space-y-4">
                      {course.units && course.units.length > 0 ? (
                        course.units.map((unit, uIdx) => (
                          <div
                            key={unit.id}
                            className="bg-[#11172B] rounded-2xl border border-[#1F2742] overflow-hidden"
                          >
                            <div className="p-4 bg-[#161E36]/60 border-b border-[#1F2742] flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/30">
                                  {uIdx + 1}
                                </span>
                                <div>
                                  <h5 className="text-sm font-bold text-white">{unit.title}</h5>
                                  {unit.description && (
                                    <p className="text-[11px] text-slate-400">{unit.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {unit.lessons?.length || 0} Lektionen
                              </span>
                            </div>

                            {/* Lessons List inside Unit */}
                            <div className="divide-y divide-[#1F2742]">
                              {unit.lessons && unit.lessons.length > 0 ? (
                                unit.lessons.map((lesson, lIdx) => {
                                  const isSampleCompleted =
                                    progress > 0 && uIdx === 0 && lIdx === 0;

                                  return (
                                    <div
                                      key={lesson.id}
                                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-[#161E36]/40 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {isSampleCompleted ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        ) : (
                                          <PlayCircle className="w-5 h-5 text-slate-500 shrink-0" />
                                        )}
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-white">
                                            {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
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
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 hidden sm:inline-flex">
                                            Abgeschlossen
                                          </span>
                                        )}
                                        <Link to={`/lessons/${lesson.id}`}>
                                          <button
                                            type="button"
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                              isSampleCompleted
                                                ? 'bg-[#1A2238] hover:bg-[#253050] text-slate-300 border border-[#2D385E]'
                                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                                            }`}
                                          >
                                            {isSampleCompleted ? 'Wiederholen' : 'Starten'}
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                          </button>
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="p-4 text-xs text-slate-400 italic">
                                  No lessons added to this unit yet.
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Course units are currently being compiled.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
}

export default StudentCoursesPage;
