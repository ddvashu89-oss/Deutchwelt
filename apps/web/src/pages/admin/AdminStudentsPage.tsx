import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
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

  const exportCSV = () => {
    const headers = ['ID,First Name,Last Name,Email,Phone,Address,Level,Streak,Joined Date,Status'];
    const rows = students.map(s =>
      `"${s.id}","${s.firstName}","${s.lastName}","${s.email}","${s.phone || ''}","${s.address || ''}","${s.studentProfile?.currentLevel || 'A1'}","${s.studentProfile?.streakCount || 0}","${new Date(s.createdAt).toLocaleDateString()}","${s.isActive ? 'Active' : 'Suspended'}"`
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
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Student Directory & Access Control</h1>
            <Badge variant="default" className="text-[10px] font-bold">
              Full Admin Authority
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Total of {students.length} enrolled students. Manage profiles, block/unblock access, update levels, or export database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="font-bold">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="font-bold shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-1" /> Add New Student
          </Button>
        </div>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="max-w-md w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 bg-[#070D1A] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-1.5 p-1 bg-[#070D1A] rounded-2xl border border-white/10 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === 'all' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
              statusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active ({students.filter(s => s.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('blocked')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
              statusFilter === 'blocked' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Blocked ({students.filter(s => !s.isActive).length})
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-3xl" />
      ) : (
        <div className="bg-[#0B1325] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-[#070D1A] text-slate-300 uppercase font-bold tracking-wider border-b border-white/10">
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
              <tbody className="divide-y divide-white/5 text-slate-200">
                {students
                  .filter(s => {
                    if (statusFilter === 'active') return s.isActive;
                    if (statusFilter === 'blocked') return !s.isActive;
                    return true;
                  })
                  .map(s => (
                  <tr key={s.id} className={`hover:bg-white/5 transition-colors ${!s.isActive ? 'bg-rose-500/5' : ''}`}>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        s.isActive ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.firstName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{s.firstName} {s.lastName}</span>
                          {!s.isActive && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Blocked
                            </span>
                          )}
                        </div>
                        {s.studentProfile?.learningGoal && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">
                            {s.studentProfile.learningGoal}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                        <Mail className="w-3 h-3 text-slate-500" /> {s.email}
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" /> {s.phone}
                        </div>
                      )}
                      {s.address && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {s.address}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-bold">
                        {s.studentProfile?.currentLevel || 'A1'}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {s.studentProfile?.streakCount || 1}d
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(s.id, `${s.firstName} ${s.lastName}`, s.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          s.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                        }`}
                        title={s.isActive ? 'Click to Block Student Access' : 'Click to Restore Student Access'}
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-400" /> Blocked
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    {/* Action Buttons: Block/Unblock, Edit & Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleBlock(s.id, `${s.firstName} ${s.lastName}`, s.isActive)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            s.isActive
                              ? 'border-amber-500/30 hover:bg-amber-500/20 text-amber-300 bg-amber-500/10'
                              : 'border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 bg-emerald-500/10'
                          }`}
                          title={s.isActive ? 'Block Student Access' : 'Restore Student Access'}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Edit Student Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id, `${s.firstName} ${s.lastName}`)}
                          disabled={deletingId === s.id}
                          className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Starting Level
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value={GermanLevel.A1} className="bg-[#0B1325] text-white">A1 — Starter</option>
                <option value={GermanLevel.A2} className="bg-[#0B1325] text-white">A2 — Elementary</option>
                <option value={GermanLevel.B1} className="bg-[#0B1325] text-white">B1 — Intermediate</option>
                <option value={GermanLevel.B2} className="bg-[#0B1325] text-white">B2 — Upper Intermediate</option>
              </select>
            </div>
          </div>

          <Input
            label="Learning Goal (Optional)"
            placeholder="e.g. Goethe-Zertifikat A1 for Visa, University Admission"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={creating}>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CEFR German Level
              </label>
              <select
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value={GermanLevel.A1} className="bg-[#0B1325] text-white">A1 — Starter</option>
                <option value={GermanLevel.A2} className="bg-[#0B1325] text-white">A2 — Elementary</option>
                <option value={GermanLevel.B1} className="bg-[#0B1325] text-white">B1 — Intermediate</option>
                <option value={GermanLevel.B2} className="bg-[#0B1325] text-white">B2 — Upper Intermediate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Account Status
              </label>
              <select
                value={editActive ? 'active' : 'suspended'}
                onChange={(e) => setEditActive(e.target.value === 'active')}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value="active" className="bg-[#0B1325] text-white">Active (Access Allowed)</option>
                <option value="suspended" className="bg-[#0B1325] text-white">Suspended (Access Blocked)</option>
              </select>
            </div>
          </div>

          <Input
            label="Primary Learning Goal"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={savingEdit}>
              Save Student Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminStudentsPage;
