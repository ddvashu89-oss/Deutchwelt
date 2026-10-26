import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { GermanLevel, PublicationStatus } from '@deutschwelt/shared';
import { BookOpen, Plus, Clock, Eye, Layers, Edit2, Trash2 } from 'lucide-react';

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Course State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(GermanLevel.A1);
  const [estimatedHours, setEstimatedHours] = useState(60);
  const [saving, setSaving] = useState(false);

  // Edit Course State
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLevel, setEditLevel] = useState(GermanLevel.A1);
  const [editHours, setEditHours] = useState(60);
  const [editStatus, setEditStatus] = useState<PublicationStatus>(PublicationStatus.PUBLISHED);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/courses');
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (e) {
      console.error('Error fetching admin courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 1. CREATE COURSE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res: any = await api.post('/admin/courses', {
        slug,
        title,
        description,
        level,
        estimatedHours: Number(estimatedHours),
        learningObjectives: ['Master fundamental conversation', 'Understand core case grammar'],
        status: PublicationStatus.PUBLISHED
      });

      if (res.success) {
        setIsModalOpen(false);
        setSlug('');
        setTitle('');
        setDescription('');
        fetchCourses();
      }
    } catch (e: any) {
      alert(e.message || 'Error creating course.');
    } finally {
      setSaving(false);
    }
  };

  // 2. OPEN EDIT COURSE
  const openEditCourse = (course: any) => {
    setEditingCourse(course);
    setEditTitle(course.title || '');
    setEditSlug(course.slug || '');
    setEditDescription(course.description || '');
    setEditLevel(course.level || GermanLevel.A1);
    setEditHours(course.estimatedHours || 60);
    setEditStatus(course.status || PublicationStatus.PUBLISHED);
  };

  // 3. SAVE EDIT COURSE
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingEdit(true);

    try {
      const res: any = await api.put(`/admin/courses/${editingCourse.id}`, {
        title: editTitle,
        slug: editSlug,
        description: editDescription,
        level: editLevel,
        estimatedHours: Number(editHours),
        status: editStatus
      });

      if (res.success) {
        setEditingCourse(null);
        fetchCourses();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating course.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. DELETE COURSE
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${courseTitle}"? This will delete all units and lessons.`)) {
      return;
    }
    setDeletingId(courseId);
    try {
      const res: any = await api.delete(`/admin/courses/${courseId}`);
      if (res.success) {
        fetchCourses();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting course.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Curriculum & Course Management</h1>
            <Badge variant="default" className="text-[10px] font-bold">
              Admin Exclusive
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Oversee A1 through B2 learning tracks, create new courses, edit syllabus content, or delete tracks.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="font-bold shadow-lg shadow-indigo-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" /> Add New Course
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-3xl" />
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="p-6 rounded-3xl bg-[#0D111F] border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-white/20 transition-all">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase">
                    Level {course.level}
                  </span>
                  <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'outline'} className="text-[10px]">
                    {course.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-heading font-bold text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 max-w-2xl">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{course.estimatedHours} Hours</span>
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {course.units?.length || 0} Units</span>
                  <span className="text-slate-500 font-mono text-[11px]">/{course.slug}</span>
                </div>
              </div>

              {/* Action Buttons: Preview, Edit, Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/courses/${course.slug}`}>
                  <Button variant="outline" size="sm" className="font-bold">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                </Link>
                <button
                  onClick={() => openEditCourse(course)}
                  className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id, course.title)}
                  disabled={deletingId === course.id}
                  className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. CREATE COURSE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New German Course"
        description="Create a new CEFR curriculum path."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Course Title"
            placeholder="e.g. Deutsch B1: Intensive Business & Career German"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              placeholder="deutsch-b1-career-german"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CEFR Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value={GermanLevel.A1} className="bg-[#0D111F] text-white">A1 — Starter</option>
                <option value={GermanLevel.A2} className="bg-[#0D111F] text-white">A2 — Elementary</option>
                <option value={GermanLevel.B1} className="bg-[#0D111F] text-white">B1 — Intermediate</option>
                <option value={GermanLevel.B2} className="bg-[#0D111F] text-white">B2 — Upper Intermediate</option>
              </select>
            </div>
          </div>

          <Input
            label="Estimated Study Hours"
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Course Description & Syllabus Summary
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of grammar structures, dialogues, and learning milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0F1424] p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={saving}>
              Create Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. EDIT COURSE MODAL */}
      <Modal
        isOpen={Boolean(editingCourse)}
        onClose={() => setEditingCourse(null)}
        title="Edit German Course"
        description="Update curriculum details, CEFR level, or publication status."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          <Input
            label="Course Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CEFR Level
              </label>
              <select
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value={GermanLevel.A1} className="bg-[#0D111F] text-white">A1 — Starter</option>
                <option value={GermanLevel.A2} className="bg-[#0D111F] text-white">A2 — Elementary</option>
                <option value={GermanLevel.B1} className="bg-[#0D111F] text-white">B1 — Intermediate</option>
                <option value={GermanLevel.B2} className="bg-[#0D111F] text-white">B2 — Upper Intermediate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Study Hours"
              type="number"
              value={editHours}
              onChange={(e) => setEditHours(Number(e.target.value))}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Publication Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              >
                <option value={PublicationStatus.PUBLISHED} className="bg-[#0D111F] text-white">Published (Visible to Students)</option>
                <option value={PublicationStatus.DRAFT} className="bg-[#0D111F] text-white">Draft (Hidden)</option>
                <option value={PublicationStatus.ARCHIVED} className="bg-[#0D111F] text-white">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Course Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0F1424] p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold shadow-md" isLoading={savingEdit}>
              Save Course Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCoursesPage;
