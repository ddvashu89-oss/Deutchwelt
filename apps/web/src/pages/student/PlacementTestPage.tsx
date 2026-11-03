import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';

export function PlacementTestPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<any>('/student/placement-test').then((r) => setQuestions(r.questions || [])).catch((e) => setError(e.message));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r: any = await api.post('/student/placement-test', { answers });
      setResult(r.result);
      const p: any = await api.get('/student/learning-plan'); setPlan(p.plan);
    } catch (e: any) { setError(e.message || 'Could not submit your placement test.'); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto max-w-4xl space-y-6 pb-12">
    <header><p className="text-xs font-bold uppercase tracking-widest text-rose-700">Your German learning journey</p><h1 className="mt-2 text-3xl font-black text-slate-900">Placement test & learning plan</h1><p className="mt-2 text-slate-600">Answer the questions you know. Your recommended CEFR level will be saved to your profile.</p></header>
    {result && <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="text-xl font-bold">Recommended level: {result.recommendedLevel}</h2><p className="mt-1">Score: {result.score}/{result.maxScore}{result.persisted === false ? ' · Saved only for this session because MySQL is unavailable' : ''}</p>{plan && <div className="mt-5"><h3 className="font-bold">Your weekly plan</h3><p className="mt-1 text-sm">Recommended for {plan.level}, with a goal of {plan.weeklyGoalMinutes} minutes per week.</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{(plan.days || []).map((a: any, i: number) => <li key={i}><b>{a.day} · {a.focus}:</b> {a.activity} ({a.minutes} min)</li>)}</ul></div>}<Link className="mt-4 inline-block font-semibold underline" to="/student/courses">Explore courses</Link></section>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={submit} className="space-y-4">{questions.map((q, idx) => <fieldset key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5"><legend className="px-1 font-bold text-slate-900">{idx + 1}. {q.prompt || q.question}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{(q.options || []).map((option: any, i: number) => { const value = typeof option === 'string' ? option : option.value ?? String.fromCharCode(65 + i); const label = typeof option === 'string' ? option : option.label ?? option.text ?? value; return <label key={value} className="flex cursor-pointer gap-2 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50"><input type="radio" name={q.id} value={value} checked={answers[q.id] === value} onChange={() => setAnswers({ ...answers, [q.id]: value })}/>{label}</label>; })}</div></fieldset>)}<Button disabled={busy || questions.length === 0}>{busy ? 'Checking…' : 'Submit placement test'}</Button></form>
  </main>;
}
