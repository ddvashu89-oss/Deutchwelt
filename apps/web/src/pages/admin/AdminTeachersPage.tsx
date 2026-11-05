import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Plus,
  Mail,
  Users,
  BookOpen,
  Trash2,
  Edit2,
  Phone,
  Search,
  X,
  UserRoundCheck,
  UserRoundX
} from 'lucide-react';

export function AdminTeachersPage() {
  const { language } = useLanguage();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

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
      setLoadError('');
      const [tRes, bRes]: any[] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/batches')
      ]);

      if (tRes.success) setTeachers(tRes.teachers);
      if (bRes.success) {
        setBatches(bRes.batches);
        if (bRes.batches.length > 0) setBatchToAssign(bRes.batches[0].id);
      }
    } catch (e) {
      console.error('Error fetching admin faculty data:', e);
      setLoadError('Unable to load mentors right now. Please try again.');
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

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = `${teacher.firstName} ${teacher.lastName} ${teacher.email} ${teacher.teacherProfile?.specialization || ''}`
      .toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? teacher.isActive : !teacher.isActive);
    return matchesSearch && matchesStatus;
  });
  const activeCount = teachers.filter((teacher) => teacher.isActive).length;
  const assignedCount = teachers.filter((teacher) => teacher.batches?.length > 0).length;
  const availableBatches = batches.filter((batch) => !manageTeacher?.batches?.some((assigned: any) => assigned.id === batch.id));

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-forest-700">People / Mentors</p>
          <h1 className="font-heading text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Manage mentors</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Manage instructor profiles, access, and teaching cohorts in one place.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full shrink-0 sm:w-auto">
          <Plus className="h-4 w-4" /> Add mentor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total mentors', value: teachers.length, icon: Users },
          { label: 'Active mentors', value: activeCount, icon: UserRoundCheck },
          { label: 'Mentors with cohorts', value: assignedCount, icon: BookOpen }
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-[#e8e3d8] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-800"><Icon className="h-5 w-5" /></div>
            <div><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-0.5 text-2xl font-black text-gray-950">{loading ? '—' : value}</p></div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#e8e3d8] bg-white shadow-sm" aria-label="Mentor directory">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-lg font-bold text-gray-950">Mentor directory</h2><p className="mt-0.5 text-xs text-gray-500">{filteredTeachers.length} of {teachers.length} mentors</p></div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="relative min-w-0 flex-1 lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <span className="sr-only">Search mentors</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or subject" className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm focus:border-forest-700 focus:bg-white focus:outline-none" />
            </label>
            <label><span className="sr-only">Filter by access</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')} className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 sm:w-36"><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>
        ) : loadError ? (
          <div className="p-12 text-center"><p className="text-sm text-red-700">{loadError}</p><Button variant="outline" size="sm" onClick={fetchTeachersAndBatches} className="mt-4">Try again</Button></div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center"><Users className="mx-auto h-9 w-9 text-gray-300" /><h3 className="mt-3 font-bold text-gray-900">No mentors found</h3><p className="mt-1 text-sm text-gray-500">Try another search or filter.</p></div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            {filteredTeachers.map((teacher) => (
              <article key={teacher.id} className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-900 text-sm font-bold text-white">{teacher.firstName?.[0]}{teacher.lastName?.[0]}</div>
                    <div className="min-w-0"><h3 className="truncate text-base font-bold text-gray-950">{teacher.firstName} {teacher.lastName}</h3><p className="mt-1 flex items-center gap-1.5 break-all text-xs text-gray-600"><Mail className="h-3.5 w-3.5 shrink-0" />{teacher.email}</p>{teacher.phone && <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600"><Phone className="h-3.5 w-3.5" />{teacher.phone}</p>}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${teacher.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{teacher.isActive ? <UserRoundCheck className="h-3.5 w-3.5" /> : <UserRoundX className="h-3.5 w-3.5" />}{teacher.isActive ? 'Active' : 'Suspended'}</span>
                </div>
                <div className="mt-5 grid gap-3 rounded-xl bg-[#f7f8f5] p-4 sm:grid-cols-2"><div><p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Qualifications</p><p className="mt-1 text-sm font-medium leading-5 text-gray-900">{teacher.teacherProfile?.qualifications || 'Not added'}</p></div><div><p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Specialization</p><p className="mt-1 text-sm font-medium leading-5 text-gray-900">{teacher.teacherProfile?.specialization || 'Not added'}</p></div></div>
                {teacher.teacherProfile?.bio && <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">{teacher.teacherProfile.bio}</p>}
                <div className="mt-5 flex-1 border-t border-gray-100 pt-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-bold uppercase tracking-wide text-gray-600">Assigned cohorts <span className="text-forest-800">({teacher.batches?.length || 0})</span></h4><span className="text-xs text-gray-500">{teacher.totalStudents || 0} students</span></div><div className="flex flex-wrap gap-2">{teacher.batches?.length ? teacher.batches.map((batch: any) => <span key={batch.id} className="inline-flex max-w-full items-center gap-1 rounded-lg border border-forest-100 bg-forest-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-forest-900"><span className="truncate">{batch.name} · {batch.level}</span><button type="button" onClick={() => handleUnassignBatch(teacher.id, batch.id)} aria-label={language === 'de' ? `${batch.name} von ${teacher.firstName} entfernen` : `Remove ${batch.name} from ${teacher.firstName}`} className="rounded-md p-1 text-forest-700 hover:bg-red-50 hover:text-red-700"><X className="h-3.5 w-3.5" /></button></span>) : <p className="text-xs text-gray-400">No cohorts assigned yet.</p>}</div></div>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4"><Button variant="outline" size="sm" onClick={() => openEditModal(teacher)}><Edit2 className="h-3.5 w-3.5" /> Edit profile</Button><Button variant="outline" size="sm" onClick={() => { setManageTeacher(teacher); setBatchToAssign(batches.find((batch) => !teacher.batches?.some((assigned: any) => assigned.id === batch.id))?.id || ''); }} disabled={!batches.length}><Plus className="h-3.5 w-3.5" /> Assign cohort</Button><div className="hidden flex-1 sm:block" /><button type="button" onClick={() => handleToggleStatus(teacher.id)} className="rounded-full px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100">{teacher.isActive ? 'Suspend access' : 'Restore access'}</button><button type="button" onClick={() => handleDeleteTeacher(teacher.id, `${teacher.firstName} ${teacher.lastName}`)} disabled={deletingId === teacher.id} aria-label={language === 'de' ? `${teacher.firstName} ${teacher.lastName} löschen` : `Delete ${teacher.firstName} ${teacher.lastName}`} className="rounded-full p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CREATE TEACHER MODAL (ADMIN ONLY) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add mentor"
        description="Create a mentor profile and choose any initial teaching cohorts."
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
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Faculty Biography
            </label>
            <textarea
              rows={3}
              placeholder="Brief professional background, teaching philosophy, and academic certifications..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {/* Optional Initial Batch Allocation */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Allocate Initial Student Batches (Multi-Teacher Access)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {batches.map(b => (
                <label
                  key={b.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedBatchIds.includes(b.id)
                      ? 'border-navy bg-navy/5 font-bold text-navy'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBatchIds.includes(b.id)}
                    onChange={() => toggleBatchSelection(b.id)}
                    className="rounded text-navy focus:ring-navy"
                  />
                  <span>{b.name} ({b.level})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="font-bold" isLoading={saving}>
              Create mentor
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT TEACHER MODAL */}
      <Modal
        isOpen={Boolean(editingTeacher)}
        onClose={() => setEditingTeacher(null)}
        title="Edit mentor profile"
        description="Update contact details, qualifications, and access status."
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
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Faculty Biography
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Faculty Access Status
            </label>
            <select
              value={editActive ? 'active' : 'suspended'}
              onChange={(e) => setEditActive(e.target.value === 'active')}
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="active">Active Faculty (Access Permitted)</option>
              <option value="suspended">Suspended (Access Revoked)</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={savingEdit}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ALLOCATE BATCH MODAL */}
      <Modal
        isOpen={Boolean(manageTeacher)}
        onClose={() => setManageTeacher(null)}
        title={language === 'de' ? `Kohorte ${manageTeacher?.firstName || ''} ${manageTeacher?.lastName || ''} zuordnen` : `Assign cohort to ${manageTeacher?.firstName || ''} ${manageTeacher?.lastName || ''}`}
        description="Choose a cohort that is not already assigned to this mentor."
        maxWidth="md"
      >
        <form onSubmit={handleAssignBatch} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="mentor-batch" className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Cohort
            </label>
            <select
              id="mentor-batch"
              value={batchToAssign}
              onChange={(e) => setBatchToAssign(e.target.value)}
              disabled={!availableBatches.length}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-forest-700"
            >
              {availableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.level}) — Max {b.maxStudents} Students
                </option>
              ))}
            </select>
            {!availableBatches.length && <p className="text-xs text-gray-500">All available cohorts are already assigned.</p>}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setManageTeacher(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold" isLoading={assigning} disabled={!batchToAssign}>
              Assign cohort
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminTeachersPage;
