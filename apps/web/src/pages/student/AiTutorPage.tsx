import React, { useState } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Sparkles, Send, MessageCircle } from 'lucide-react';

export function AiTutorPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const response: any = await api.post('/ai/chat', { messages: next });
      setMessages([...next, { role: 'model', text: response.reply }]);
    } catch (requestError: any) {
      setError(requestError.message || 'Tutor is unavailable right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[min(72vh,760px)] w-full max-w-4xl flex-col gap-5 pb-8 sm:gap-6">
      <header className="rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-5 shadow-subtle sm:rounded-3xl sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-germanRed-700">A1–B2 practice</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">DeutschWelt AI tutor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dark-muted">Ask a grammar question or write in German for gentle corrections.</p>
          </div>
        </div>
      </header>

      <section aria-label="AI tutor conversation" aria-live="polite" className="flex min-h-[320px] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-subtle sm:min-h-[400px] sm:rounded-3xl sm:p-6">
        {messages.length === 0 && (
          <div className="m-auto max-w-md py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f4ec] text-[#687487]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-bold text-navy">Start a German learning conversation</p>
            <p className="mt-1 text-sm leading-relaxed text-dark-muted">Try: “Explain the difference between weil and denn.”</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={`${index}-${message.role}`} className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] ${message.role === 'user' ? 'ml-auto bg-forest-900 text-white' : 'border border-[#e8e3d8] bg-[#f7f6f2] text-navy'}`}>
            {message.text}
          </div>
        ))}
        {busy && (
          <div role="status" className="flex items-center gap-2 self-start rounded-2xl border border-[#e8e3d8] bg-[#f7f6f2] px-4 py-3 text-sm text-dark-muted">
            <span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700 [animation-delay:-.2s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700 [animation-delay:-.1s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700" /></span>
            Tutor is thinking…
          </div>
        )}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      <form onSubmit={send} className="flex items-end gap-2 rounded-2xl border border-[#e8e3d8] bg-[#fffefa] p-2 shadow-subtle sm:rounded-3xl sm:p-3">
        <label className="sr-only" htmlFor="ai-tutor-message">Message the tutor</label>
        <textarea id="ai-tutor-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={700} rows={1} placeholder="Write your question…" className="max-h-32 min-h-11 min-w-0 flex-1 resize-y rounded-xl border-0 bg-transparent px-3 py-3 text-sm text-navy placeholder:text-[#9299a2] focus:outline-none focus:ring-2 focus:ring-forest-700" />
        <Button type="submit" disabled={busy || !input.trim()} className="min-h-11 shrink-0 rounded-xl px-4">
          <Send className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
