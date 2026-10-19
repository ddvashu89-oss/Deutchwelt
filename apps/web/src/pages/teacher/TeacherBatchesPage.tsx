import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Users, Calendar, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';

export function TeacherBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      try {
        const res: any = await api.get('/teacher/batches');
        if (res.success) {
          setBatches(res.batches);
        }
      } catch (e) {
        console.error('Error fetching batches:', e);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Assigned Cohorts & Batches</h1>
        <p className="text-xs text-dark-muted">Manage your active German language groups and student rosters.</p>
      </div>

      <div className="space-y-6">
        {batches.map(batch => (
          <Card key={batch.id} className="p-6 border-gray-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-navy text-white text-[10px] font-black uppercase">
                    Level {batch.level}
                  </span>
                  <Badge variant="success" className="text-[10px]">Active Cohort</Badge>
                </div>
                <h3 className="text-xl font-bold text-navy">{batch.name}</h3>
                <p className="text-xs text-dark-muted mt-0.5">{batch.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-navy">{batch.memberships?.length || 0} / {batch.maxStudents} Students</span>
                <p className="text-[11px] text-gray-400">Enrolled Roster</p>
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-2">Student Roster</h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-dark font-bold">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batch.memberships?.map((m: any) => (
                      <tr key={m.id}>
                        <td className="p-3 font-bold text-navy">{m.user?.firstName} {m.user?.lastName}</td>
                        <td className="p-3 text-dark-muted">{m.user?.email}</td>
                        <td className="p-3 text-dark-muted">{new Date(m.joinedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
