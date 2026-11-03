import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X, Bot, ExternalLink } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';

type Turn = { role: 'user' | 'model'; text: string };

export function HelpChatWidget() {
  const { isStudent, isTeacher } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Turn[]>([
    { role: 'model', text: 'Hi! I can guide you through DeutschWelt if you get stuck. What are you trying to do?' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  if (!isStudent && !isTeacher) return null;

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const result: any = await api.post('/ai/help-chat', { messages: next.slice(-10) });
      setMessages([...next, { role: 'model', text: result.reply }]);
    } catch (e: any) {
      setError(e.message || 'The help assistant is unavailable. Try the FAQ or contact the academy.');
    } finally { setBusy(false); }
  }

  return <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
    {open && <section aria-label="DeutschWelt help chat" className="flex h-[min(32rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[#e8e3d8] bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-[#14243a] px-4 py-3 text-white">
        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><Bot className="h-5 w-5" /></span><div><p className="text-sm font-bold">DeutschWelt Help</p><p className="text-[11px] text-white/70">Guidance for {isTeacher ? 'teachers' : 'students'}</p></div></div>
        <button type="button" aria-label="Close help chat" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfaf7] p-4" aria-live="polite">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">Don’t share passwords, verification links, or payment details here.</p>
        {messages.map((message, index) => <div key={index} className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'ml-auto bg-[#14243a] text-white' : 'mr-auto border border-slate-200 bg-white text-slate-800'}`}>{message.text}</div>)}
        {busy && <p className="text-xs text-slate-500">Thinking…</p>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}<div className="mt-2 flex gap-3 font-bold"><Link to="/faq" className="underline">FAQ</Link><Link to="/contact" className="underline">Contact support</Link></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500"><span>If staff need to fix it, send us the issue.</span><Link to="/contact" aria-label="Contact support" className="text-navy"><ExternalLink className="h-3.5 w-3.5" /></Link></div>
      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input aria-label="Ask the help assistant" value={input} onChange={event => setInput(event.target.value)} placeholder="Ask for help…" maxLength={700} className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#14243a]" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14243a] text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
      </form>
    </section>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? 'Close help chat' : 'Open help chat'} className="flex items-center gap-2 rounded-full bg-[#14243a] px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-[#243c5b]">
      {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}<span>{open ? 'Close help' : 'Need help?'}</span>
    </button>
  </div>;
}
