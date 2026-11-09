import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, GraduationCap, Headphones, Play, Send } from 'lucide-react';

function remainingTime(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
}
function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function StudentExamsPage() {
  const { t } = useLanguage();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any | null>(null);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [readyExam, setReadyExam] = useState<any | null>(null);
  const submittingRef = useRef(false);

  const loadExams = useCallback(async () => {
    try { setLoading(true); const response: any = await api.get('/exams'); setExams(response.exams || []); }
    catch (e: any) { setError(e.message || 'Could not load exams.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const questions: any[] = activeExam?.questions || [];
  const sections = useMemo(() => [...new Set(questions.map(question => question.section))], [questions]);
  const question = questions[currentQuestion];
  const questionLabel = (key: string) => t(({ LISTENING: 'exam.listening', READING: 'exam.reading', WRITING: 'exam.writing', SPEAKING: 'exam.speaking', LANGUAGE_USE: 'exam.languageUse', MULTIPLE_CHOICE: 'exam.multipleChoice', SHORT_ANSWER: 'exam.shortAnswer' } as Record<string, string>)[key] || key);

  const openAttempt = async (attemptId: string) => {
    try {
      setError('');
      const data: any = await api.get(`/exams/attempts/${attemptId}`);
      setAttempt(data.attempt); setActiveExam(data.attempt.status === 'IN_PROGRESS' ? data.exam : null); setAnswers(data.attempt.answers || {});
      setCurrentQuestion(0); setSecondsLeft(remainingTime(data.attempt.expiresAt)); setResult(data.attempt.status === 'IN_PROGRESS' ? null : data.attempt);
      if (data.attempt.status !== 'IN_PROGRESS') await loadExams();
    } catch (e: any) { setError(e.message || 'Could not open this exam attempt.'); await loadExams(); }
  };

  const beginExam = async (exam: any) => {
    try {
      setError('');
      const data: any = await api.post(`/exams/${exam.id}/start`);
      await openAttempt(data.attempt.id);
    } catch (e: any) { setError(e.message || 'Could not start this exam.'); await loadExams(); }
  };

  const submitExam = useCallback(async (auto = false) => {
    if (!attempt || submittingRef.current) return;
    submittingRef.current = true; setSubmitting(true); setError('');
    try {
      setSaving(true);
      await api.put(`/exams/attempts/${attempt.id}/answers`, { answers });
      setSaving(false);
      const data: any = await api.post(`/exams/attempts/${attempt.id}/submit`);
      setAttempt(data.attempt); setResult(data.attempt); setActiveExam(null);
      if (auto) setError('');
      await loadExams();
    } catch (e: any) {
      setError(e.message || 'Could not submit the exam.');
      if (e.statusCode === 409) {
        try { const latest: any = await api.get(`/exams/attempts/${attempt.id}`); setAttempt(latest.attempt); if (latest.attempt.status !== 'IN_PROGRESS') { setResult(latest.attempt); setActiveExam(null); await loadExams(); return; } } catch { /* Preserve the initial error. */ }
      }
    } finally { setSaving(false); setSubmitting(false); submittingRef.current = false; }
  }, [attempt, answers, loadExams, t]);

  useEffect(() => {
    if (!attempt || !activeExam) return;
    const timer = window.setInterval(() => {
      const left = remainingTime(attempt.expiresAt);
      setSecondsLeft(left);
      if (left === 0) void submitExam(true);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, activeExam, submitExam]);

  useEffect(() => {
    if (!attempt || !activeExam || submitting) return;
    const timer = window.setTimeout(async () => {
      setSaving(true);
      try { await api.put(`/exams/attempts/${attempt.id}/answers`, { answers }); setSaved(true); }
      catch (e: any) { setError(e.message || 'Could not save your answers.'); setSaved(false); }
      finally { setSaving(false); }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [answers, attempt, activeExam, submitting]);

  const changeAnswer = (questionId: string, value: string) => { setSaved(false); setAnswers(current => ({ ...current, [questionId]: value })); };

  if (loading && !activeExam && !result) return <Skeleton className="h-96 w-full rounded-3xl" />;

  if (activeExam && attempt && attempt.status === 'IN_PROGRESS') {
    const groupCount = questions.filter(item => item.section === question?.section).length;
    const groupPosition = questions.slice(0, currentQuestion + 1).filter(item => item.section === question?.section).length;
    return <main className="mx-auto max-w-5xl space-y-5 pb-16">
      <header className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-[#f7f6f2]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:p-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-rose-700">{activeExam.format} · {activeExam.level} · {questionLabel(question?.section || '')}</p><h1 className="mt-0.5 text-base font-bold text-navy sm:text-lg">{activeExam.title}</h1></div>
        <div role="timer" aria-live="off" className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-lg font-black tabular-nums ${secondsLeft <= 300 ? 'bg-red-100 text-red-800' : 'bg-navy text-white'}`}><AlarmClock className="h-4 w-4" />{formatTime(secondsLeft)}</div>
      </header>
      {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-dark-muted"><p>{t('exam.saveStatus')} · {saving ? '…' : saved ? '✓' : '…'}</p><p>{t('exam.section')}: {groupPosition} {t('exam.of')} {groupCount}</p></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <section className="min-w-0 rounded-3xl border border-gray-200 bg-white p-5 shadow-subtle sm:p-8">
          {question?.passage && <div className="mb-6 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-gray-800">{question.passage}</div>}
          {question?.audioUrl && <div className="mb-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4"><Headphones className="h-5 w-5 shrink-0 text-blue-800"/><audio controls preload="none" src={question.audioUrl} className="w-full" /></div>}
          <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline">{questionLabel(question?.section)}</Badge><Badge variant="secondary">{question?.points} {t('exam.points').toLowerCase()}</Badge><span className="ml-auto text-xs font-semibold text-dark-muted">{t('exam.question')} {currentQuestion + 1} / {questions.length}</span></div>
          <h2 className="text-xl font-bold leading-snug text-navy sm:text-2xl">{question?.prompt}</h2>
          {question?.instructions && <p className="mt-3 whitespace-pre-wrap text-sm text-dark-muted">{question.instructions}</p>}
          <div className="mt-6">
            {question?.type === 'MULTIPLE_CHOICE' ? <div role="radiogroup" aria-label={question.prompt} className="grid gap-3">{(question.options || []).map((option: string, index: number) => <label key={`${index}-${option}`} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${answers[question.id] === option ? 'border-navy bg-blue-50 ring-1 ring-navy' : 'border-gray-200 hover:bg-gray-50'}`}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => changeAnswer(question.id, option)} className="mt-0.5 h-4 w-4 accent-[#14243a]"/><span className="font-semibold">{String.fromCharCode(65 + index)}.</span><span className="min-w-0 flex-1">{option}</span></label>)}</div> : <div className="space-y-2"><label htmlFor="exam-response" className="text-xs font-bold uppercase tracking-wider text-dark-muted">{questionLabel(question?.type)}</label><textarea id="exam-response" value={answers[question?.id] || ''} onChange={event => changeAnswer(question.id, event.target.value)} maxLength={12000} rows={question?.type === 'WRITING' || question?.type === 'SPEAKING' ? 12 : 3} placeholder={question?.type === 'SPEAKING' ? t('exam.speakingTranscript') : ''} className="w-full rounded-2xl border border-gray-300 p-4 text-base leading-relaxed outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"/><p className="text-right text-[11px] text-gray-400">{(answers[question?.id] || '').length}/12000</p></div>}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5"><Button type="button" variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(index => Math.max(0, index - 1))}><ArrowLeft className="mr-1 h-4 w-4"/>{t('exam.previous')}</Button>{currentQuestion < questions.length - 1 ? <Button type="button" onClick={() => setCurrentQuestion(index => Math.min(questions.length - 1, index + 1))}>{t('exam.next')}<ArrowRight className="ml-1 h-4 w-4"/></Button> : <Button type="button" variant="danger" isLoading={submitting} onClick={() => { if (window.confirm(t('exam.closeConfirm'))) void submitExam(); }}><Send className="mr-1 h-4 w-4"/>{t('exam.submit')}</Button>}</div>
        </section>
        <aside className="space-y-3"><div className="rounded-2xl border border-gray-200 bg-white p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-dark-muted">{t('exam.question')} {currentQuestion + 1}/{questions.length}</p><div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-4">{questions.map((item, index) => <button type="button" key={item.id} onClick={() => setCurrentQuestion(index)} aria-label={`${t('exam.question')} ${index + 1}`} className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold ${index === currentQuestion ? 'bg-navy text-white' : answers[item.id] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{index + 1}</button>)}</div><p className="mt-3 text-[11px] text-dark-muted">{t('exam.saveStatus')}.</p></div><Button type="button" variant="danger" className="w-full" isLoading={submitting} onClick={() => { if (window.confirm(t('exam.closeConfirm'))) void submitExam(); }}>{t('exam.submit')}</Button></aside>
      </div>
    </main>;
  }

  if (readyExam) return <main className="mx-auto max-w-3xl space-y-5 pb-16">
    <button type="button" onClick={() => setReadyExam(null)} className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:underline"><ArrowLeft className="h-4 w-4"/>{t('exam.cancelStart')}</button>
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-subtle">
      <div className="bg-gradient-to-br from-[#132b49] to-[#285a73] p-6 text-white sm:p-8"><Badge variant="outlineWhite">{readyExam.format} · {readyExam.level}</Badge><h1 className="mt-3 text-2xl font-black sm:text-3xl">{readyExam.title}</h1><p className="mt-2 text-sm leading-relaxed text-white/80">{readyExam.batch.name}</p></div>
      <div className="space-y-5 p-5 sm:p-8"><div><h2 className="text-lg font-bold text-navy">{t('exam.readyTitle')}</h2><p className="mt-1 text-sm text-dark-muted">{t('exam.readyDescription')}</p></div><p className="whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{readyExam.description}</p><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-3"><Clock3 className="h-4 w-4 text-navy"/><p className="mt-2 text-xs text-dark-muted">{t('exam.duration')}</p><p className="font-bold text-navy">{readyExam.durationMinutes} {t('exam.minutesShort')}</p></div><div className="rounded-xl border p-3"><ClipboardCheck className="h-4 w-4 text-navy"/><p className="mt-2 text-xs text-dark-muted">{t('exam.questionBuilder')}</p><p className="font-bold text-navy">{readyExam.questionCount}</p></div><div className="rounded-xl border p-3"><GraduationCap className="h-4 w-4 text-navy"/><p className="mt-2 text-xs text-dark-muted">{t('exam.maxAttempts')}</p><p className="font-bold text-navy">{readyExam.maxAttempts - readyExam.attemptsUsed} {t('exam.of')} {readyExam.maxAttempts}</p></div></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"><p className="font-bold">{t('exam.startNotice')}</p><p className="mt-1">{t('exam.rulesDetails')}</p></div><div className="flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row sm:items-center"><Button type="button" variant="outline" onClick={() => setReadyExam(null)}>{t('exam.cancelStart')}</Button><Button type="button" onClick={() => { const examToStart = readyExam; setReadyExam(null); void beginExam(examToStart); }}><Play className="mr-2 h-4 w-4"/>{t('exam.beginNow')}</Button></div></div>
    </section>
  </main>;

  return <main className="mx-auto max-w-5xl space-y-6 pb-16 sm:space-y-8">
    <header className="rounded-3xl bg-gradient-to-br from-[#132b49] to-[#285a73] p-6 text-white shadow-card sm:p-8"><div className="flex items-start gap-4"><div className="rounded-2xl bg-white/10 p-3"><GraduationCap className="h-7 w-7"/></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">A1–B2 · Goethe · telc</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{t('exam.title')}</h1><p className="mt-2 text-sm text-white/80">{t('exam.subtitle')}</p></div></div></header>
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {result && <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-subtle"><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-700"/><div><h2 className="font-bold text-navy">{result.status === 'NEEDS_REVIEW' ? t('exam.needsReview') : t('exam.graded')}</h2>{result.status === 'GRADED' && <p className="text-sm text-dark-muted">{t('exam.score')}: {result.score}/{result.maxScore} · {Math.round(result.percentage || 0)}% · {t(result.passed ? 'exam.passed' : 'exam.notPassed')}</p>}</div></div></section>}
    {loading ? <Skeleton className="h-64 w-full rounded-3xl"/> : exams.length === 0 ? <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-gray-300"/><p className="mt-3 text-sm text-dark-muted">{t('exam.noExams')}</p></div> : <div className="grid gap-4 lg:grid-cols-2">{exams.map(exam => {
      const last = exam.latestAttempt; const canResume = last?.status === 'IN_PROGRESS'; const isGraded = last?.status === 'GRADED';
      return <article key={exam.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-subtle sm:p-6"><div className="flex flex-wrap items-start justify-between gap-2"><Badge variant="outline">{exam.format} · {exam.level}</Badge>{isGraded ? <Badge variant={last.passed ? 'success' : 'warning'}>{t(last.passed ? 'exam.passed' : 'exam.notPassed')}</Badge> : last?.status === 'NEEDS_REVIEW' ? <Badge variant="warning">{t('exam.needsReview')}</Badge> : null}</div><h2 className="mt-3 text-xl font-bold text-navy">{exam.title}</h2><p className="mt-1 text-sm text-dark-muted">{exam.batch.name}</p><p className="mt-3 text-sm leading-relaxed text-gray-600">{exam.description}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-dark-muted"><span className="flex items-center gap-1"><Clock3 className="h-4 w-4"/>{exam.durationMinutes} {t('exam.minutesShort')}</span><span>{exam.questionCount} {t('exam.questionBuilder').toLowerCase()}</span><span>{exam.maxAttempts} {t('exam.maxAttempts').toLowerCase()}</span>{exam.closesAt && <span>{t('exam.availableUntil')} {new Date(exam.closesAt).toLocaleString()}</span>}</div>{last?.status === 'GRADED' && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm font-bold text-navy">{t('exam.score')}: {last.percentage === null ? '—' : `${Math.round(last.percentage)}%`}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">{last && <span className="text-xs text-dark-muted">{canResume ? t('exam.inProgress') : isGraded ? t('exam.graded') : last.status === 'NEEDS_REVIEW' ? t('exam.needsReview') : t('exam.notStarted')} · {last.attemptNumber}/{exam.maxAttempts}</span>}<Button className="ml-auto" disabled={!exam.available && !canResume || !canResume && exam.attemptsUsed >= exam.maxAttempts} onClick={() => canResume ? openAttempt(last.id) : setReadyExam(exam)}>{canResume ? <><ArrowRight className="mr-1 h-4 w-4"/>{t('exam.resume')}</> : exam.attemptsUsed >= exam.maxAttempts ? t('exam.attemptsComplete') : <><Play className="mr-1 h-4 w-4"/>{t('exam.start')}</>}</Button></div>
      </article>;
    })}</div>}
    {!activeExam && !result && <p className="flex items-center gap-2 text-xs text-dark-muted"><AlarmClock className="h-4 w-4"/>{t('exam.startNotice')}</p>}
  </main>;
}
