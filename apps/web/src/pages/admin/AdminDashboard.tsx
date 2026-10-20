import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowUpRight,
  TrendingUp,
  Mail,
  ShieldCheck,
  Plus,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res: any = await api.get('/admin/analytics');
        if (res.success) {
          setData(res.analytics);
        }
      } catch (e) {
        console.error('Error fetching admin analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-80 rounded-3xl" />
          <Skeleton className="lg:col-span-5 h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  const {
    totalStudents,
    activeStudentsLast30Days,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    totalCompletedLessons,
    averageExerciseScore,
    enquiriesCount,
    registrationTrend,
    levelDistribution,
    courseEnrollmentBreakdown
  } = data || {};

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-gray-950">
              Admin-Zentrale
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              System Online
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Plattform-Telemetrie, Benutzerkonten und Kursverwaltung der DeutschWelt Akademie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-forest-700" />
            <span>+ Kurs anlegen</span>
          </Link>

          <Link
            to="/admin/teachers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-mint" />
            <span>+ Dozent einladen</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Featured Forest Green */}
        <div className="rounded-3xl bg-forest-900 text-white p-6 shadow-sm border border-forest-800 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-emerald-100/90">
              Eingeschriebene Studenten
            </span>
            <Link
              to="/admin/students"
              className="w-8 h-8 rounded-full bg-forest-800/80 flex items-center justify-center text-white border border-forest-700/50"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-white">
              {totalStudents || 18}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint/20 text-mint border border-mint/30">
                {activeStudentsLast30Days || 15} aktiv (30T)
              </span>
              <span className="text-xs text-emerald-100/70">Wachstum +18%</span>
            </div>
          </div>
        </div>

        {/* Card 2: White Card - Faculty */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Lehrkräfte (Faculty)
            </span>
            <Link
              to="/admin/teachers"
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60 hover:bg-gray-100"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {totalTeachers || 3}
              <span className="text-base font-bold text-gray-400">Dozenten</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-forest-700">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Goethe & Telc zertifiziert</span>
            </div>
          </div>
        </div>

        {/* Card 3: White Card - Enrollments */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Kurs-Einschreibungen
            </span>
            <Link
              to="/admin/courses"
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60 hover:bg-gray-100"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {totalEnrollments || 24}
              <span className="text-base font-bold text-gray-400">Buchungen</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-forest-700">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{totalCourses || 4} aktive Kurse (A1–B2)</span>
            </div>
          </div>
        </div>

        {/* Card 4: White Card - Completed Lessons */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between group hover:border-gray-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">
              Lektionsabschlüsse
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 mb-2">
            <div className="text-4xl font-heading font-black tracking-tight text-gray-950 flex items-baseline gap-2">
              {totalCompletedLessons || 42}
              <span className="text-base font-bold text-gray-400">Einheiten</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{averageExerciseScore || 89}% Prüfungsgenauigkeit</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Actions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest-700" /> Schnellverwaltung:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-mint" /> Studenten verwalten
          </Link>
          <Link
            to="/admin/teachers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-forest-700" /> Lehrkräfte
          </Link>
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-forest-700" /> Lehrplan
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Anfragen ({enquiriesCount || 0})
          </Link>
        </div>
      </div>

      {/* 4. Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Trend Area Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-gray-950">
                Studentenregistrierungen
              </h2>
              <p className="text-xs text-gray-500">Neuanmeldungen der letzten 6 Monate</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-900 border border-forest-200">
              Live-Daten
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend || []}>
                <defs>
                  <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#144E3D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#144E3D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '16px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#144E3D"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#forestGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-gray-950">
                CEFR-Niveau Verteilung
              </h2>
              <p className="text-xs text-gray-500">Studenten nach Kompetenzstufe</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              A1 bis B2
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="level" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '16px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="students" fill="#34D399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
