import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { GraduationCap, Plus, Mail, CheckCircle2 } from 'lucide-react';

export function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/teachers');
      if (res.success) {
        setTeachers(res.teachers);
      }
    } catch (e) {
      console.error('Error fetching teachers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res: any = await api.post('/admin/teachers', {
        firstName,
        lastName,
        email,
        phone,
        bio,
        qualifications,
        specialization
      });

      if (res.success) {
        setIsModalOpen(false);
        // Clear fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setBio('');
        fetchTeachers();
      }
    } catch (e) {
      console.error('Error creating teacher:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">Faculty & Instructors</h1>
          <p className="text-xs text-dark-muted">Manage certified DaF instructors, qualifications, and batch workloads.</p>
        </div>

        <Button variant="secondary" size="md" onClick={() => setIsModalOpen(true)} className="font-bold shadow-md self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" /> Add New Teacher
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teachers.map(t => (
            <div key={t.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy text-white font-bold flex items-center justify-center text-base">
                    {t.firstName?.[0]}{t.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{t.firstName} {t.lastName}</h3>
                    <p className="text-xs text-dark-muted flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {t.email}
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Active Faculty</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <p className="font-bold text-navy">Credentials & Specialization:</p>
                <p className="text-dark font-medium">{t.teacherProfile?.qualifications || 'MA Germanistik'}</p>
                <p className="text-dark-muted italic">{t.teacherProfile?.specialization || 'Goethe-Zertifikat Exam Preparation'}</p>
              </div>

              <p className="text-xs text-dark-muted leading-relaxed line-clamp-2">
                {t.teacherProfile?.bio || 'Experienced German language instructor guiding students through CEFR levels.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEACHER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Faculty Instructor"
        description="Create an authorized teacher account on the DeutschWelt platform."
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
              placeholder="k.weber@deutschwelt.de"
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
            label="Academic Qualifications"
            placeholder="e.g. MA Germanistik (LMU Munich), DaF Certification"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            required
          />

          <Input
            label="Specialization Focus"
            placeholder="e.g. Goethe-Zertifikat Exam Preparation, Phonetics"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Instructor Bio
            </label>
            <textarea
              rows={3}
              placeholder="Brief professional background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
