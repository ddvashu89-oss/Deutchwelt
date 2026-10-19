import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { BookOpen, Clock, CheckCircle, ArrowRight, Filter } from 'lucide-react';

export function CoursesPage() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="default" className="uppercase font-bold tracking-wider">Course Catalog</Badge>
        <h1 className="text-4xl font-extrabold text-navy tracking-tight">
          Comprehensive German Learning Paths
        </h1>
        <p className="text-base text-dark-muted">
          Our curriculum is engineered to align strictly with the Common European Framework of Reference for Languages (CEFR) and official Goethe-Institut / telc examinations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <span className="text-xs font-bold uppercase text-dark-muted mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Level:
        </span>
        {['ALL', 'A1', 'A2', 'B1', 'B2'].map(lvl => (
          <button
            key={lvl}
            onClick={() => { setSelectedLevel(lvl); setLoading(true); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedLevel === lvl
                ? 'bg-navy text-white shadow-xs'
                : 'bg-white text-dark-muted border border-gray-200 hover:border-navy hover:text-dark'
            }`}
          >
            {lvl === 'ALL' ? 'All Levels (A1–B2)' : `Level ${lvl}`}
          </button>
        ))}
      </div>

      {/* Course List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-navy">No courses found</h3>
          <p className="text-xs text-dark-muted mt-1">Try selecting a different level filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map(course => (
            <Card key={course.id} className="flex flex-col justify-between hover:shadow-card-hover transition-all border-gray-200/90">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-navy text-white text-xs font-black tracking-wider">
                    {course.level}
                  </span>
                  <span className="text-xs font-semibold text-dark-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-germanRed" /> ~{course.estimatedHours} Hours
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-2xl">{course.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {course.description}
                </CardDescription>

                {/* Objectives */}
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy">Core Competencies:</p>
                    <ul className="space-y-1">
                      {course.learningObjectives.slice(0, 3).map((obj: string, idx: number) => (
                        <li key={idx} className="text-xs text-dark flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-dark-muted">
                    {course.units?.length || 2} Curriculum Units
                  </span>
                  <Link to={`/courses/${course.slug}`}>
                    <Button variant="secondary" size="md" className="font-bold">
                      View Syllabus & Enroll <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
