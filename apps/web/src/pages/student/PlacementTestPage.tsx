import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';

export function PlacementTestPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/student/placement-test')
      .then((response) => setQuestions(response.questions || []))
      .catch((requestError) => setError(requestError.message || 'Could not load the placement test.'))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response: any = await api.post('/student/placement-test', { answers });
      setResult(response.result);
      const learningPlan: any = await api.get('/student/learning-plan');
      setPlan(learningPlan.plan);
    } catch (requestError: any) {
      setError(requestError.message || 'Could not submit your placement test.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-10 sm:space-y-6 sm:pb-12">
      <header className="rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-5 shadow-subtle sm:rounded-3xl sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-germanRed-700">Your German learning journey</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Placement test & learning plan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dark-muted">Answer the questions you know. Your recommended CEFR level will be saved to your profile.</p>
          </div>
        </div>
      </header>

      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-emerald-950 sm:text-xl">Recommended level: {result.recommendedLevel}</h2>
              <p className="mt-1 text-sm text-emerald-900">Score: {result.score}/{result.maxScore}{result.persisted === false ? ' · Saved only for this session because MySQL is unavailable' : ''}</p>
            </div>
          </div>
          {plan && (
            <div className="mt-5 border-t border-emerald-200 pt-4">
              <h3 className="font-bold text-emerald-950">Your weekly plan</h3>
              <p className="mt-1 text-sm text-emerald-900">Recommended for {plan.level}, with a goal of {plan.weeklyGoalMinutes} minutes per week.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {(plan.days || []).map((day: any, index: number) => (
                  <li key={index} className="rounded-xl border border-emerald-200/80 bg-white/70 p-3 text-sm text-emerald-950"><b>{day.day} · {day.focus}:</b> {day.activity} ({day.minutes} min)</li>
                ))}
              </ul>
            </div>
          )}
          <Link className="mt-4 inline-flex min-h-10 items-center font-semibold text-forest-800 underline underline-offset-4" to="/student/courses">Explore courses</Link>
        </section>
      )}

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <section role="status" aria-live="polite" aria-busy="true" className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-dark-muted"><Loader2 className="h-4 w-4 animate-spin text-forest-700" aria-hidden="true" />Loading your placement questions…</div>
          {[1, 2, 3].map((item) => <div key={item} className="rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-5"><Skeleton className="h-5 w-3/4" /><div className="mt-4 grid gap-2 sm:grid-cols-2"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div></div>)}
        </section>
      ) : (
        questions.length === 0 ? (
          <section className="rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-6 text-center shadow-subtle sm:rounded-3xl sm:p-8">
            <GraduationCap className="mx-auto h-8 w-8 text-dark-muted" aria-hidden="true" />
            <h2 className="mt-3 font-bold text-navy">No placement questions are available yet</h2>
            <p className="mt-1 text-sm text-dark-muted">Please check back later or contact your teacher.</p>
          </section>
        ) : <form onSubmit={submit} className="space-y-4">
          {questions.map((question, index) => (
            <fieldset key={question.id} className="min-w-0 rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle sm:rounded-3xl sm:p-6">
              <legend className="max-w-full px-1 text-sm font-bold leading-relaxed text-navy sm:text-base">{index + 1}. {question.prompt || question.question}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(question.options || []).map((option: any, optionIndex: number) => {
                  const value = typeof option === 'string' ? option : option.value ?? String.fromCharCode(65 + optionIndex);
                  const label = typeof option === 'string' ? option : option.label ?? option.text ?? value;
                  const selected = answers[question.id] === value;
                  return (
                    <label key={value} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${selected ? 'border-forest-700 bg-forest-50 text-forest-950 ring-1 ring-forest-700/20' : 'border-[#e8e3d8] bg-white text-navy hover:border-forest-300 hover:bg-[#f7f6f2]'}`}>
                      <input type="radio" name={question.id} value={value} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} className="mt-0.5 h-4 w-4 shrink-0 accent-[#144e3d]" />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-5">
            <p className="text-sm text-dark-muted">{Object.keys(answers).length} of {questions.length} answered</p>
            <Button type="submit" disabled={busy || questions.length === 0} isLoading={busy} className="min-h-11 w-full sm:w-auto">{busy ? 'Checking…' : 'Submit placement test'}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
