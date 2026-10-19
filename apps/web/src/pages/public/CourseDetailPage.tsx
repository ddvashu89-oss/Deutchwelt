import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
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
  ChevronRight
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
        setMessage('You are now officially enrolled in this course!');
      }
    } catch (e: any) {
      console.error('Enrollment error:', e);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-bold text-navy">Course Not Found</h2>
        <p className="text-sm text-dark-muted">The requested German course does not exist or has been relocated.</p>
        <Link to="/courses">
          <Button variant="primary">Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  const firstLesson = course.units?.[0]?.lessons?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-dark-muted gap-1.5">
        <Link to="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/courses" className="hover:text-dark">Courses</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-dark">{course.title}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/90 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-lg bg-navy text-white text-xs font-black tracking-wider">
              Level {course.level}
            </span>
            <span className="text-xs font-semibold text-dark-muted flex items-center gap-1">
              <Clock className="w-4 h-4 text-germanRed" /> {course.estimatedHours} Hours
            </span>
          </div>
          {isEnrolled && (
            <Badge variant="success" className="text-xs">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Enrolled
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
          {course.title}
        </h1>

        <p className="text-base text-dark-muted leading-relaxed">
          {course.description}
        </p>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Recommended Prerequisite: </span>
              {course.prerequisites.map((p: any) => p.prerequisiteCourse?.title).join(', ')}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
          {isEnrolled ? (
            firstLesson ? (
              <Link to={`/lessons/${firstLesson.id}`}>
                <Button variant="secondary" size="lg" className="font-bold shadow-md">
                  <PlayCircle className="w-5 h-5 mr-1" /> Continue to First Lesson
                </Button>
              </Link>
            ) : null
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="font-bold shadow-md"
              onClick={handleEnroll}
              isLoading={enrolling}
            >
              Enroll in this Course Free <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          )}
          {message && <p className="text-xs text-emerald-700 font-bold">{message}</p>}
        </div>
      </div>

      {/* Learning Objectives */}
      {course.learningObjectives && course.learningObjectives.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-navy">What You Will Master</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.learningObjectives.map((obj: string, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-gray-200/90 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-dark">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Syllabus */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-navy">Curriculum Syllabus</h2>

        {course.units && course.units.length > 0 ? (
          <div className="space-y-6">
            {course.units.map((unit: any, uIdx: number) => (
              <Card key={unit.id} className="overflow-hidden border-gray-200/90">
                <div className="bg-navy-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-navy">{unit.title}</h3>
                    <p className="text-xs text-dark-muted mt-0.5">{unit.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-dark-muted bg-white px-3 py-1 rounded-full border border-gray-200">
                    {unit.lessons?.length || 0} Lessons
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {unit.lessons?.map((lesson: any, lIdx: number) => (
                    <div key={lesson.id} className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-dark flex items-center justify-center text-xs font-bold shrink-0">
                          {uIdx + 1}.{lIdx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy">{lesson.title}</p>
                          <p className="text-xs text-dark-muted">{lesson.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-dark-muted font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {lesson.durationMinutes} min
                        </span>
                        {isEnrolled ? (
                          <Link to={`/lessons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              Start Lesson <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-dark-muted">Curriculum units are currently being scheduled.</p>
        )}
      </div>
    </div>
  );
}
