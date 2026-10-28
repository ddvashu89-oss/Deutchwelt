import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Check,
  AlertCircle,
  FileText,
  Bell,
  Star,
  MoreVertical,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function AdminDashboard() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Create Modal State
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'batch' | 'course' | 'feePlan' | 'announcement'>('batch');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states for Quick Create
  const [batchName, setBatchName] = useState('');
  const [batchCourseId, setBatchCourseId] = useState('course-a1');
  const [batchTeacher, setBatchTeacher] = useState('Frau Elena Schmidt');
  const [batchSchedule, setBatchSchedule] = useState('Mon & Wed 18:00 - 19:30 CET');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseLevel, setCourseLevel] = useState('A1');
  const [coursePrice, setCoursePrice] = useState('449');

  const [feePlanName, setFeePlanName] = useState('');
  const [feeAmount, setFeeAmount] = useState('180');
  const [feeInstallments, setFeeInstallments] = useState('3');

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('ALL');

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState<'all' | 'enrollments' | 'submissions' | 'updates'>('all');

  // Modals for Telemetry Data
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, paymentsRes, attendanceRes]: any = await Promise.all([
          api.get('/admin/analytics').catch(() => ({ success: false })),
          api.get('/admin/payments').catch(() => ({ success: false, payments: [] })),
          api.get('/admin/attendance').catch(() => ({ success: false, attendance: [] }))
        ]);

        if (analyticsRes?.success) {
          setData(analyticsRes.analytics);
        }
        if (paymentsRes?.success && paymentsRes.payments) {
          setPaymentsList(paymentsRes.payments);
        }
        if (attendanceRes?.success && attendanceRes.attendance) {
          setAttendanceList(attendanceRes.attendance);
        }
      } catch (e) {
        console.error('Error loading admin dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (createType === 'batch') {
        await api.post('/admin/batches', {
          name: batchName || 'German A2 Weekend Immersion',
          courseId: batchCourseId,
          teacherName: batchTeacher,
          schedule: batchSchedule
        });
        setActionSuccess(language === 'de' ? 'Gruppe erfolgreich erstellt und Dozent zugewiesen!' : 'Batch successfully created and teacher assigned!');
      } else if (createType === 'feePlan') {
        await api.post('/admin/fee-plans', {
          name: feePlanName || 'Standard Semester Rate',
          amount: Number(feeAmount) || 180,
          currency: 'EUR',
          installments: Number(feeInstallments) || 3
        });
        setActionSuccess(language === 'de' ? 'Gebührenplan erfolgreich angelegt!' : 'Fee plan successfully created!');
      } else if (createType === 'announcement') {
        await api.post('/admin/announcements', {
          title: announcementTitle || 'New Term Goethe Preparation Schedule',
          content: announcementContent || 'Live seminars begin next Monday. Please check batch schedules.',
          targetAudience: announcementTarget
        });
        setActionSuccess(language === 'de' ? 'Mitteilung erfolgreich veröffentlicht!' : 'Announcement published to platform!');
      } else {
        setActionSuccess(language === 'de' ? `Kurs "${courseTitle || 'German Masterclass'}" (${courseLevel}) veröffentlicht!` : `Course "${courseTitle || 'German Masterclass'}" (${courseLevel}) published!`);
      }

      setTimeout(() => {
        setActionSuccess(null);
        setQuickCreateOpen(false);
        setBatchName('');
        setCourseTitle('');
        setFeePlanName('');
        setAnnouncementTitle('');
        setAnnouncementContent('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  // Monthly revenue & engagement bar chart data matching $750,000 scale from Image 1
  const revenueChartData = [
    { month: 'Jan', value: 42000 },
    { month: 'Feb', value: 58000 },
    { month: 'Mar', value: 65000 },
    { month: 'Apr', value: 72000 },
    { month: 'May', value: 68000 },
    { month: 'Jun', value: 85000 },
    { month: 'Jul', value: 79000 },
    { month: 'Aug', value: 92000 },
    { month: 'Sep', value: 88000 },
    { month: 'Oct', value: 96000 },
    { month: 'Nov', value: 91000 },
    { month: 'Dec', value: 104000 }
  ];

  // Table rows for Engagement Breakdown matching Image 1
  const engagementRows = [
    {
      id: 1,
      title: 'Full-Stack German B2 Professional',
      category: 'Advanced Business & Telc',
      students: 1420,
      completionRate: 88,
      rating: 4.9,
      reviewsCount: 382
    },
    {
      id: 2,
      title: 'Goethe-Zertifikat B1 Exam Prep',
      category: 'Exam Immersion & Oral Lab',
      students: 1180,
      completionRate: 76,
      rating: 4.8,
      reviewsCount: 295
    },
    {
      id: 3,
      title: 'German A2 Conversational Mastery',
      category: 'Spoken German & Cases',
      students: 940,
      completionRate: 64,
      rating: 4.7,
      reviewsCount: 210
    },
    {
      id: 4,
      title: 'Complete German A1 Beginner',
      category: 'Foundation & Vocabulary',
      students: 820,
      completionRate: 91,
      rating: 4.9,
      reviewsCount: 340
    },
    {
      id: 5,
      title: 'Medical German & Nursing Terms',
      category: 'FSP & Approbation Prep',
      students: 650,
      completionRate: 58,
      rating: 4.6,
      reviewsCount: 148
    }
  ];

  // Activities list with category tags
  const activities = [
    {
      id: 1,
      type: 'enrollments',
      title: language === 'de' ? 'Emma Watson hat sich für Deutsch A1 eingeschrieben' : 'Emma Watson enrolled in German A1 Beginner',
      time: '2m ago',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 2,
      type: 'submissions',
      title: language === 'de' ? 'Lukas Weber hat Aufgabe #3 (Perfekt-Zeiten) eingereicht' : 'Lukas Weber submitted Assignment #3: Perfekt Tense',
      time: '14m ago',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 3,
      type: 'updates',
      title: language === 'de' ? 'Frau Elena Schmidt der Gruppe B1-Morgen zugewiesen' : 'Elena Schmidt assigned to Batch B1-Morning',
      time: '1h ago',
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 4,
      type: 'updates',
      title: language === 'de' ? 'Kurs "B2 Professional Business German" veröffentlicht' : 'Course "B2 Professional Business German" published',
      time: '3h ago',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 5,
      type: 'enrollments',
      title: language === 'de' ? 'Neuer Gebührenplan "Ratenzahlung €180/Monat" aktiviert' : 'Fee Plan "Installment Plan €180/mo" activated',
      time: '5h ago',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter(a => a.type === activityFilter);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse font-sans">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. TOP HEADER & SEARCH / FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            {t('admin.overview')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('admin.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search bar with filter icon */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'de' ? 'Suchen...' : 'Search...'}
              className="bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 pl-9 pr-9 py-2.5 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all"
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* "+ Quick Create" Primary Button */}
          <button
            type="button"
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.quickCreate')}</span>
          </button>
        </div>
      </div>

      {/* 2. 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Instructors */}
        <div className="bg-[#0B1325] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('admin.instructors')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              +12% this month
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              {data?.totalTeachers || 128}
            </span>
            <Link
              to="/admin/teachers"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="bg-[#0B1325] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('admin.students')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              +24% this month
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              {data?.totalStudents ? `${data.totalStudents.toLocaleString()}` : '4,532'}
            </span>
            <Link
              to="/admin/students"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Courses Published */}
        <div className="bg-[#0B1325] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('admin.courses')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              +5 new courses
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              {data?.totalCourses || 67}
            </span>
            <Link
              to="/admin/courses"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Curriculum <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Pending Submissions */}
        <div className="bg-[#0B1325] p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t('admin.submissions')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              -3% from last week
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-heading font-black text-white">
              152
            </span>
            <button
              type="button"
              onClick={() => alert('Reviewing 152 pending Goethe B1 & A2 speech and homework submissions.')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Review queue <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Top Engaged Courses + Engagement Breakdown Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Top Engaged Courses (with $750,000 subheader & Bar Chart) */}
          <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-heading font-extrabold text-white">
                  {t('admin.topCourses')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('admin.topCoursesSub')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Telemetry Payments</span>
                </button>
                <div className="relative">
                  <select className="appearance-none bg-[#070D1A] border border-white/10 text-xs font-semibold text-slate-300 py-1.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option className="bg-[#0B1325] text-white">{language === 'de' ? 'Diesen Monat' : 'This month'}</option>
                    <option className="bg-[#0B1325] text-white">{language === 'de' ? 'Letzten Monat' : 'Last month'}</option>
                    <option className="bg-[#0B1325] text-white">{language === 'de' ? 'Gesamtes Jahr' : 'This year'}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* $750,000 Volume Metric */}
            <div className="pt-2 flex items-baseline gap-3 border-t border-white/10">
              <span className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
                $750,000
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                +14.8% YoY
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Academic tuition, live seminars & institutional enrollments
              </span>
            </div>

            {/* Bar Chart */}
            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(v: any) => [`$${v.toLocaleString()}`, 'Tuition Volume']}
                  />
                  <Bar
                    dataKey="value"
                    fill="#6366F1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card: Engagement Breakdown Table */}
          <div className="bg-[#0B1325] p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-extrabold text-white">
                  {t('admin.breakdown')}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'de' ? 'Kursbeteiligung, Abschlussquoten und Dozentenbewertungen' : 'Student enrollment, completion rates and student ratings'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(true)}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Attendance Logs</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Course</th>
                    <th className="pb-3 text-right">Students Enrolled</th>
                    <th className="pb-3 text-center">Completion Rate</th>
                    <th className="pb-3 text-right">Rating</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {engagementRows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-white">{row.title}</p>
                        <p className="text-[11px] text-slate-400">{row.category}</p>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-300">
                        {row.students.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${row.completionRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-300 text-[11px] min-w-[28px]">
                            {row.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {row.rating}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Course Details: ${row.title}\n${row.students} students enrolled.\nCompletion rate: ${row.completionRate}%.`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity + Assignment & Quiz Overview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Recent Activity */}
          <div className="bg-[#0B1325] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-extrabold text-white">
                {t('admin.recentActivity')}
              </h2>
              <p className="text-[11px] text-slate-400">
                AI generated course outline for 'Full Stack Next.js & German'
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setActivityFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  activityFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-[#070D1A] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All (18)
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('enrollments')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  activityFilter === 'enrollments'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-[#070D1A] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Enrollments (8)
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('submissions')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  activityFilter === 'submissions'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-[#070D1A] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Submissions (6)
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('updates')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  activityFilter === 'updates'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-[#070D1A] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Updates (4)
              </button>
            </div>

            {/* Activity Stream */}
            <div className="space-y-3 pt-2">
              {filteredActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 leading-snug">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {act.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Assignment & Quiz Overview */}
          <div className="bg-[#0B1325] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-heading font-extrabold text-white">
                {t('admin.quizOverview')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active examination and homework submission metrics
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                  <span>German A1 Weekly Quiz</span>
                  <span className="text-purple-400">94%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '94%' }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">384 of 408 students completed</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                  <span>Grammar Test: Dativ & Akkusativ</span>
                  <span className="text-purple-400">78%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">212 of 272 students completed</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                  <span>Oral Exam Submissions (Speaking Lab)</span>
                  <span className="text-purple-400">62%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '62%' }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">152 submissions pending grading</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                  <span>Final Goethe B1 Mock Exam</span>
                  <span className="text-purple-400">45%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">82 of 180 registered candidates completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL: + Quick Create */}
      {quickCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B1325] text-slate-100 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    {language === 'de' ? 'Schnellerstellung' : 'Quick Create'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'de' ? 'Kurse, Gruppen, Dozenten oder Gebührenpläne anlegen' : 'Create batches, assign teachers, fee plans or announcements'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickCreateOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs for Create Type */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#070D1A] border border-white/10 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreateType('batch')}
                className={`py-2 rounded-xl transition-colors ${
                  createType === 'batch' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Batch
              </button>
              <button
                type="button"
                onClick={() => setCreateType('course')}
                className={`py-2 rounded-xl transition-colors ${
                  createType === 'course' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Course
              </button>
              <button
                type="button"
                onClick={() => setCreateType('feePlan')}
                className={`py-2 rounded-xl transition-colors ${
                  createType === 'feePlan' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fee Plan
              </button>
              <button
                type="button"
                onClick={() => setCreateType('announcement')}
                className={`py-2 rounded-xl transition-colors ${
                  createType === 'announcement' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Announce
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
              {createType === 'batch' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Batch Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. German A1 Morning Cohort 2026"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      required
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Course Level
                      </label>
                      <select
                        value={batchCourseId}
                        onChange={(e) => setBatchCourseId(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="course-a1" className="bg-[#0B1325] text-white">German A1 (Beginner)</option>
                        <option value="course-a2" className="bg-[#0B1325] text-white">German A2 (Elementary)</option>
                        <option value="course-b1" className="bg-[#0B1325] text-white">German B1 (Intermediate)</option>
                        <option value="course-b2" className="bg-[#0B1325] text-white">German B2 (Advanced)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Assign Teacher
                      </label>
                      <select
                        value={batchTeacher}
                        onChange={(e) => setBatchTeacher(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Frau Elena Schmidt" className="bg-[#0B1325] text-white">Frau Elena Schmidt</option>
                        <option value="Herr Markus Weber" className="bg-[#0B1325] text-white">Herr Markus Weber</option>
                        <option value="Frau Sophie Becker" className="bg-[#0B1325] text-white">Frau Sophie Becker</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Live Schedule & Meeting Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mon, Wed, Fri 18:00 - 19:30 CET"
                      value={batchSchedule}
                      onChange={(e) => setBatchSchedule(e.target.value)}
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {createType === 'course' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. German A2 Intensive Conversation"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      required
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Target CEFR Level
                      </label>
                      <select
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                      >
                        <option value="A1" className="bg-[#0B1325] text-white">A1 Beginner</option>
                        <option value="A2" className="bg-[#0B1325] text-white">A2 Elementary</option>
                        <option value="B1" className="bg-[#0B1325] text-white">B1 Intermediate</option>
                        <option value="B2" className="bg-[#0B1325] text-white">B2 Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Tuition Price (€)
                      </label>
                      <input
                        type="number"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {createType === 'feePlan' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Fee Plan Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3-Month Installment Plan"
                      value={feePlanName}
                      onChange={(e) => setFeePlanName(e.target.value)}
                      required
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Per Installment Amount (€)
                      </label>
                      <input
                        type="number"
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Number of Installments
                      </label>
                      <input
                        type="number"
                        value={feeInstallments}
                        onChange={(e) => setFeeInstallments(e.target.value)}
                        className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {createType === 'announcement' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scheduled Maintenance & Goethe Exam Dates"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      required
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={announcementTarget}
                      onChange={(e) => setAnnouncementTarget(e.target.value)}
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 p-2.5 rounded-2xl"
                    >
                      <option value="ALL" className="bg-[#0B1325] text-white">All Students & Teachers</option>
                      <option value="STUDENTS" className="bg-[#0B1325] text-white">Students Only</option>
                      <option value="TEACHERS" className="bg-[#0B1325] text-white">Faculty / Teachers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Announcement Content
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write message details..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      required
                      className="w-full bg-[#070D1A] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </>
              )}

              {actionSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25"
                >
                  Confirm & Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Telemetry Payments Monitor ($750k records) */}
      {paymentsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B1325] text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-black text-lg text-white">
                  Payment Telemetry & Tuition Transactions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300">
              <span>Total Processed Volume:</span>
              <span className="text-base font-black text-white">$750,000.00 USD</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5 text-xs">
              {paymentsList.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{p.studentName}</p>
                    <p className="text-[11px] text-slate-400">{p.courseTitle} • {p.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">€{p.amount}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPaymentsModalOpen(false)}
                className="px-5 py-2 rounded-2xl bg-white/10 border border-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Attendance Logs Monitor */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B1325] text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-black text-lg text-white">
                  Student Live Class Attendance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5 text-xs">
              {attendanceList.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{a.studentName}</p>
                    <p className="text-[11px] text-slate-400">{a.batchName} • Date: {a.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    a.status === 'PRESENT'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="px-5 py-2 rounded-2xl bg-white/10 border border-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;