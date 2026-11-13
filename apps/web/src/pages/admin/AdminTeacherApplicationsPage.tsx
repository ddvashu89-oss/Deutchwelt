import React, { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Download, FileText, Mail, RefreshCw, Search, UserCheck, UserRoundX, Users } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input, Textarea } from '../../components/ui/Input.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

type Application = {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  germanProficiency: string; teachingExperienceYears: number; qualifications: string;
  specialization: string; availability: string; motivation: string; preferredLanguage: 'en' | 'de';
  status: string; adminNotes?: string; interviewAt?: string; interviewTimezone?: string;
  interviewLocation?: string; interviewNotes?: string; decisionNote?: string;
  teacherUserId?: string; invitationSentAt?: string; createdAt: string;
  documents?: { cv?: { fileName: string; sizeBytes: number }; certificates?: Array<{ fileName: string; sizeBytes: number }> };
};

const statusOptions = ['SUBMITTED', 'IN_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'HIRED', 'DECLINED'];

function toLocalInputTime(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const part = (type: string) => parts.find(item => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

function localInputTimeToUtc(value: string, timezone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Choose a valid interview date and time.');
  const [, year, month, day, hour, minute] = match;
  const wallTime = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  let utcTime = wallTime;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(utcTime));
    const part = (type: string) => parts.find(item => item.type === type)?.value || '0';
    const representedWallTime = Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day')), Number(part('hour')), Number(part('minute')));
    const difference = representedWallTime - utcTime;
    if (!difference) break;
    utcTime = wallTime - difference;
  }
  const resolved = new Date(utcTime);
  if (toLocalInputTime(resolved.toISOString(), timezone) !== value) throw new Error('That local time does not exist because of a clock change. Choose another time.');
  return resolved.toISOString();
}

export function AdminTeacherApplicationsPage() {
  const { language } = useLanguage();
  const de = language === 'de';
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin');
  const [location, setLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result: any = await api.get('/admin/teacher-applications');
      const items = result.applications || [];
      setApplications(items);
      setSelected(current => current ? items.find((item: Application) => item.id === current.id) || current : null);
    } catch (err: any) { setError(err.message || (de ? 'Bewerbungen konnten nicht geladen werden.' : 'Could not load applications.')); }
    finally { setLoading(false); }
  }, [de]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);
  useEffect(() => {
    setAdminNotes(selected?.adminNotes || '');
    setDecisionNote(selected?.decisionNote || '');
    const selectedTimezone = selected?.interviewTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    setTimezone(selectedTimezone);
    setInterviewAt(selected?.interviewAt ? toLocalInputTime(selected.interviewAt, selectedTimezone) : '');
    setLocation(selected?.interviewLocation || '');
    setInterviewNotes(selected?.interviewNotes || '');
  }, [selected?.id]);

  const refreshSelected = async (id: string) => {
    await loadApplications();
    try { const result: any = await api.get(`/admin/teacher-applications/${id}`); setSelected(result.application); }
    catch { /* Keep the successful mutation response visible. */ }
  };

  const changeStatus = async (status: string) => {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      const result: any = await api.patch(`/admin/teacher-applications/${selected.id}`, { status, adminNotes });
      setSelected(result.application); await refreshSelected(selected.id);
    } catch (err: any) { setError(err.message || 'Could not update application.'); }
    finally { setBusy(false); }
  };

  const scheduleInterview = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError('');
    try {
      const result: any = await api.post(`/admin/teacher-applications/${selected.id}/interview`, { interviewAt: localInputTimeToUtc(interviewAt, timezone), timezone, location, notes: interviewNotes });
      setSelected(result.application);
      await refreshSelected(selected.id);
      if (!result.emailSent) setError(de ? 'Termin gespeichert, aber die E-Mail konnte nicht gesendet werden. Prüfen Sie den E-Mail-Versand.' : 'Interview saved, but the email could not be sent. Check email delivery settings.');
    } catch (err: any) { setError(err.message || 'Could not schedule interview.'); }
    finally { setBusy(false); }
  };

  const decide = async (decision: 'HIRED' | 'DECLINED') => {
    if (!selected) return;
    const confirmed = window.confirm(decision === 'HIRED'
      ? (de ? `Bewerbung von ${selected.firstName} ${selected.lastName} annehmen und ein Lehrkraft-Konto erstellen?` : `Hire ${selected.firstName} ${selected.lastName} and create a teacher account?`)
      : (de ? `Bewerbung von ${selected.firstName} ${selected.lastName} ablehnen?` : `Decline ${selected.firstName} ${selected.lastName}'s application?`));
    if (!confirmed) return;
    setBusy(true); setError('');
    try {
      const result: any = await api.post(`/admin/teacher-applications/${selected.id}/decision`, { decision, note: decisionNote });
      setSelected(result.application); await refreshSelected(selected.id);
      if (decision === 'HIRED' && !result.invitationSent) setError(de ? 'Konto erstellt. Die Einladungs-E-Mail konnte nicht gesendet werden; Sie können sie erneut senden.' : 'Account created, but the invitation email could not be sent. You can retry it.');
    } catch (err: any) { setError(err.message || 'Could not save the decision.'); }
    finally { setBusy(false); }
  };

  const resendInvite = async () => {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      const result: any = await api.post(`/admin/teacher-applications/${selected.id}/invite`, {});
      if (!result.invitationSent) setError(de ? 'E-Mail nicht gesendet. Prüfen Sie den E-Mail-Versand.' : 'Email was not sent. Check email delivery settings.');
      await refreshSelected(selected.id);
    } catch (err: any) { setError(err.message || 'Could not send teacher invitation.'); }
    finally { setBusy(false); }
  };

  const visibleApplications = applications.filter(application => {
    const matchesStatus = statusFilter === 'ALL' || application.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${application.firstName} ${application.lastName} ${application.email} ${application.specialization}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
  const statusLabel = (status: string) => ({ SUBMITTED: de ? 'Eingegangen' : 'Submitted', IN_REVIEW: de ? 'In Prüfung' : 'In review', INTERVIEW_SCHEDULED: de ? 'Gespräch geplant' : 'Interview scheduled', INTERVIEWED: de ? 'Gespräch geführt' : 'Interviewed', HIRED: de ? 'Eingestellt' : 'Hired', DECLINED: de ? 'Abgelehnt' : 'Declined' } as Record<string, string>)[status] || status;
  const statusStyle = (status: string) => status === 'HIRED' ? 'bg-emerald-50 text-emerald-800' : status === 'DECLINED' ? 'bg-rose-50 text-rose-700' : status === 'INTERVIEW_SCHEDULED' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800';
  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-forest-700">{de ? 'Team · Recruiting' : 'Team · Recruiting'}</p><h1 className="font-heading text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">{de ? 'Lehrkraft-Bewerbungen' : 'Teacher applications'}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{de ? 'Bewerbungen und Unterlagen prüfen, Vorstellungsgespräche planen und Einstellungsentscheidungen festhalten.' : 'Review applicant profiles and documents, schedule interviews, and record hiring decisions.'}</p></div>
        <Button variant="outline" onClick={() => void loadApplications()} isLoading={loading}><RefreshCw className="h-4 w-4" />{de ? 'Aktualisieren' : 'Refresh'}</Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={de ? 'Bewerbungsübersicht' : 'Application overview'}>
        {[
          { label: de ? 'Gesamt' : 'Total', value: applications.length, icon: Users },
          { label: de ? 'Neu' : 'New', value: applications.filter(item => item.status === 'SUBMITTED').length, icon: FileText },
          { label: de ? 'Gespräche' : 'Interviews', value: applications.filter(item => item.status === 'INTERVIEW_SCHEDULED').length, icon: CalendarDays },
          { label: de ? 'Eingestellt' : 'Hired', value: applications.filter(item => item.status === 'HIRED').length, icon: UserCheck }
        ].map(stat => <article key={stat.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900"><stat.icon className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-gray-500">{stat.label}</p><p className="text-2xl font-black text-gray-950">{stat.value}</p></div></article>)}
      </section>

      {error && <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      <div className="grid items-start gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-3 border-b border-gray-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-0 flex-1"><span className="sr-only">{de ? 'Suchen' : 'Search'}</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={de ? 'Name, E-Mail oder Fachgebiet' : 'Name, email, or subject'} className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-800/10" /></label><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label={de ? 'Nach Status filtern' : 'Filter by status'} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm"><option value="ALL">{de ? 'Alle Status' : 'All statuses'}</option>{statusOptions.map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
            <p className="text-xs text-gray-500">{visibleApplications.length} {de ? 'Bewerbungen' : 'applications'}</p>
          </div>
          <div className="max-h-[74vh] space-y-2 overflow-y-auto p-3">
            {loading ? <div className="space-y-3 p-2"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div> : visibleApplications.length === 0 ? <div className="p-9 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700">{de ? 'Keine Bewerbungen gefunden' : 'No applications found'}</p></div> : visibleApplications.map(application => <button key={application.id} type="button" onClick={() => setSelected(application)} className={`w-full rounded-2xl border p-4 text-left transition hover:border-forest-300 hover:bg-forest-50/40 ${selected?.id === application.id ? 'border-forest-500 bg-forest-50/60' : 'border-gray-100 bg-white'}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-bold text-gray-950">{application.firstName} {application.lastName}</p><p className="mt-1 truncate text-xs text-gray-600">{application.email}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(application.status)}`}>{statusLabel(application.status)}</span></div><div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"><span>{application.germanProficiency}</span><span>·</span><span>{application.teachingExperienceYears} {de ? 'J. Erfahrung' : 'yrs experience'}</span><span>·</span><span>{new Date(application.createdAt).toLocaleDateString(de ? 'de-DE' : 'en-GB')}</span></div><p className="mt-2 truncate text-xs font-medium text-forest-900">{application.specialization}</p></button>)}
          </div>
        </section>

        <section className="min-h-[460px] rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          {!selected ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-gray-500"><FileText className="h-9 w-9 text-gray-300" /><p className="mt-3 text-sm">{de ? 'Wählen Sie eine Bewerbung aus, um das Profil zu prüfen.' : 'Select an application to review the candidate profile.'}</p></div> : <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-2xl font-black text-gray-950">{selected.firstName} {selected.lastName}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(selected.status)}`}>{statusLabel(selected.status)}</span></div><p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600"><a className="inline-flex items-center gap-1.5 hover:text-forest-900" href={`mailto:${selected.email}`}><Mail className="h-4 w-4" />{selected.email}</a>{selected.phone && <span>{selected.phone}</span>}</p></div><p className="text-xs text-gray-500">{de ? 'Eingegangen' : 'Applied'} · {new Date(selected.createdAt).toLocaleString(de ? 'de-DE' : 'en-GB')}</p></div>

            <div className="grid gap-3 sm:grid-cols-2"><Info label={de ? 'Deutschkenntnisse' : 'German proficiency'} value={selected.germanProficiency} /><Info label={de ? 'Unterrichtserfahrung' : 'Teaching experience'} value={`${selected.teachingExperienceYears} ${de ? 'Jahre' : 'years'}`} /><Info label={de ? 'Fachgebiet' : 'Teaching focus'} value={selected.specialization} /><Info label={de ? 'Verfügbarkeit' : 'Availability'} value={selected.availability} /></div>
            <Info label={de ? 'Qualifikationen' : 'Qualifications'} value={selected.qualifications} multiline />
            <Info label={de ? 'Motivation und Unterrichtsansatz' : 'Motivation and teaching approach'} value={selected.motivation} multiline />

            <div className="rounded-2xl border border-gray-200 p-4"><h3 className="text-sm font-bold text-gray-900">{de ? 'Bewerbungsunterlagen' : 'Application documents'}</h3><div className="mt-3 flex flex-wrap gap-2">{selected.documents?.cv && <a className="inline-flex max-w-full items-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-xs font-bold text-forest-950 hover:bg-forest-100" href={`/api/v1/admin/teacher-applications/${selected.id}/documents/cv`}><Download className="h-4 w-4 shrink-0" /><span className="max-w-48 truncate">{selected.documents.cv.fileName}</span><span className="font-medium text-gray-500">{formatSize(selected.documents.cv.sizeBytes)}</span></a>}{selected.documents?.certificates?.map((document, index) => <a key={`${document.fileName}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800 hover:bg-gray-200" href={`/api/v1/admin/teacher-applications/${selected.id}/documents/certificate/${index}`}><Download className="h-4 w-4 shrink-0" /><span className="max-w-48 truncate">{document.fileName}</span><span className="font-medium text-gray-500">{formatSize(document.sizeBytes)}</span></a>)}</div></div>

            {selected.status !== 'HIRED' && selected.status !== 'DECLINED' && <>
              <div className="rounded-2xl border border-gray-200 p-4"><div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-forest-800" /><h3 className="text-sm font-bold text-gray-900">{de ? 'Prüfung' : 'Review'}</h3></div><Textarea label={de ? 'Interne Notizen' : 'Internal notes'} rows={2} maxLength={4000} value={adminNotes} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(event.target.value)} /><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => void changeStatus('IN_REVIEW')}>{de ? 'In Prüfung setzen' : 'Mark in review'}</Button>{selected.status === 'INTERVIEW_SCHEDULED' && <Button variant="outline" size="sm" disabled={busy} onClick={() => void changeStatus('INTERVIEWED')}>{de ? 'Gespräch geführt' : 'Mark interviewed'}</Button>}</div></div>

              <form onSubmit={scheduleInterview} className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4"><div className="mb-3 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-800" /><h3 className="text-sm font-bold text-gray-900">{de ? 'Vorstellungsgespräch planen' : 'Schedule an interview'}</h3></div><div className="grid gap-3 sm:grid-cols-2"><Input label={de ? 'Datum und Uhrzeit' : 'Date and time'} type="datetime-local" required value={interviewAt} onChange={event => setInterviewAt(event.target.value)} /><Input label={de ? 'Zeitzone' : 'Time zone'} required value={timezone} onChange={event => setTimezone(event.target.value)} placeholder="Europe/Berlin" /><Input label={de ? 'Ort oder Video-Link' : 'Location or video link'} value={location} onChange={event => setLocation(event.target.value)} placeholder="https://…" /><Input label={de ? 'Gesprächsnotiz (optional)' : 'Interview note (optional)'} value={interviewNotes} onChange={event => setInterviewNotes(event.target.value)} /></div><Button type="submit" isLoading={busy} className="mt-4"><CalendarDays className="h-4 w-4" />{de ? 'Termin speichern und E-Mail senden' : 'Save interview and email applicant'}</Button></form>

              <div className="rounded-2xl border border-gray-200 p-4"><h3 className="text-sm font-bold text-gray-900">{de ? 'Einstellungsentscheidung' : 'Hiring decision'}</h3><div className="mt-3"><Textarea label={de ? 'Notiz an die Bewerberin oder den Bewerber (optional)' : 'Note to the applicant (optional)'} rows={2} maxLength={4000} value={decisionNote} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDecisionNote(event.target.value)} /></div><div className="mt-3 flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void decide('HIRED')}><UserCheck className="h-4 w-4" />{de ? 'Einstellen und Konto anlegen' : 'Hire and create teacher account'}</Button><Button variant="danger" disabled={busy} onClick={() => void decide('DECLINED')}><UserRoundX className="h-4 w-4" />{de ? 'Ablehnen' : 'Decline'}</Button></div></div>
            </>}

            {selected.status === 'HIRED' && <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-emerald-900">{de ? 'Lehrkraft-Konto erstellt' : 'Teacher account created'}</p><p className="mt-1 text-xs text-emerald-800">{selected.invitationSentAt ? (de ? 'Einladungslink wurde per E-Mail gesendet.' : 'Password setup link was emailed to the applicant.') : (de ? 'Einladungs-E-Mail steht noch aus.' : 'Account invitation is still pending.')}</p></div>{!selected.invitationSentAt && <Button variant="outline" size="sm" disabled={busy} onClick={() => void resendInvite()}><Mail className="h-4 w-4" />{de ? 'Einladung erneut senden' : 'Send account invite'}</Button>}</div>}
            {selected.status === 'DECLINED' && <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-4 text-sm font-semibold text-gray-700"><UserRoundX className="h-4 w-4" />{de ? 'Bewerbung abgeschlossen: abgelehnt.' : 'Application closed: declined.'}</div>}
          </div>}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value, multiline = false }: { label: string; value?: string; multiline?: boolean }) {
  return <div className="min-w-0 rounded-2xl bg-[#f7f8f5] p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p><p className={`mt-1 break-words text-sm leading-6 text-gray-900 ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p></div>;
}
