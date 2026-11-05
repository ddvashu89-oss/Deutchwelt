import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Award, BookOpen, CalendarDays, Clock3, Flame, Printer, Target, TrendingUp } from 'lucide-react';

export function StudentProgressPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<any>('/student/dashboard'),
      api.get<any>('/student/learning-plan').catch(() => null),
      api.get<any>('/student/certificates').catch(() => null)
    ]).then(([dashboard, learningPlan, certificateResult]) => {
      if (!active) return;
      if (!dashboard?.success) throw new Error('Your learning progress is not available right now.');
      setStats(dashboard.stats);
      setPlan(learningPlan?.plan || null);
      setCertificates(certificateResult?.certificates || []);
    }).catch((requestError: any) => {
      if (active) setError(requestError?.message || 'Could not load your progress report.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-3xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Preparing your progress report…</div>;

  if (error) return <div className="space-y-4 rounded-3xl border border-rose-200 bg-white p-6"><p role="alert" className="text-sm text-rose-800">{error}</p><Button onClick={() => window.location.reload()}>Try again</Button></div>;

  const courses = stats?.enrollments || [];
  const dailyGoal = stats?.dailyGoalMinutes || 20;
  const dailyProgress = Math.min(100, Math.round(((stats?.minutesSpentToday || 0) / dailyGoal) * 100));
  const focusAreas = plan?.focusAreas || [];

  return <main className="mx-auto max-w-6xl space-y-6 pb-16 print:max-w-none print:space-y-4">
    <header className="flex flex-col gap-4 rounded-3xl border border-[#e8e3d8] bg-[#fffefa] p-6 sm:flex-row sm:items-center sm:justify-between print:border-0 print:p-0">
      <div>
        <Badge variant="germanRed">Learning summary</Badge>
        <h1 className="mt-2 text-3xl font-black text-navy">My progress report</h1>
        <p className="mt-1 text-sm text-dark-muted">Your current course progress, study habits and achievements.</p>
      </div>
      <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print report</Button>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Progress summary">
      <Metric icon={BookOpen} label="Lessons completed" value={stats?.completedLessonsCount || 0} detail={`${courses.length} active course${courses.length === 1 ? '' : 's'}`} />
      <Metric icon={TrendingUp} label="Exercise accuracy" value={`${stats?.exerciseAccuracy || 0}%`} detail="Average across recorded exercises" />
      <Metric icon={Flame} label="Study streak" value={`${stats?.streakDays || 0} days`} detail="Keep your learning habit going" />
      <Metric icon={Award} label="Certificates" value={certificates.length} detail="Verified course achievements" />
    </section>

    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-forest-800" /><h2 className="text-lg font-bold text-navy">Course progress</h2></div>
        {courses.length ? courses.map((course: any) => {
          const percent = Math.max(0, Math.min(100, Number(course.progressPercentage) || 0));
          return <article key={course.id} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-navy">{course.courseTitle}</h3><p className="mt-0.5 text-xs text-dark-muted">{course.level} · {course.status}</p></div><span className="text-sm font-extrabold text-forest-800">{percent}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={language === 'de' ? `${course.courseTitle} Fortschritt` : `${course.courseTitle} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-forest-800" style={{ width: `${percent}%` }} /></div>
            <Link to={`/courses/${course.courseSlug}`} className="mt-3 inline-block text-xs font-bold text-forest-800 hover:underline">Continue course →</Link>
          </article>;
        }) : <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-dark-muted">You haven’t enrolled in a course yet. <Link to="/courses" className="font-bold text-forest-800 underline">Explore courses</Link></div>}
      </div>

      <div className="space-y-5">
        <section className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-forest-800" /><h2 className="text-lg font-bold text-navy">Study goal today</h2></div>
          <p className="mt-4 text-3xl font-black text-navy">{stats?.minutesSpentToday || 0}<span className="text-base font-semibold text-gray-400"> / {dailyGoal} min</span></p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label="Today's study goal" aria-valuemin={0} aria-valuemax={dailyGoal} aria-valuenow={Math.min(dailyGoal, stats?.minutesSpentToday || 0)}><div className="h-full rounded-full bg-emerald-600" style={{ width: `${dailyProgress}%` }} /></div>
          <p className="mt-2 text-xs text-dark-muted">{dailyProgress >= 100 ? 'Daily goal reached. Great work!' : `${Math.max(0, dailyGoal - (stats?.minutesSpentToday || 0))} minutes left to reach your goal.`}</p>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-forest-800" /><h2 className="text-lg font-bold text-navy">Personal study plan</h2></div>
          <p className="mt-1 text-xs text-dark-muted">Level {plan?.level || stats?.currentLevel || 'A1'} · {plan?.weeklyGoalMinutes || 100} minutes per week</p>
          {focusAreas.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Suggested review: {focusAreas.join(', ')}</p>}
          <Link to="/student/placement-test" className="mt-4 inline-block text-xs font-bold text-forest-800 hover:underline">Open placement test and plan →</Link>
        </section>
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-forest-800" /><h2 className="text-lg font-bold text-navy">Next live classes</h2></div>
        {(stats?.upcomingClasses || []).length ? <ul className="mt-4 divide-y divide-gray-100">{stats.upcomingClasses.map((item: any) => <li key={item.id} className="py-3"><p className="font-semibold text-navy">{item.title}</p><p className="mt-1 text-xs text-dark-muted">{item.batchName} · {new Date(item.startsAt).toLocaleString()}</p></li>)}</ul> : <p className="mt-3 text-sm text-dark-muted">No upcoming classes scheduled.</p>}
        <Link to="/student/schedule" className="mt-3 inline-block text-xs font-bold text-forest-800 hover:underline">Open class calendar →</Link>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2"><Award className="h-5 w-5 text-forest-800" /><h2 className="text-lg font-bold text-navy">Certificates</h2></div>
        {certificates.length ? <ul className="mt-4 divide-y divide-gray-100">{certificates.map((certificate: any) => <li key={certificate.id} className="py-3"><p className="font-semibold text-navy">{certificate.courseTitle || certificate.course?.title || 'DeutschWelt course'}</p><p className="mt-1 text-xs text-dark-muted">{certificate.level || certificate.course?.level} · Issued {new Date(certificate.issuedAt).toLocaleDateString()} · {certificate.certificateNumber}</p></li>)}</ul> : <p className="mt-3 text-sm text-dark-muted">Complete every published lesson in a course to become eligible for its certificate.</p>}
        <Link to="/student/courses" className="mt-3 inline-block text-xs font-bold text-forest-800 hover:underline">View courses →</Link>
      </div>
    </section>
    <p className="text-xs text-gray-400 print:mt-6">Report generated {new Date().toLocaleString()} from your DeutschWelt learning activity.</p>
  </main>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; detail: string }) {
  return <article className="rounded-3xl border border-gray-200 bg-white p-5">
    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-800"><Icon className="h-4 w-4" /></span></div>
    <p className="mt-4 text-3xl font-black text-navy">{value}</p><p className="mt-1 text-xs text-dark-muted">{detail}</p>
  </article>;
}
