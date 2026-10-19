import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { GermanLevel, PublicationStatus } from '@deutschwelt/shared';
import { BookOpen, Plus, Clock, Eye, Layers } from 'lucide-react';

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Course State
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(GermanLevel.A1);
  const [estimatedHours, setEstimatedHours] = useState(60);
  const [saving, setSaving] = useState(false);

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
    } catch (e) {
      console.error('Error creating course:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">Curriculum & Course Management</h1>
          <p className="text-xs text-dark-muted">Oversee A1 through B2 learning tracks, unit structures, and lessons.</p>
        </div>

        <Button variant="secondary" size="md" onClick={() => setIsModalOpen(true)} className="font-bold shadow-md self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" /> Add New Course
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-navy text-white text-xs font-black uppercase">
                    Level {course.level}
                  </span>
                  <Badge variant="success" className="text-[10px]">{course.status}</Badge>
                </div>
                <h3 className="text-xl font-bold text-navy">{course.title}</h3>
                <p className="text-xs text-dark-muted max-w-xl">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{course.estimatedHours} Hours</span>
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {course.units?.length || 0} Units</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to={`/courses/${course.slug}`}>
                  <Button variant="outline" size="sm" className="font-bold">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Preview Course
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COURSE MODAL */}
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
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                CEFR Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value={GermanLevel.A1}>A1 Beginner</option>
                <option value={GermanLevel.A2}>A2 Elementary</option>
                <option value={GermanLevel.B1}>B1 Intermediate</option>
                <option value={GermanLevel.B2}>B2 Advanced</option>
              </select>
            </div>
          </div>

          <Input
            label="Estimated Study Duration (Hours)"
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Course Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe what learners will achieve upon completion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              Publish Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
