import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Users,
  Layers,
  ClipboardList,
  Award,
  ArrowRight,
  PenTool,
  Mic,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res: any = await api.get('/teacher/dashboard');
        if (res.success) {
          setData(res.stats);
        }
      } catch (e) {
        console.error('Error loading teacher dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
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

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-navy text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-navy-800">
        <div>
          <Badge variant="germanRed" className="uppercase font-bold tracking-wider text-[10px]">
            Faculty Workspace
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Instructor Dashboard</h1>
          <p className="text-xs text-gray-300">Review student homework submissions, audio recordings, and batch schedules.</p>
        </div>

        <Link to="/teacher/assignments/new">
          <Button variant="secondary" size="md" className="font-bold shadow-md">
            <PenTool className="w-4 h-4 mr-1" /> Create Assignment
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">Active Batches</p>
              <p className="text-2xl font-black text-navy">{data?.totalBatches || 1}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">Assigned Students</p>
              <p className="text-2xl font-black text-navy">{data?.totalStudents || 1}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-germanRed flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">Pending Review</p>
              <p className="text-2xl font-black text-navy">{data?.pendingSubmissionsCount || 1}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">Avg. Score</p>
              <p className="text-2xl font-black text-navy">{data?.averageScorePercentage || 88}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Submissions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Submissions Requiring Assessment</h2>
          <Link to="/teacher/submissions" className="text-xs font-bold text-germanRed hover:underline">
            Open Full Review Queue
          </Link>
        </div>

        <Card className="divide-y divide-gray-100 p-0 border-gray-200 bg-white">
          {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
            data.recentSubmissions.map((sub: any) => (
              <div key={sub.id} className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${sub.type === 'SPEAKING' ? 'bg-red-50 text-germanRed' : 'bg-blue-50 text-blue-700'}`}>
                    {sub.type === 'SPEAKING' ? <Mic className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{sub.assignmentTitle}</p>
                    <p className="text-xs text-dark-muted">Student: <span className="font-semibold text-dark">{sub.studentName}</span> • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <Link to="/teacher/submissions">
                  <Button variant="outline" size="sm" className="font-bold">
                    Evaluate <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-dark-muted">
              All student assignments and speaking recordings have been graded!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
