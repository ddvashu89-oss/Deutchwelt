import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { CalendarClock, CheckCircle2, Clock3, FilePlus2, GraduationCap, Users } from 'lucide-react';

type ExamQuestion = {
  id: string;
  section: string;
  type: string;
  prompt: string;
  instructions: string;
  passage: string;
  audioUrl: string;
  options: string;
  answerKey: string;
  points: number;
  rubric: string;
};

const emptyQuestion = (): ExamQuestion => ({ id: crypto.randomUUID(), section: 'READING', type: 'MULTIPLE_CHOICE', prompt: '', instructions: '', passage: '', audioUrl: '', options: '', answerKey: '', points: 1, rubric: '' });
const asLines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);

export function TeacherExamsPage() {
  const { t } = useLanguage();
  const [batches, setBatches] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [format, setFormat] = useState('GOETHE');
  const [level, setLevel] = useState('A1');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passPercent, setPassPercent] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [publication, setPublication] = useState('DRAFT');
  const [questions, setQuestions] = useState<ExamQuestion[]>([emptyQuestion()]);
  const [reviewExam, setReviewExam] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptQuestions, setAttemptQuestions] = useState<any[]>([]);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState<Record<string, string>>({});
  const [gradingId, setGradingId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [batchRes, examRes]: any[] = await Promise.all([api.get('/teacher/batches'), api.get('/exams/teacher')]);
      const assigned = batchRes.batches || [];
      setBatches(assigned);
      if (!batchId && assigned.length) setBatchId(assigned[0].id);
      setExams(examRes.exams || []);
    } catch (e: any) {
      setError(e.message || 'Could not load exams.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateQuestion = (id: string, patch: Partial<ExamQuestion>) => setQuestions(current => current.map(question => question.id === id ? { ...question, ...patch } : question));

  const createExam = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      const prepared = questions.map(question => ({
        ...question,
        options: question.type === 'MULTIPLE_CHOICE' ? asLines(question.options) : [],
        answerKey: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'].includes(question.type) ? asLines(question.answerKey) : []
      }));
      const result: any = await api.post('/exams/teacher', {
        title, description, batchId, format, level, durationMinutes, passPercent, maxAttempts,
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        status: publication,
        questions: prepared
      });
      setSuccess(`${result.exam.title} · ${t(publication === 'PUBLISHED' ? 'exam.published' : 'exam.draft')}`);
      setTitle(''); setDescription(''); setQuestions([emptyQuestion()]);
      await load();
    } catch (e: any) { setError(e.message || 'Could not create exam.'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (exam: any, status: string) => {
    setError('');
    try {
      await api.patch(`/exams/teacher/${exam.id}/status`, { status });
      await load();
    } catch (e: any) { setError(e.message || 'Could not update exam status.'); }
  };

  const review = async (exam: any) => {
    setError(''); setSuccess('');
    if (reviewExam?.id === exam.id) { setReviewExam(null); return; }
    try {
      const result: any = await api.get(`/exams/teacher/${exam.id}/attempts`);
      setReviewExam(exam); setAttempts(result.attempts || []); setAttemptQuestions(result.questions || []);
      const scores: Record<string, string> = {}; const feedback: Record<string, string> = {};
      for (const attempt of result.attempts || []) {
        for (const [questionId, score] of Object.entries(attempt.manualScores || {})) {
          scores[`${attempt.id}:${questionId}`] = String((score as any).points ?? '');
          feedback[`${attempt.id}:${questionId}`] = String((score as any).feedback ?? '');
        }
      }
      setScoreInputs(scores); setFeedbackInputs(feedback);
    } catch (e: any) { setError(e.message || 'Could not load attempts.'); }
  };

  const grade = async (attempt: any) => {
    setError(''); setGradingId(attempt.id);
    const pending = attemptQuestions.filter(question => ['WRITING', 'SPEAKING'].includes(question.type) && String(attempt.answers?.[question.id] || '').trim());
    try {
      await api.post(`/exams/teacher/attempts/${attempt.id}/grade`, {
        scores: pending.map(question => ({
          questionId: question.id,
          points: Number(scoreInputs[`${attempt.id}:${question.id}`] || 0),
          feedback: feedbackInputs[`${attempt.id}:${question.id}`] || ''
        })),
        teacherFeedback: overallFeedback[attempt.id] || ''
      });
      await review(reviewExam);
      setSuccess(t('exam.graded'));
    } catch (e: any) { setError(e.message || 'Could not save the grade.'); }
    finally { setGradingId(''); }
  };

  const questionLabel = (key: string) => t(({ LISTENING: 'exam.listening', READING: 'exam.reading', WRITING: 'exam.writing', SPEAKING: 'exam.speaking', LANGUAGE_USE: 'exam.languageUse', MULTIPLE_CHOICE: 'exam.multipleChoice', SHORT_ANSWER: 'exam.shortAnswer' } as Record<string, string>)[key] || key);

  return (
    <main className="mx-auto min-w-0 max-w-6xl space-y-6 pb-16 sm:space-y-8">
      <header className="rounded-3xl bg-gradient-to-br from-[#132b49] to-[#285a73] p-6 text-white shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-3"><GraduationCap className="h-7 w-7" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">Goethe · telc · A1–B2</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{t('exam.teacherTitle')}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">{t('exam.teacherSubtitle')}</p></div>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{success}</p>}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-subtle sm:p-7">
        <div className="mb-5 flex items-center gap-3"><FilePlus2 className="h-5 w-5 text-rose-700" /><div><h2 className="font-bold text-navy">{t('exam.createHeading')}</h2><p className="text-xs text-dark-muted">{t('exam.formatNote')}</p></div></div>
        {batches.length === 0 ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{t('exam.assignBatch')}</p> : (
          <form onSubmit={createExam} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('exam.examTitle')} value={title} onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={160} />
              <label className="space-y-1.5"><span className="block text-xs font-semibold uppercase tracking-wider text-dark">{t('exam.description')}</span><input value={description} onChange={e => setDescription(e.target.value)} required minLength={5} maxLength={4000} className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></label>
              <label className="space-y-1.5"><span className="block text-xs font-semibold uppercase tracking-wider text-dark">{t('exam.batch')}</span><select value={batchId} onChange={e => setBatchId(e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm">{batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name} · {batch.level}</option>)}</select></label>
              <label className="space-y-1.5"><span className="block text-xs font-semibold uppercase tracking-wider text-dark">{t('exam.format')}</span><select value={format} onChange={e => setFormat(e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm"><option value="GOETHE">{t('exam.goethe')}</option><option value="TELC">{t('exam.telc')}</option></select></label>
              <label className="space-y-1.5"><span className="block text-xs font-semibold uppercase tracking-wider text-dark">{t('exam.level')}</span><select value={level} onChange={e => setLevel(e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm">{['A1','A2','B1','B2'].map(value => <option key={value}>{value}</option>)}</select></label>
              <Input label={t('exam.duration')} type="number" min={10} max={360} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} required />
              <Input label={t('exam.passPercent')} type="number" min={0} max={100} value={passPercent} onChange={e => setPassPercent(Number(e.target.value))} required />
              <Input label={t('exam.maxAttempts')} type="number" min={1} max={10} value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} required />
              <Input label={t('exam.opensAt')} type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)} />
              <Input label={t('exam.closesAt')} type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} />
              <label className="space-y-1.5"><span className="block text-xs font-semibold uppercase tracking-wider text-dark">{t('exam.status')}</span><select value={publication} onChange={e => setPublication(e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm"><option value="DRAFT">{t('exam.draft')}</option><option value="PUBLISHED">{t('exam.published')}</option></select></label>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-navy">{t('exam.questionBuilder')}</h3><Button type="button" size="sm" variant="outline" onClick={() => setQuestions(current => [...current, emptyQuestion()])}>+ {t('exam.addQuestion')}</Button></div>
              {questions.map((question, index) => <article key={question.id} className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-bold text-navy">{t('exam.question')} {index + 1}</h4>{questions.length > 1 && <button type="button" onClick={() => setQuestions(current => current.filter(item => item.id !== question.id))} className="text-xs font-semibold text-red-700">{t('exam.remove')}</button>}</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.section')}</span><select value={question.section} onChange={e => updateQuestion(question.id, { section: e.target.value })} className="h-10 w-full rounded-lg border bg-white px-2 text-sm">{['LISTENING','READING','WRITING','SPEAKING','LANGUAGE_USE'].map(key => <option key={key} value={key}>{questionLabel(key)}</option>)}</select></label>
                  <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.questionType')}</span><select value={question.type} onChange={e => updateQuestion(question.id, { type: e.target.value })} className="h-10 w-full rounded-lg border bg-white px-2 text-sm">{['MULTIPLE_CHOICE','SHORT_ANSWER','WRITING','SPEAKING'].map(key => <option key={key} value={key}>{questionLabel(key)}</option>)}</select></label>
                  <Input label={t('exam.points')} type="number" min={1} max={100} value={question.points} onChange={e => updateQuestion(question.id, { points: Number(e.target.value) })} required />
                </div>
                <label className="block space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.prompt')}</span><textarea value={question.prompt} onChange={e => updateQuestion(question.id, { prompt: e.target.value })} required minLength={2} maxLength={4000} rows={2} className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm" /></label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.type === 'MULTIPLE_CHOICE' && <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.options')}</span><textarea value={question.options} onChange={e => updateQuestion(question.id, { options: e.target.value })} rows={4} className="w-full rounded-xl border bg-white p-3 text-sm" required /></label>}
                  {['MULTIPLE_CHOICE','SHORT_ANSWER'].includes(question.type) && <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.answerKey')}</span><textarea value={question.answerKey} onChange={e => updateQuestion(question.id, { answerKey: e.target.value })} rows={4} className="w-full rounded-xl border bg-white p-3 text-sm" required={publication === 'PUBLISHED'} /></label>}
                  {question.section === 'READING' && <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.passage')}</span><textarea value={question.passage} onChange={e => updateQuestion(question.id, { passage: e.target.value })} rows={4} className="w-full rounded-xl border bg-white p-3 text-sm" /></label>}
                  {question.section === 'LISTENING' && <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.audioUrl')}</span><input type="url" value={question.audioUrl} onChange={e => updateQuestion(question.id, { audioUrl: e.target.value })} className="h-10 w-full rounded-lg border bg-white px-3 text-sm" placeholder="https://…" /></label>}
                  {['WRITING','SPEAKING'].includes(question.type) && <label className="space-y-1"><span className="text-[11px] font-semibold text-dark">{t('exam.rubric')}</span><textarea value={question.rubric} onChange={e => updateQuestion(question.id, { rubric: e.target.value })} rows={4} className="w-full rounded-xl border bg-white p-3 text-sm" /></label>}
                </div>
              </article>)}
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center"><p className="text-xs text-dark-muted">{t('exam.formatNote')}</p><Button type="submit" isLoading={saving} disabled={!batchId}>{publication === 'PUBLISHED' ? t('exam.createAndPublish') : t('exam.createButton')}</Button></div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-navy" /><h2 className="text-xl font-bold text-navy">{t('exam.title')}</h2></div>
        {loading ? <Skeleton className="h-44 w-full rounded-2xl" /> : exams.length === 0 ? <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-dark-muted">{t('exam.noTeacherExams')}</p> : <div className="grid gap-4 xl:grid-cols-2">{exams.map(exam => <article key={exam.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-subtle">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{exam.format} · {exam.level}</Badge><Badge variant={exam.status === 'PUBLISHED' ? 'default' : 'outline'}>{t(`exam.${String(exam.status).toLowerCase()}`)}</Badge></div><h3 className="mt-3 text-lg font-bold text-navy">{exam.title}</h3><p className="mt-1 text-sm text-dark-muted">{exam.batch.name} · {exam.questions.length} {t('exam.questionBuilder').toLowerCase()}</p></div><div className="flex items-center gap-1.5 text-xs font-semibold text-dark-muted"><Clock3 className="h-4 w-4" />{exam.durationMinutes} {t('exam.minutesShort')}</div></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4"><Button size="sm" variant="outline" onClick={() => review(exam)}>{t('exam.review')}</Button>{exam.status === 'DRAFT' && <Button size="sm" onClick={() => changeStatus(exam, 'PUBLISHED')}>{t('exam.published')}</Button>}{exam.status !== 'ARCHIVED' && <Button size="sm" variant="outline" onClick={() => changeStatus(exam, 'ARCHIVED')}>{t('exam.archived')}</Button>}<span className="ml-auto flex items-center gap-1 text-xs text-dark-muted"><CalendarClock className="h-3.5 w-3.5" />{exam._count.attempts} {t('exam.attempts').toLowerCase()}</span></div>
          {reviewExam?.id === exam.id && <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">{attempts.length === 0 ? <p className="text-sm text-dark-muted">{t('exam.noAttempts')}</p> : attempts.map(attempt => <div key={attempt.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold text-navy">{attempt.user.firstName} {attempt.user.lastName}</p><p className="text-xs text-dark-muted">{attempt.user.email} · {t('exam.attempt')} {attempt.attemptNumber}</p></div><Badge variant="outline">{t(attempt.status === 'IN_PROGRESS' ? 'exam.inProgress' : attempt.status === 'NEEDS_REVIEW' ? 'exam.needsReview' : 'exam.graded')}</Badge></div>
            {attempt.status !== 'IN_PROGRESS' && <><p className="mt-2 text-xs font-semibold text-dark-muted">{t('exam.score')}: {attempt.score ?? 0}/{attempt.maxScore}{attempt.percentage !== null ? ` · ${Math.round(attempt.percentage)}%` : ''}</p>
              {attempt.status === 'NEEDS_REVIEW' && <div className="mt-3 space-y-3">{attemptQuestions.filter(question => ['WRITING','SPEAKING'].includes(question.type) && String(attempt.answers?.[question.id] || '').trim()).map(question => <div key={question.id} className="rounded-lg border bg-white p-3"><p className="text-xs font-bold text-navy">{questionLabel(question.section)} · {question.points} pts</p><p className="mt-1 whitespace-pre-wrap text-sm">{attempt.answers[question.id]}</p>{question.rubric && <p className="mt-2 text-xs italic text-dark-muted">{question.rubric}</p>}<div className="mt-2 grid gap-2 sm:grid-cols-[100px_1fr]"><input type="number" min={0} max={question.points} value={scoreInputs[`${attempt.id}:${question.id}`] ?? ''} onChange={e => setScoreInputs(current => ({ ...current, [`${attempt.id}:${question.id}`]: e.target.value }))} aria-label={`${t('exam.score')} ${question.points}`} placeholder={`0–${question.points}`} className="h-10 rounded-lg border px-3 text-sm"/><input value={feedbackInputs[`${attempt.id}:${question.id}`] ?? ''} onChange={e => setFeedbackInputs(current => ({ ...current, [`${attempt.id}:${question.id}`]: e.target.value }))} aria-label={t('exam.teacherFeedback')} placeholder={t('exam.teacherFeedback')} className="h-10 min-w-0 rounded-lg border px-3 text-sm"/></div></div>)}<textarea value={overallFeedback[attempt.id] || ''} onChange={e => setOverallFeedback(current => ({ ...current, [attempt.id]: e.target.value }))} rows={2} placeholder={t('exam.teacherFeedback')} className="w-full rounded-lg border p-3 text-sm"/><Button size="sm" isLoading={gradingId === attempt.id} onClick={() => grade(attempt)}>{t('exam.saveGrade')}</Button></div>}
              {attempt.status === 'GRADED' && <p className="mt-2 rounded-lg bg-white p-3 text-sm text-dark-muted">{attempt.teacherFeedback || t(attempt.passed ? 'exam.passed' : 'exam.notPassed')}</p>}</>}
          </div>)}</div>}
        </article>)}</div>}
      </section>
    </main>
  );
}
