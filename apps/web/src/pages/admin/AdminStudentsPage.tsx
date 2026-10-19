import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Search, Download, Users, CheckCircle2, XCircle } from 'lucide-react';

export function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/students', { search });
      if (res.success) {
        setStudents(res.students);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const exportCSV = () => {
    const headers = ['ID,First Name,Last Name,Email,Level,Streak,Joined Date,Status'];
    const rows = students.map(s =>
      `"${s.id}","${s.firstName}","${s.lastName}","${s.email}","${s.studentProfile?.currentLevel || 'A1'}","${s.studentProfile?.streakCount || 0}","${new Date(s.createdAt).toLocaleDateString()}","${s.isActive ? 'Active' : 'Inactive'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `deutschwelt-students-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">Student Directory</h1>
          <p className="text-xs text-dark-muted">Manage enrolled learners, CEFR milestones, and account statuses.</p>
        </div>

        <Button variant="outline" size="sm" onClick={exportCSV} className="font-bold self-start sm:self-auto">
          <Download className="w-4 h-4 mr-1" /> Export CSV Roster
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </form>

      {/* Students Table */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy text-white uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Streak</th>
                  <th className="p-4">Courses Enrolled</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-dark">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-navy flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy-100 text-navy font-bold flex items-center justify-center text-[11px]">
                        {s.firstName?.[0]}
                      </div>
                      <span>{s.firstName} {s.lastName}</span>
                    </td>
                    <td className="p-4 text-dark-muted">{s.email}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-bold">{s.studentProfile?.currentLevel || 'A1'}</Badge>
                    </td>
                    <td className="p-4 font-bold text-amber-600">
                      {s.studentProfile?.streakCount || 1}d
                    </td>
                    <td className="p-4 text-dark-muted">
                      {s.enrollments?.length || 1} course(s)
                    </td>
                    <td className="p-4 text-dark-muted">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {s.isActive ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full text-[10px]">
                          Suspended
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
