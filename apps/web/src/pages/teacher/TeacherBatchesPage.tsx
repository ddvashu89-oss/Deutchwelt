import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Users, Calendar, Clock, GraduationCap, Plus, Flame, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';

export function TeacherBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enroll Student Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [targetBatchName, setTargetBatchName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/teacher/batches');
      if (res.success) {
        setBatches(res.batches);
      }
    } catch (e) {
      console.error('Error fetching batches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const openEnrollModal = (batch: any) => {
    setTargetBatchId(batch.id);
    setTargetBatchName(batch.name);
    setStudentEmail('');
    setEnrollError(null);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    setEnrollError(null);

    try {
      const res: any = await api.post(`/teacher/batches/${targetBatchId}/enroll`, {
        studentEmail
      });
      if (res.success) {
        setIsEnrollModalOpen(false);
        setStudentEmail('');
        loadBatches();
      }
    } catch (err: any) {
      setEnrollError(err?.response?.data?.message || err?.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-navy tracking-tight">My Assigned Batches & Students</h1>
            <Badge variant="success" className="text-[10px]">Strict Teacher Scoping</Badge>
          </div>
          <p className="text-xs text-dark-muted">
            You have authorization to manage only the students enrolled in your assigned cohorts.
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy">No Assigned Batches</h3>
          <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1 mb-4">
            You do not currently have any active cohorts assigned. Platform administrators assign instructors to new batches.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {batches.map(batch => (
            <Card key={batch.id} className="p-6 border-gray-200 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-navy">{batch.memberships?.length || 0} / {batch.maxStudents} Students</span>
                    <p className="text-[11px] text-gray-400">Roster Capacity</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEnrollModal(batch)} className="font-bold shadow-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                  </Button>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                    Student Roster ({batch.memberships?.length || 0})
                  </h4>
                  <span className="text-[11px] text-dark-muted italic">Only your students in this cohort</span>
                </div>

                {batch.memberships && batch.memberships.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-dark font-bold">
                        <tr>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Target Level</th>
                          <th className="p-3">Joined Date</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {batch.memberships.map((m: any) => (
                          <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-bold text-navy">
                              {m.user?.firstName} {m.user?.lastName}
                            </td>
                            <td className="p-3 text-dark-muted">{m.user?.email}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="font-bold text-[10px]">
                                {m.user?.studentProfile?.currentLevel || batch.level}
                              </Badge>
                            </td>
                            <td className="p-3 text-dark-muted">{new Date(m.joinedAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
                    <p className="text-xs text-dark-muted">No students currently enrolled in this batch.</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Add Student to ${targetBatchName}`}
        description="Enroll an existing student into your cohort using their registered email address."
        maxWidth="md"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4 pt-2">
          {enrollError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              {enrollError}
            </div>
          )}

          <Input
            label="Registered Student Email"
            type="email"
            placeholder="student@example.com"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            required
          />

          <p className="text-[11px] text-gray-500">
            Note: The student must already have an account on DeutschWelt. Once added, they will immediately have access to your lectures, materials, and batch assignments.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={enrolling}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
