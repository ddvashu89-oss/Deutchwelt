import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  GraduationCap,
  Plus,
  Mail,
  Users,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  Phone,
  Power
} from 'lucide-react';

export function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Teacher Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('TeacherPass123!');
  const [qualifications, setQualifications] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Edit Teacher Modal State
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editQualifications, setEditQualifications] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Assign Batch Modal State
  const [manageTeacher, setManageTeacher] = useState<any | null>(null);
  const [batchToAssign, setBatchToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTeachersAndBatches = async () => {
    try {
      setLoading(true);
      const [tRes, bRes]: any[] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/teacher/batches')
      ]);

      if (tRes.success) setTeachers(tRes.teachers);
      if (bRes.success) {
        setBatches(bRes.batches);
        if (bRes.batches.length > 0) setBatchToAssign(bRes.batches[0].id);
      }
    } catch (e) {
      console.error('Error fetching admin faculty data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersAndBatches();
  }, []);

  // 1. CREATE TEACHER
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res: any = await api.post('/admin/teachers', {
        firstName,
        lastName,
        email,
        phone,
        password,
        bio,
        qualifications,
        specialization,
        batchIds: selectedBatchIds
      });

      if (res.success) {
        setIsModalOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setPassword('TeacherPass123!');
        setBio('');
        setQualifications('');
        setSpecialization('');
        setSelectedBatchIds([]);
        fetchTeachersAndBatches();
      }
    } catch (e: any) {
      alert(e.message || 'Error creating teacher.');
    } finally {
      setSaving(false);
    }
  };

  // 2. OPEN EDIT MODAL
  const openEditModal = (teacher: any) => {
    setEditingTeacher(teacher);
    setEditFirstName(teacher.firstName || '');
    setEditLastName(teacher.lastName || '');
    setEditEmail(teacher.email || '');
    setEditPhone(teacher.phone || '');
    setEditQualifications(teacher.teacherProfile?.qualifications || '');
    setEditSpecialization(teacher.teacherProfile?.specialization || '');
    setEditBio(teacher.teacherProfile?.bio || '');
    setEditActive(teacher.isActive !== undefined ? teacher.isActive : true);
  };

  // 3. SAVE EDIT TEACHER
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setSavingEdit(true);

    try {
      const res: any = await api.put(`/admin/teachers/${editingTeacher.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        qualifications: editQualifications,
        specialization: editSpecialization,
        bio: editBio,
        isActive: editActive
      });

      if (res.success) {
        setEditingTeacher(null);
        fetchTeachersAndBatches();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating teacher.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. DELETE TEACHER
  const handleDeleteTeacher = async (teacherId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove instructor "${name}"? This will unassign all batches.`)) {
      return;
    }
    setDeletingId(teacherId);
    try {
      const res: any = await api.delete(`/admin/teachers/${teacherId}`);
      if (res.success) {
        fetchTeachersAndBatches();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting teacher.');
    } finally {
      setDeletingId(null);
    }
  };

  // 5. TOGGLE STATUS
  const handleToggleStatus = async (teacherId: string) => {
    try {
      const res: any = await api.post(`/admin/users/${teacherId}/toggle-status`);
      if (res.success) fetchTeachersAndBatches();
    } catch (e: any) {
      alert(e.message || 'Error toggling status.');
    }
  };

  // 6. ASSIGN BATCH
  const handleAssignBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageTeacher || !batchToAssign) return;
    setAssigning(true);

    try {
      const res: any = await api.post(`/admin/teachers/${manageTeacher.id}/batches`, {
        batchId: batchToAssign
      });
      if (res.success) {
        setManageTeacher(null);
        fetchTeachersAndBatches();
      }
    } catch (e: any) {
      alert(e.message || 'Error assigning batch.');
    } finally {
      setAssigning(false);
    }
  };

  // 7. UNASSIGN BATCH
  const handleUnassignBatch = async (teacherId: string, batchId: string) => {
    if (!window.confirm('Remove teacher from this batch?')) return;
    try {
      const res: any = await api.delete(`/admin/teachers/${teacherId}/batches/${batchId}`);
      if (res.success) fetchTeachersAndBatches();
    } catch (e) {
      console.error('Error unassigning batch:', e);
    }
  };

  const toggleBatchSelection = (batchId: string) => {
    setSelectedBatchIds(prev =>
      prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
    );
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Faculty & Instructor Management</h1>
            <Badge variant="default" className="text-[10px] font-bold">
              Admin Exclusive Privilege
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Authorize new instructors, edit qualifications, assign cohorts, suspend access, or delete records.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="font-bold shadow-lg shadow-indigo-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" /> Add New Teacher
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teachers.map(t => (
            <div key={t.id} className="p-6 rounded-3xl bg-[#0D111F] border border-white/10 shadow-xl flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-base">
                      {t.firstName?.[0]}{t.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-white">{t.firstName} {t.lastName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {t.email}
                      </p>
                      {t.phone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {t.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(t.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      t.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                    }`}
                    title="Click to toggle teacher access"
                  >
                    {t.isActive ? 'Active Faculty' : 'Suspended'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#11162B] border border-white/10 text-xs space-y-1">
                  <p className="font-bold text-indigo-300">Credentials & Focus:</p>
                  <p className="text-slate-200 font-medium">{t.teacherProfile?.qualifications || 'MA Germanistik'}</p>
                  <p className="text-slate-400 italic">{t.teacherProfile?.specialization || 'Goethe Exam Preparation'}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {t.teacherProfile?.bio || 'Certified DaF instructor guiding students through CEFR levels.'}
                </p>

                {/* Assigned Batches */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Assigned Cohorts ({t.batches?.length || 0}):</span>
                    <span className="text-slate-400 font-semibold">{t.totalStudents || 0} Total Students</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {t.batches && t.batches.length > 0 ? (
                      t.batches.map((b: any) => (
                        <span
                          key={b.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold"
                        >
                          {b.name} ({b.level})
                          <button
                            type="button"
                            onClick={() => handleUnassignBatch(t.id, b.id)}
                            className="text-indigo-400 hover:text-rose-400 transition-colors ml-1"
                            title="Remove from batch"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No batches currently allocated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Delete, Allocate */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    title="Edit Teacher Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t.id, `${t.firstName} ${t.lastName}`)}
                    disabled={deletingId === t.id}
                    className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManageTeacher(t)}
                  className="text-xs font-bold"
                >
                  <Users className="w-3.5 h-3.5 mr-1" /> Allocate to Batch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEACHER MODAL (ADMIN ONLY) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Faculty Instructor"
        description="Only platform administrators can create teacher accounts and provision login credentials."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Katharina"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="Weber"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="teacher@deutschwelt.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+49 151 87654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Initial Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Qualifications"
              placeholder="MA in Germanistik (LMU Munich)"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
            />
            <Input
              label="Pedagogical Specialization"
              placeholder="Goethe B1/B2 Exam Prep, Phonetics"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Faculty Biography
            </label>
            <textarea
              rows={3}
              placeholder="Brief professional background, teaching philosophy, and academic certifications..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0F1424] p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Optional Initial Batch Allocation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Allocate Initial Student Batches (Multi-Teacher Access)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {batches.map(b => (
                <label
                  key={b.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedBatchIds.includes(b.id)
                      ? 'border-indigo-500/50 bg-indigo-500/15 font-bold text-white'
                      : 'border-white/10 bg-[#0F1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBatchIds.includes(b.id)}
                    onChange={() => toggleBatchSelection(b.id)}
                    className="rounded text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>{b.name} ({b.level})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={saving}>
              Authorize & Create Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT TEACHER MODAL */}
      <Modal
        isOpen={Boolean(editingTeacher)}
        onClose={() => setEditingTeacher(null)}
        title="Edit Faculty Instructor"
        description="Update instructor credentials, bio, and authorization status."
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
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Qualifications"
              value={editQualifications}
              onChange={(e) => setEditQualifications(e.target.value)}
            />
            <Input
              label="Pedagogical Specialization"
              value={editSpecialization}
              onChange={(e) => setEditSpecialization(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Faculty Biography
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0F1424] p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Faculty Access Status
            </label>
            <select
              value={editActive ? 'active' : 'suspended'}
              onChange={(e) => setEditActive(e.target.value === 'active')}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
            >
              <option value="active" className="bg-[#0D111F] text-white">Active Faculty (Access Permitted)</option>
              <option value="suspended" className="bg-[#0D111F] text-white">Suspended (Access Revoked)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={savingEdit}>
              Save Teacher Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ALLOCATE BATCH MODAL */}
      <Modal
        isOpen={Boolean(manageTeacher)}
        onClose={() => setManageTeacher(null)}
        title={`Allocate Batch to ${manageTeacher?.firstName} ${manageTeacher?.lastName}`}
        description="Select an active cohort to assign to this instructor."
        maxWidth="md"
      >
        <form onSubmit={handleAssignBatch} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Batch / Cohort
            </label>
            <select
              value={batchToAssign}
              onChange={(e) => setBatchToAssign(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id} className="bg-[#0D111F] text-white">
                  {b.name} ({b.level}) — Max {b.maxStudents} Students
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setManageTeacher(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold" isLoading={assigning}>
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminTeachersPage;
