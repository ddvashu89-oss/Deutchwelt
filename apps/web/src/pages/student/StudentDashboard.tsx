import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Progress } from '../../components/ui/Progress.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Flame,
  Clock,
  BookOpen,
  Layers,
  Award,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  PenTool,
  Mic,
  TrendingUp
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res: any = await api.get('/student/dashboard');
        if (res.success) {
          setData(res.stats);
        }
      } catch (e) {
        console.error('Error loading dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const streakDays = data?.streakDays || 7;
  const currentLevel = data?.currentLevel || 'A1';
  const dailyGoal = data?.dailyGoalMinutes || 25;
  const minutesToday = data?.minutesSpentToday || 18;
  const goalProgress = Math.min(100, Math.round((minutesToday / dailyGoal) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME & MOTIVATION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-navy text-white p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="germanRed" className="uppercase font-bold tracking-wider text-[10px]">
                Level {currentLevel} Path
              </Badge>
              <span className="text-xs text-gray-300">Target: Goethe-Zertifikat {currentLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Guten Tag, {user?.firstName || 'Elena'}! Willkommen zurück.
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              You are on track with your study routine. Complete today's speaking prompt to maintain your learning streak!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/student/vocabulary">
              <Button variant="secondary" size="md" className="font-bold shadow-md">
                <Layers className="w-4 h-4 mr-1" /> Practice Flashcards
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KEY METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Streak */}
        <Card className="p-5 flex items-center gap-4 border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Active Streak</p>
            <p className="text-2xl font-black text-navy">{streakDays} Days</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Top 10% consistency</p>
          </div>
        </Card>

        {/* Daily Goal */}
        <Card className="p-5 flex items-center gap-4 border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Daily Goal</p>
            <p className="text-2xl font-black text-navy">{minutesToday}/{dailyGoal} <span className="text-xs font-normal text-gray-400">min</span></p>
            <div className="mt-1.5">
              <Progress value={goalProgress} barColor="bg-blue-600" />
            </div>
          </div>
        </Card>

        {/* Vocabulary Mastered */}
        <Card className="p-5 flex items-center gap-4 border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-germanRed flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Vocabulary</p>
            <p className="text-2xl font-black text-navy">{data?.wordsLearned || 8} <span className="text-xs font-normal text-gray-400">Words</span></p>
            <p className="text-[11px] text-dark-muted font-semibold mt-0.5">{data?.wordsMastered || 1} fully mastered (Box 5)</p>
          </div>
        </Card>

        {/* Accuracy */}
        <Card className="p-5 flex items-center gap-4 border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-dark-muted tracking-wider">Exercise Score</p>
            <p className="text-2xl font-black text-navy">{data?.exerciseAccuracy || 95}%</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Passing grade</p>
          </div>
        </Card>
      </div>

      {/* 3. CONTINUE LEARNING HERO CARD */}
      {data?.continueLesson && (
        <Card className="bg-gradient-to-r from-navy-50/60 to-white border-navy-200/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-germanRed" />
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Resume Your Active Lesson
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-navy">
                {data.continueLesson.title}
              </h2>
              <p className="text-xs text-dark-muted">
                {data.continueLesson.unitTitle} • {data.continueLesson.courseTitle}
              </p>
            </div>

            <Link to={`/lessons/${data.continueLesson.id}`}>
              <Button variant="secondary" size="lg" className="font-bold shadow-md">
                <PlayCircle className="w-5 h-5 mr-1" /> Continue Lesson
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 4. ENROLLED COURSES & ASSIGNMENTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Enrolled Courses */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Enrolled Courses</h3>
            <Link to="/student/courses" className="text-xs font-bold text-germanRed hover:underline">
              Browse All Courses
            </Link>
          </div>

          <div className="space-y-4">
            {data?.enrollments && data.enrollments.length > 0 ? (
              data.enrollments.map((enr: any) => (
                <Card key={enr.id} className="p-5 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded bg-navy text-white text-[11px] font-black uppercase">
                      {enr.level}
                    </span>
                    <span className="text-xs font-bold text-navy">{Math.round(enr.progressPercentage)}% Complete</span>
                  </div>
                  <h4 className="text-base font-bold text-navy mb-2">{enr.courseTitle}</h4>
                  <Progress value={enr.progressPercentage} className="h-2 mb-4" />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-dark-muted">Status: Active</span>
                    <Link to="/student/courses">
                      <Button variant="outline" size="sm">
                        View Syllabus & Lessons <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-xs text-dark-muted">No courses enrolled yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Tasks & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Learning Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-navy">Daily Practice Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/student/speaking" className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy hover:shadow-subtle transition-all group">
                <Mic className="w-5 h-5 text-germanRed mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-navy">Speaking Lab</p>
                <p className="text-[11px] text-dark-muted mt-0.5">Record audio answers</p>
              </Link>
              <Link to="/student/assignments" className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy hover:shadow-subtle transition-all group">
                <PenTool className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-navy">Writing Tasks</p>
                <p className="text-[11px] text-dark-muted mt-0.5">Submit homework</p>
              </Link>
            </div>
          </div>

          {/* Activity History */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-navy">Recent Activity</h3>
            <Card className="divide-y divide-gray-100 p-0 border-gray-200">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((act: any) => (
                  <div key={act.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-navy">{act.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(act.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {act.score !== undefined && act.score !== null && (
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {act.score}%
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-dark-muted">No activity recorded yet. Start your first lesson above!</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
