import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Calendar, Clock, Video, Bell, CheckCircle2 } from 'lucide-react';

export function StudentSchedulePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [preferences, setPreferences] = useState({ emailReminders: false, whatsappReminders: false, reminderPhone: '' });
  const [savingPreferences, setSavingPreferences] = useState(false);

  const load = async () => {
    try {
      const result: any = await api.get('/student/schedule');
      if (result.success) setClasses(result.classes || []);
      const pref: any = await api.get('/student/notification-preferences').catch(() => null);
      if (pref?.preferences) setPreferences({ emailReminders: pref.preferences.emailReminders, whatsappReminders: pref.preferences.whatsappReminders, reminderPhone: pref.preferences.reminderPhone || '' });
    } catch (err: any) {
      setError(err?.message || 'Could not load your class schedule.');
    } finally { setLoading(false); }
  };

  const savePreferences = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingPreferences(true); setError('');
    try { await api.patch('/student/notification-preferences', preferences); setNotice('Reminder preferences saved.'); }
    catch (err: any) { setError(err?.message || 'Could not save your preferences.'); }
    finally { setSavingPreferences(false); }
  };

  useEffect(() => { load(); }, []);

  const enableReminders = async () => {
    if (!('Notification' in window)) return setNotice('Browser notifications are not supported on this device.');
    const permission = await Notification.requestPermission();
    setNotice(permission === 'granted' ? 'Class reminders are enabled in this browser.' : 'Allow notifications in your browser settings to receive reminders.');
    if (permission === 'granted') {
      classes.filter(item => item.startsAt && new Date(item.startsAt).getTime() > Date.now()).forEach(item => {
        const delay = new Date(item.startsAt).getTime() - Date.now() - 15 * 60 * 1000;
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
          window.setTimeout(() => new Notification('DeutschWelt class starts soon', { body: `${item.title} begins in 15 minutes.` }), delay);
        }
      });
    }
  };

  const checkIn = async (classId: string) => {
    setCheckingIn(classId); setError('');
    try {
      await api.post(`/student/live-classes/${classId}/check-in`);
      setNotice('Attendance marked. Have a good class!');
      await load();
    } catch (err: any) { setError(err?.message || 'Check-in is not available yet.'); }
    finally { setCheckingIn(null); }
  };

  const upcoming = classes.filter(item => new Date(item.startsAt).getTime() >= Date.now());
  const past = classes.filter(item => new Date(item.startsAt).getTime() < Date.now());

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <header className="flex flex-col gap-4 rounded-3xl border border-[#e8e3d8] bg-[#fffefa] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><Badge variant="germanRed">Class calendar</Badge><h1 className="mt-2 text-3xl font-extrabold text-navy">Your live classes</h1><p className="mt-1 text-sm text-dark-muted">See your batch sessions, join the meeting and mark attendance.</p></div>
        <Button variant="outline" onClick={enableReminders}><Bell className="mr-2 h-4 w-4" />Enable browser reminders</Button>
      </header>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form onSubmit={savePreferences} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><h2 className="font-bold text-navy">Class reminders</h2><p className="mt-1 text-xs text-dark-muted">Choose whether the academy may send you class reminders. Both options are off until you opt in.</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preferences.emailReminders} onChange={e=>setPreferences({...preferences,emailReminders:e.target.checked})}/> Email reminders</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preferences.whatsappReminders} onChange={e=>setPreferences({...preferences,whatsappReminders:e.target.checked})}/> WhatsApp reminders</label>
        {preferences.whatsappReminders && <label className="text-xs font-semibold sm:col-span-2">WhatsApp number with country code<input required value={preferences.reminderPhone} onChange={e=>setPreferences({...preferences,reminderPhone:e.target.value})} placeholder="+919876543210" className="mt-1 block w-full rounded-xl border border-gray-300 p-3 text-sm"/></label>}
        <div className="sm:col-span-2"><Button size="sm" disabled={savingPreferences}>{savingPreferences ? 'Saving…' : 'Save reminder preferences'}</Button></div>
      </form>
      {loading ? <div className="rounded-2xl bg-white p-8 text-sm text-dark-muted">Loading schedule…</div> : (
        <>
          <section className="space-y-3"><h2 className="text-lg font-bold text-navy">Upcoming</h2>
            {upcoming.length ? upcoming.map(item => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-navy">{item.title}</h3><Badge variant="outline">{item.batch?.name || 'Class'}</Badge></div><p className="mt-1 text-sm text-dark-muted">{item.teacherName} · {item.durationMinutes} minutes</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4 text-germanRed" />{new Date(item.startsAt).toLocaleString()}</p></div>
              <div className="flex flex-wrap gap-2">{item.attendanceStatus ? <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />{item.attendanceStatus}</Badge> : item.canCheckIn && <Button size="sm" variant="outline" isLoading={checkingIn === item.id} onClick={() => checkIn(item.id)}>Check in</Button>}<a href={item.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl bg-navy px-4 text-sm font-bold text-white"><Video className="mr-2 h-4 w-4" />Join class</a></div>
            </article>) : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-dark-muted">No classes scheduled yet. Your teacher’s next session will show here.</div>}
          </section>
          {past.length > 0 && <section className="space-y-3"><h2 className="text-lg font-bold text-navy">Recent sessions</h2>{past.slice(0, 10).map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"><div><p className="font-semibold text-navy">{item.title}</p><p className="text-xs text-dark-muted">{item.batch?.name} · {new Date(item.startsAt).toLocaleString()}</p></div><Badge variant={item.attendanceStatus === 'PRESENT' || item.attendanceStatus === 'LATE' ? 'success' : 'outline'}>{item.attendanceStatus || 'Attendance not recorded'}</Badge></div>)}</section>}
        </>
      )}
    </div>
  );
}
