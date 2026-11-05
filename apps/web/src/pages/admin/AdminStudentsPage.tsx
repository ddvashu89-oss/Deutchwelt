import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { getStudentCode } from '../../lib/studentId.js';
import { GermanLevel } from '@deutschwelt/shared';
import {
  Search,
  Download,
  Users,
  Plus,
  Edit2,
  Trash2,
  Power,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  // Add Student Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('StudentPass123!');
  const [newLevel, setNewLevel] = useState<GermanLevel>(GermanLevel.A1);
  const [newGoal, setNewGoal] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLevel, setEditLevel] = useState<GermanLevel>(GermanLevel.A1);
  const [editGoal, setEditGoal] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Action State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

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

  // 1. ADD STUDENT
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res: any = await api.post('/admin/students', {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone,
        address: newAddress,
        password: newPassword,
        currentLevel: newLevel,
        learningGoal: newGoal
      });
      if (res.success) {
        setIsAddOpen(false);
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewPhone('');
        setNewAddress('');
        setNewPassword('StudentPass123!');
        setNewGoal('');
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create student.');
    } finally {
      setCreating(false);
    }
  };

  // 2. OPEN EDIT MODAL
  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setEditFirstName(student.firstName || '');
    setEditLastName(student.lastName || '');
    setEditEmail(student.email || '');
    setEditPhone(student.phone || '');
    setEditAddress(student.address || '');
    setEditLevel(student.studentProfile?.currentLevel || GermanLevel.A1);
    setEditGoal(student.studentProfile?.learningGoal || '');
    setEditActive(student.isActive !== undefined ? student.isActive : true);
  };

  // 3. SAVE EDIT
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSavingEdit(true);
    try {
      const res: any = await api.put(`/admin/students/${editingStudent.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        currentLevel: editLevel,
        learningGoal: editGoal,
        isActive: editActive
      });
      if (res.success) {
        setEditingStudent(null);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update student.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. DELETE STUDENT
  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${name}"? This will delete all course progress and records.`)) {
      return;
    }
    setDeletingId(studentId);
    try {
      const res: any = await api.delete(`/admin/students/${studentId}`);
      if (res.success) {
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    } finally {
      setDeletingId(null);
    }
  };

  // 5. TOGGLE ACTIVE / BLOCK STATUS
  const handleToggleBlock = async (studentId: string, name: string, currentActive: boolean) => {
    const actionText = currentActive ? 'BLOCK access for' : 'RESTORE access for';
    const warningText = currentActive
      ? 'This student will be logged out immediately and blocked from logging in, viewing lessons, taking tests, or joining live sessions.'
      : 'The student will regain full access and can log in to continue learning.';

    const confirmed = window.confirm(`⚠️ Admin Access Control\n\nAre you sure you want to ${actionText} "${name}"?\n\n${warningText}`);
    if (!confirmed) return;

    try {
      const res: any = await api.post(`/admin/users/${studentId}/toggle-status`);
      if (res.success) {
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update student access.');
    }
  };

  const handleReviewRegistration = async (student: any, decision: 'APPROVE' | 'REJECT') => {
    const reviewNote = decision === 'REJECT' ? window.prompt('Tell the student what they need to update:')?.trim() : '';
    if (decision === 'REJECT' && (!reviewNote || reviewNote.length < 3)) return;
    if (decision === 'APPROVE' && !window.confirm(`Approve ${student.firstName} ${student.lastName}'s registration?`)) return;
    setReviewingId(student.id);
    try {
      await api.post(`/admin/students/${student.id}/registration-review`, { decision, reviewNote });
      await fetchStudents();
    } catch (error: any) {
      window.alert(error.message || 'Could not review this registration.');
    } finally {
      setReviewingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Student ID,First Name,Last Name,Email,Phone,Address,Level,Streak,Joined Date,Status'];
    const rows = students.map(s =>
      `"${getStudentCode(s.id)}","${s.firstName}","${s.lastName}","${s.email}","${s.phone || ''}","${s.address || ''}","${s.studentProfile?.currentLevel || 'A1'}","${s.studentProfile?.streakCount || 0}","${new Date(s.createdAt).toLocaleDateString()}","${s.isActive ? 'Active' : 'Suspended'}"`
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

  const filteredStudents = students.filter(s => {
    if (statusFilter === 'active') return s.isActive;
    if (statusFilter === 'blocked') return !s.isActive;
    if (statusFilter === 'pending') return s.studentProfile?.registrationStatus === 'PENDING_APPROVAL';
    return true;
  });

  return (
    <div className="min-w-0 space-y-6 pb-16 sm:space-y-8">
      {/* Header with Title and Action Buttons */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Student Directory</h1>
            <Badge variant="outline" className="border-navy-300 text-[10px] font-bold text-navy">
              Admin Full Control
            </Badge>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-dark-muted sm:text-sm">
            Add new learners, edit student profiles and CEFR milestones, suspend accounts, or delete records.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="w-full whitespace-nowrap font-bold sm:w-auto">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(true)} className="w-full whitespace-nowrap font-bold shadow-md sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Add New Student
          </Button>
        </div>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <form onSubmit={handleSearch} className="relative w-full xl:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </form>

        <div className="grid w-full grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 text-xs font-bold sm:flex sm:flex-wrap xl:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`min-h-10 rounded-lg px-2 py-2 transition-colors sm:px-3 sm:py-1.5 ${
              statusFilter === 'all' ? 'bg-white text-navy shadow-xs' : 'text-gray-500 hover:text-dark'
            }`}
          >
            All ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 py-2 transition-colors sm:px-3 sm:py-1.5 ${
              statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500 hover:text-dark'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active ({students.filter(s => s.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('blocked')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 py-2 transition-colors sm:px-3 sm:py-1.5 ${
              statusFilter === 'blocked' ? 'bg-white text-rose-700 shadow-xs' : 'text-gray-500 hover:text-dark'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Blocked ({students.filter(s => !s.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`min-h-10 rounded-lg px-2 py-2 transition-colors sm:px-3 sm:py-1.5 ${statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-500 hover:text-dark'}`}
          >
            Needs approval ({students.filter(s => s.studentProfile?.registrationStatus === 'PENDING_APPROVAL').length})
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <>
          {/* Compact cards keep the main student details and actions usable on phones and tablets. */}
          <div className="space-y-3 lg:hidden">
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-dark-muted shadow-subtle">
                No students match this filter.
              </div>
            ) : filteredStudents.map(s => (
              <article key={s.id} className={`min-w-0 rounded-2xl border bg-white p-4 shadow-subtle ${!s.isActive ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200'}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.isActive ? 'bg-navy-100 text-navy' : 'bg-rose-100 text-rose-700'}`}>
                    {s.firstName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <h2 className="break-words font-bold text-navy">{s.firstName} {s.lastName}</h2>
                      {!s.isActive && <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-800">Blocked</span>}
                      {s.studentProfile?.registrationStatus && s.studentProfile.registrationStatus !== 'APPROVED' && (
                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">{s.studentProfile.registrationStatus.replace('_', ' ')}</span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[10px] font-semibold tracking-wide text-forest-800">{getStudentCode(s.id)}</p>
                    {s.studentProfile?.learningGoal && <p className="mt-1 break-words text-xs text-gray-500">{s.studentProfile.learningGoal}</p>}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3 text-xs">
                  <div className="col-span-2 flex min-w-0 items-start gap-2 text-dark">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="min-w-0 break-all">{s.email}</span>
                  </div>
                  {s.phone && <div className="flex min-w-0 items-start gap-2 text-dark-muted"><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" /><span className="break-words">{s.phone}</span></div>}
                  {s.address && <div className="col-span-2 flex min-w-0 items-start gap-2 text-dark-muted"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" /><span className="break-words">{s.address}</span></div>}
                  <div className="flex items-center gap-2 text-dark-muted"><span className="text-gray-400">Level</span><Badge variant="outline" className="font-bold">{s.studentProfile?.currentLevel || 'A1'}</Badge></div>
                  <div className="text-right font-semibold text-amber-600">{s.studentProfile?.streakCount || 1} day streak</div>
                  <div className="col-span-2 text-[11px] text-dark-muted">Joined {new Date(s.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleToggleBlock(s.id, `${s.firstName} ${s.lastName}`, s.isActive)}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${s.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                    title={s.isActive ? 'Click to Block Student Access' : 'Click to Restore Student Access'}
                  >
                    {s.isActive ? <><CheckCircle2 className="h-3.5 w-3.5" /> Active</> : <><XCircle className="h-3.5 w-3.5" /> Blocked</>}
                  </button>
                  <div className="flex items-center gap-2">
                    {s.studentProfile?.registrationStatus === 'PENDING_APPROVAL' && <>
                      <button type="button" onClick={() => handleReviewRegistration(s, 'APPROVE')} disabled={reviewingId === s.id} aria-label={`Approve ${s.firstName} ${s.lastName}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleReviewRegistration(s, 'REJECT')} disabled={reviewingId === s.id} aria-label={`Request changes for ${s.firstName} ${s.lastName}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white disabled:opacity-50"><XCircle className="h-4 w-4" /></button>
                    </>}
                    <button type="button" onClick={() => openEditModal(s)} aria-label={`Edit ${s.firstName} ${s.lastName}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-navy transition-colors hover:bg-navy hover:text-white"><Edit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDeleteStudent(s.id, `${s.firstName} ${s.lastName}`)} disabled={deletingId === s.id} aria-label={`Delete ${s.firstName} ${s.lastName}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-subtle lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-navy text-white uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Streak</th>
                  <th className="p-4">Status / Access</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-dark">
                {filteredStudents.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50/80 transition-colors ${!s.isActive ? 'bg-rose-50/30' : ''}`}>
                    <td className="p-4 font-bold text-navy">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          s.isActive ? 'bg-navy-100 text-navy' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {s.firstName?.[0]}
                        </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{s.firstName} {s.lastName}</span>
                          {!s.isActive && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800">
                              Blocked
                            </span>
                          )}
                          {s.studentProfile?.registrationStatus && s.studentProfile.registrationStatus !== 'APPROVED' && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              {s.studentProfile.registrationStatus.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 font-mono text-[10px] font-semibold tracking-wide text-forest-800">
                          {getStudentCode(s.id)}
                        </div>
                        {s.studentProfile?.learningGoal && (
                          <div className="text-[10px] text-gray-400 font-normal truncate max-w-[180px]">
                            {s.studentProfile.learningGoal}
                          </div>
                        )}
                      </div>
                      </div>
                    </td>
                    <td className="p-4 text-dark-muted space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-dark">
                        <Mail className="w-3 h-3 text-gray-400" /> {s.email}
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Phone className="w-3 h-3 text-gray-400" /> {s.phone}
                        </div>
                      )}
                      {s.address && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {s.address}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-bold">
                        {s.studentProfile?.currentLevel || 'A1'}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-amber-600">
                      {s.studentProfile?.streakCount || 1}d
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(s.id, `${s.firstName} ${s.lastName}`, s.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title={s.isActive ? 'Click to Block Student Access' : 'Click to Restore Student Access'}
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Blocked
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-dark-muted">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    {/* Action Buttons: Block/Unblock, Edit & Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.studentProfile?.registrationStatus === 'PENDING_APPROVAL' && (
                          <>
                            <button onClick={() => handleReviewRegistration(s, 'APPROVE')} disabled={reviewingId === s.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50" title="Approve registration">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleReviewRegistration(s, 'REJECT')} disabled={reviewingId === s.id} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-600 hover:text-white disabled:opacity-50" title="Request changes">
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleToggleBlock(s.id, `${s.firstName} ${s.lastName}`, s.isActive)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            s.isActive
                              ? 'border-amber-200 hover:bg-amber-600 hover:text-white text-amber-700 bg-amber-50/50'
                              : 'border-emerald-200 hover:bg-emerald-600 hover:text-white text-emerald-700 bg-emerald-50/50'
                          }`}
                          title={s.isActive ? 'Block Student Access' : 'Restore Student Access'}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-navy hover:text-white text-navy transition-colors"
                          title="Edit Student Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id, `${s.firstName} ${s.lastName}`)}
                          disabled={deletingId === s.id}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}

      {/* 1. ADD STUDENT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Student"
        description="Register a new learner directly into the academy."
        maxWidth="lg"
      >
        <form onSubmit={handleAddStudent} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Elena"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="Rostova"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="student@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile Number"
              placeholder="+49 151 12345678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="e.g. Friedrichstraße 10, 10117 Berlin, Germany"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Starting Level
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value={GermanLevel.A1}>A1 — Starter</option>
                <option value={GermanLevel.A2}>A2 — Elementary</option>
                <option value={GermanLevel.B1}>B1 — Intermediate</option>
                <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
              </select>
            </div>
          </div>

          <Input
            label="Learning Goal (Optional)"
            placeholder="e.g. Goethe-Zertifikat A1 for Visa, University Admission"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="w-full font-bold shadow-md sm:w-auto" isLoading={creating}>
              Create Student Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. EDIT STUDENT MODAL */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title="Edit Student Account"
        description="Update learner credentials, CEFR level, or access status."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>

          <Input
            label="Residential Address"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                CEFR German Level
              </label>
              <select
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value={GermanLevel.A1}>A1 — Starter</option>
                <option value={GermanLevel.A2}>A2 — Elementary</option>
                <option value={GermanLevel.B1}>B1 — Intermediate</option>
                <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Account Status
              </label>
              <select
                value={editActive ? 'active' : 'suspended'}
                onChange={(e) => setEditActive(e.target.value === 'active')}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="suspended">Suspended (Access Blocked)</option>
              </select>
            </div>
          </div>

          <Input
            label="Primary Learning Goal"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="w-full font-bold shadow-md sm:w-auto" isLoading={savingEdit}>
              Save Student Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminStudentsPage;
