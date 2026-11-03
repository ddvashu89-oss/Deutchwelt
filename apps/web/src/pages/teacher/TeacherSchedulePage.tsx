import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Calendar, Video, Users, CheckCircle2 } from 'lucide-react';

export function TeacherSchedulePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [form, setForm] = useState({ batchId: '', title: '', description: '', startsAt: '', durationMinutes: '45', meetingUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const [classResult, batchResult]: any[] = await Promise.all([api.get('/teacher/live-classes'), api.get('/teacher/batches')]);
      if (classResult.success) setClasses(classResult.classes || []);
      if (batchResult.success) {
        const records = batchResult.batches || [];
        setBatches(records);
        if (!form.batchId && records[0]) setForm(current => ({ ...current, batchId: records[0].id }));
      }
    } catch (err: any) { setError(err?.message || 'Could not load classes and batches.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createClass = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result: any = await api.post('/teacher/live-classes', { ...form, durationMinutes: Number(form.durationMinutes), startsAt: new Date(form.startsAt).toISOString() });
      if (result.success) { setNotice('Class scheduled. Batch members have an in-app notification.'); setForm(current => ({ ...current, title: '', description: '', startsAt: '', meetingUrl: '' })); await load(); }
    } catch (err: any) { setError(err?.message || 'Could not schedule this class.'); }
    finally { setSaving(false); }
  };

  const openAttendance = async (item: any) => {
    setError('');
    try { const result: any = await api.get(`/teacher/live-classes/${item.id}/attendance`); setSelectedClass(item); setRoster((result.students || []).map((student: any) => ({ ...student, status: student.attendance?.status || 'PRESENT' }))); }
    catch (err: any) { setError(err?.message || 'Could not load class roster.'); }
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true); setError('');
    try { await api.put(`/teacher/live-classes/${selectedClass.id}/attendance`, { records: roster.map(student => ({ userId: student.id, status: student.status })) }); setNotice('Attendance saved.'); setSelectedClass(null); await load(); }
    catch (err: any) { setError(err?.message || 'Attendance could not be saved.'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-5xl space-y-6 pb-16">
    <header className="rounded-3xl border border-[#e8e3d8] bg-[#fffefa] p-6"><p className="text-xs font-bold uppercase tracking-widest text-germanRed">Teacher workspace</p><h1 className="mt-2 text-3xl font-extrabold text-navy">Class schedule & attendance</h1><p className="mt-1 text-sm text-dark-muted">Schedule batch sessions and record attendance against the enrolled student roster.</p></header>
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="mb-4 font-bold text-navy">Schedule a live class</h2><form className="grid gap-3 sm:grid-cols-2" onSubmit={createClass}>
      <select required value={form.batchId} onChange={event => setForm({ ...form, batchId: event.target.value })} className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm"><option value="">Select batch</option>{batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name} · {batch.level}</option>)}</select>
      <input required minLength={4} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Class title" className="h-11 rounded-xl border border-gray-300 px-3 text-sm" />
      <input required type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })} className="h-11 rounded-xl border border-gray-300 px-3 text-sm" />
      <input required type="number" min="15" max="240" value={form.durationMinutes} onChange={event => setForm({ ...form, durationMinutes: event.target.value })} placeholder="Duration in minutes" className="h-11 rounded-xl border border-gray-300 px-3 text-sm" />
      <input required type="url" value={form.meetingUrl} onChange={event => setForm({ ...form, meetingUrl: event.target.value })} placeholder="https://meet.google.com/..." className="h-11 rounded-xl border border-gray-300 px-3 text-sm sm:col-span-2" />
      <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="What will students practice?" className="min-h-20 rounded-xl border border-gray-300 p-3 text-sm sm:col-span-2" />
      <Button type="submit" isLoading={saving} disabled={!batches.length} className="sm:col-span-2"><Calendar className="mr-2 h-4 w-4" />Schedule class</Button>
    </form></section>
    <section className="space-y-3"><h2 className="text-lg font-bold text-navy">Scheduled sessions</h2>{loading ? <p>Loading…</p> : classes.length ? classes.map(item => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-navy">{item.title}</h3><p className="text-sm text-dark-muted">{item.batch?.name} · {new Date(item.startsAt).toLocaleString()} · {item.durationMinutes} min</p><p className="mt-1 text-xs text-dark-muted">{item._count?.attendance || 0} attendance records</p></div><div className="flex flex-wrap gap-2"><a className="inline-flex min-h-10 items-center rounded-xl border border-gray-200 px-3 text-sm font-bold text-navy" href={item.meetingUrl} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" />Open meeting</a><Button size="sm" variant="outline" onClick={() => openAttendance(item)}><Users className="mr-2 h-4 w-4" />Attendance</Button></div></article>) : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-dark-muted">No sessions scheduled yet.</div>}</section>
    {selectedClass && <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4"><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-navy">Attendance: {selectedClass.title}</h2><p className="text-xs text-dark-muted">Mark each enrolled student</p></div><button onClick={() => setSelectedClass(null)} className="rounded px-3 py-1 text-sm">Close</button></div>{roster.map(student => <div key={student.id} className="flex items-center justify-between border-b border-gray-100 py-3"><div><p className="font-semibold text-navy">{student.firstName} {student.lastName}</p><p className="text-xs text-dark-muted">{student.email}</p></div><select value={student.status} onChange={event => setRoster(records => records.map(record => record.id === student.id ? { ...record, status: event.target.value } : record))} className="rounded-lg border border-gray-300 px-2 py-2 text-sm"><option value="PRESENT">Present</option><option value="LATE">Late</option><option value="ABSENT">Absent</option><option value="EXCUSED">Excused</option></select></div>)}{!roster.length && <p className="py-5 text-sm text-dark-muted">No active students in this batch.</p>}<Button onClick={saveAttendance} isLoading={saving} className="mt-4 w-full"><CheckCircle2 className="mr-2 h-4 w-4" />Save attendance</Button></div></div>}
  </div>;
}
