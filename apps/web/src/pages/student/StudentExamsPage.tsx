import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, GraduationCap, Headphones, Play, Send, ShieldCheck } from 'lucide-react';

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
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [timeExpiredNotice, setTimeExpiredNotice] = useState(false);
  const submittingRef = useRef(false);
  const expiredRef = useRef(false);

  const loadExams = useCallback(async () => {
    try { setLoading(true); const response: any = await api.get('/exams'); setExams(response.exams || []); }
    catch (e: any) { setError(e.message || 'Could not load exams.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const questions: any[] = activeExam?.questions || [];
  const sections = useMemo(() => {
    const grouped = new Map<string, number[]>();
    questions.forEach((item, index) => {
      const key = `${item.section}::${item.part || ''}`;
      const indexes = grouped.get(key) || [];
      indexes.push(index);
      grouped.set(key, indexes);
    });
    return [...grouped.entries()].map(([groupKey, indexes]) => ({ key: questions[indexes[0]]?.section || groupKey, part: questions[indexes[0]]?.part || '', indexes }));
  }, [questions]);
  const question = questions[currentQuestion];
  const currentSectionIndex = Math.max(0, sections.findIndex(section => section.indexes.includes(currentQuestion)));
  const currentSection = sections[currentSectionIndex];
  const isAnswered = (questionId: string) => String(answers[questionId] ?? '').trim().length > 0;
  const answeredCount = questions.filter(item => isAnswered(item.id)).length;
  const unansweredCount = questions.length - answeredCount;
  const questionLabel = (key: string) => t(({ LISTENING: 'exam.listening', READING: 'exam.reading', WRITING: 'exam.writing', SPEAKING: 'exam.speaking', LANGUAGE_USE: 'exam.languageUse', MULTIPLE_CHOICE: 'exam.multipleChoice', SHORT_ANSWER: 'exam.shortAnswer' } as Record<string, string>)[key] || key);
  const writingWords = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;

  const openAttempt = async (attemptId: string) => {
    try {
      setError('');
      const data: any = await api.get(`/exams/attempts/${attemptId}`);
      setAttempt(data.attempt); setActiveExam(data.attempt.status === 'IN_PROGRESS' ? data.exam : null); setAnswers(data.attempt.answers || {});
      const restoredQuestions: any[] = data.exam?.questions || [];
      const restoredAnswers: Record<string, string> = data.attempt.answers || {};
      const firstUnanswered = restoredQuestions.findIndex(item => !String(restoredAnswers[item.id] ?? '').trim());
      setCurrentQuestion(firstUnanswered >= 0 ? firstUnanswered : 0); setSecondsLeft(remainingTime(data.attempt.expiresAt)); setResult(data.attempt.status === 'IN_PROGRESS' ? null : data.attempt);
      setTimeExpiredNotice(false); expiredRef.current = false;
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
    submittingRef.current = true; setSubmitting(true); setError(''); setConfirmSubmit(false);
    try {
      if (!auto) {
        setSaving(true);
        await api.put(`/exams/attempts/${attempt.id}/answers`, { answers });
        setSaving(false);
      }
      const data: any = await api.post(`/exams/attempts/${attempt.id}/submit`);
      setAttempt(data.attempt); setResult(data.attempt); setActiveExam(null);
      await loadExams();
    } catch (e: any) {
      setError(e.message || 'Could not submit the exam.');
      if (e.statusCode === 409) {
        try { const latest: any = await api.get(`/exams/attempts/${attempt.id}`); setAttempt(latest.attempt); if (latest.attempt.status !== 'IN_PROGRESS') { setResult(latest.attempt); setActiveExam(null); await loadExams(); return; } } catch { /* Preserve the initial error. */ }
      }
    } finally { setSaving(false); setSubmitting(false); submittingRef.current = false; }
  }, [attempt, answers, loadExams]);

  useEffect(() => {
    if (!attempt || !activeExam) return;
    const timer = window.setInterval(() => {
      const left = remainingTime(attempt.expiresAt);
      setSecondsLeft(left);
      if (left === 0 && !expiredRef.current) { expiredRef.current = true; setTimeExpiredNotice(true); void submitExam(true); }
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
    const sectionQuestionIndexes = currentSection?.indexes || [];
    const sectionPosition = sectionQuestionIndexes.indexOf(currentQuestion);
    const sectionAnswered = sectionQuestionIndexes.filter(index => isAnswered(questions[index].id)).length;
    const saveLabel = saving ? t('exam.saving') : saved ? t('exam.saved') : t('exam.unsaved');
    const openQuestion = (index: number) => { setCurrentQuestion(index); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const requestSubmit = () => setConfirmSubmit(true);
    return <main className="mx-auto max-w-7xl space-y-4 pb-16 sm:space-y-5">
      <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#10243b] px-4 py-3 text-white shadow-lg sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/60">{activeExam.format} · {activeExam.level} · {questionLabel(question?.section || '')}</p><h1 className="truncate text-sm font-bold sm:text-base">{activeExam.title}</h1></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-white/75 sm:inline-flex"><ShieldCheck className="h-4 w-4" />{saveLabel}</span>
            <div role="timer" aria-label={`${t('exam.timeRemaining')}: ${formatTime(secondsLeft)}`} aria-live="off" className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-lg font-black tabular-nums ${secondsLeft <= 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}><AlarmClock className="h-4 w-4" />{formatTime(secondsLeft)}</div>
            <Button type="button" size="sm" variant="danger" isLoading={submitting} onClick={requestSubmit}><Send className="mr-1 h-4 w-4" /><span className="hidden sm:inline">{t('exam.submit')}</span><span className="sm:hidden">{t('exam.submitShort')}</span></Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${questions.length ? answeredCount / questions.length * 100 : 0}%` }} /></div><span className="shrink-0 text-[11px] font-semibold text-white/75">{answeredCount}/{questions.length} {t('exam.answered')}</span><span className="text-[11px] text-white/60 sm:hidden">{saveLabel}</span></div>
      </header>
      {(error || timeExpiredNotice) && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{timeExpiredNotice ? t('exam.timeExpired') : error}</p>}
      <nav aria-label={t('exam.examSections')} className="-mx-4 flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 sm:mx-0 sm:rounded-2xl sm:border sm:p-2">
        {sections.map((section, index) => {
          const count = section.indexes.filter(questionIndex => isAnswered(questions[questionIndex].id)).length;
          const active = index === currentSectionIndex;
          return <button key={`${section.key}:${section.part}`} type="button" aria-current={active ? 'step' : undefined} onClick={() => openQuestion(section.indexes[0])} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition ${active ? 'bg-[#10243b] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${active ? 'bg-white/15' : count === section.indexes.length ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{index + 1}</span><span className="text-xs font-bold sm:text-sm">{questionLabel(section.key)}{section.part ? ` · ${t('exam.part')} ${section.part}` : ''}</span><span className={`text-[10px] ${active ? 'text-white/70' : 'text-gray-400'}`}>{count}/{section.indexes.length}</span></button>;
        })}
      </nav>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-subtle">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-[#fbfaf7] px-5 py-4 sm:px-7"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-700">{questionLabel(question?.section || '')}{currentSection?.part ? ` · ${t('exam.part')} ${currentSection.part}` : ''}</p><p className="mt-1 text-xs text-dark-muted">{t('exam.question')} {sectionPosition + 1} {t('exam.of')} {sectionQuestionIndexes.length} · {sectionAnswered} {t('exam.answered')}</p></div><span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-600">{question?.points} {t('exam.points').toLowerCase()}</span></div>
          <div className="p-5 sm:p-8">
          {question?.passage && <div className="mb-6 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-gray-800">{question.passage}</div>}
          {question?.audioUrl && <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-blue-900"><Headphones className="h-4 w-4" />{t('exam.listening')}</div><audio controls preload="none" src={question.audioUrl} className="w-full" /></div>}
          <h2 className="text-xl font-bold leading-snug text-navy sm:text-2xl">{question?.prompt}</h2>
          {question?.instructions && <p className="mt-3 whitespace-pre-wrap text-sm text-dark-muted">{question.instructions}</p>}
          <div className="mt-6">
            {question?.type === 'MULTIPLE_CHOICE' ? <div role="radiogroup" aria-label={question.prompt} className="grid gap-3">{(question.options || []).map((option: string, index: number) => <label key={`${index}-${option}`} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${answers[question.id] === option ? 'border-navy bg-blue-50 ring-1 ring-navy' : 'border-gray-200 hover:bg-gray-50'}`}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => changeAnswer(question.id, option)} className="mt-0.5 h-4 w-4 accent-[#14243a]"/><span className="font-semibold">{String.fromCharCode(65 + index)}.</span><span className="min-w-0 flex-1">{option}</span></label>)}</div> : <div className="space-y-2"><label htmlFor="exam-response" className="text-xs font-bold uppercase tracking-wider text-dark-muted">{questionLabel(question?.type)}</label><textarea id="exam-response" value={answers[question?.id] || ''} onChange={event => changeAnswer(question.id, event.target.value)} maxLength={12000} rows={question?.type === 'WRITING' || question?.type === 'SPEAKING' ? 12 : 3} placeholder={question?.type === 'SPEAKING' ? t('exam.speakingTranscript') : ''} className="w-full rounded-2xl border border-gray-300 p-4 text-base leading-relaxed outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"/><div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">{['WRITING','SPEAKING'].includes(question?.type) && <div className="flex items-center gap-1" aria-label={t('exam.germanCharacters')}>{['ä','ö','ü','Ä','Ö','Ü','ß'].map(character => <button type="button" key={character} onClick={() => { const input = document.getElementById('exam-response') as HTMLTextAreaElement | null; const value = answers[question.id] || ''; const start = input?.selectionStart ?? value.length; const end = input?.selectionEnd ?? value.length; changeAnswer(question.id, `${value.slice(0,start)}${character}${value.slice(end)}`); requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + 1, start + 1); }); }} className="rounded border px-2 py-1 font-bold hover:bg-gray-100">{character}</button>)}</div>}<p className="ml-auto">{question?.type === 'WRITING' ? `${writingWords(answers[question.id] || '')} ${t('exam.words')}` : `${(answers[question?.id] || '').length}/12000`}</p></div></div>}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5"><Button type="button" variant="outline" disabled={sectionPosition <= 0} onClick={() => openQuestion(sectionQuestionIndexes[Math.max(0, sectionPosition - 1)])}><ArrowLeft className="mr-1 h-4 w-4"/>{t('exam.previous')}</Button>{sectionPosition < sectionQuestionIndexes.length - 1 ? <Button type="button" onClick={() => openQuestion(sectionQuestionIndexes[sectionPosition + 1])}>{t('exam.next')}<ArrowRight className="ml-1 h-4 w-4"/></Button> : currentSectionIndex < sections.length - 1 ? <Button type="button" onClick={() => openQuestion(sections[currentSectionIndex + 1].indexes[0])}>{t('exam.nextSection')}<ArrowRight className="ml-1 h-4 w-4"/></Button> : <Button type="button" variant="danger" isLoading={submitting} onClick={requestSubmit}><Send className="mr-1 h-4 w-4"/>{t('exam.reviewSubmit')}</Button>}</div>
          </div>
        </section>
        <aside className="space-y-3 lg:sticky lg:top-32"><div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">{t('exam.sectionQuestions')}</p><p className="mt-0.5 text-sm font-bold text-navy">{questionLabel(currentSection?.key || '')}</p></div><span className="text-xs font-bold text-dark-muted">{sectionAnswered}/{sectionQuestionIndexes.length}</span></div><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">{sectionQuestionIndexes.map((index, localIndex) => { const item = questions[index]; const answered = isAnswered(item.id); return <button type="button" key={item.id} onClick={() => openQuestion(index)} aria-label={`${t('exam.question')} ${localIndex + 1}${answered ? `, ${t('exam.answered')}` : `, ${t('exam.unanswered')}`}`} aria-current={index === currentQuestion ? 'true' : undefined} className={`flex aspect-square min-h-10 items-center justify-center rounded-xl text-xs font-black transition ${index === currentQuestion ? 'bg-navy text-white ring-2 ring-navy ring-offset-2' : answered ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{localIndex + 1}</button>; })}</div><div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-dark-muted"><span>● {t('exam.answered')}</span><span>○ {t('exam.unanswered')}</span></div></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-dark-muted"><p className="font-bold text-navy">{saveLabel}</p><p className="mt-1">{t('exam.rulesDetails')}</p></div>
          <Button type="button" variant="danger" className="w-full" isLoading={submitting} onClick={requestSubmit}><Send className="mr-2 h-4 w-4" />{t('exam.submit')}</Button>
        </aside>
      </div>
      {confirmSubmit && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1726]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmSubmit(false); }}><section role="dialog" aria-modal="true" aria-labelledby="exam-submit-title" className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 sm:mx-0"><ClipboardCheck className="h-6 w-6" /></div><h2 id="exam-submit-title" className="text-xl font-black text-navy">{t('exam.submitConfirmTitle')}</h2><p className="mt-2 text-sm leading-relaxed text-dark-muted">{unansweredCount ? t('exam.submitUnanswered').replace('{count}', String(unansweredCount)) : t('exam.submitConfirmBody')}</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setConfirmSubmit(false)}>{t('exam.continueExam')}</Button><Button type="button" variant="danger" isLoading={submitting} onClick={() => void submitExam()}><Send className="mr-2 h-4 w-4" />{t('exam.submit')}</Button></div></section></div>}
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
