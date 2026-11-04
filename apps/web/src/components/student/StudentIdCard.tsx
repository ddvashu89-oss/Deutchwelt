import React, { useState } from 'react';
import { Check, Copy, Fingerprint } from 'lucide-react';
import { getStudentCode } from '../../lib/studentId.js';

export function StudentIdCard({ userId, compact = false }: { userId?: string | null; compact?: boolean }) {
  const studentCode = getStudentCode(userId);
  const [copied, setCopied] = useState(false);
  const copyCode = async () => {
    if (!studentCode || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(studentCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-label="Student identification"
      className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#dce8e1] bg-gradient-to-r from-white to-[#f3f8f5] ${compact ? 'px-4 py-3' : 'p-4 sm:px-5'}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-mint shadow-sm">
          <Fingerprint className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Your student ID</p>
          <p className="mt-0.5 truncate font-mono text-sm font-extrabold tracking-wide text-forest-900" aria-live="polite">
            {studentCode || 'ID unavailable'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={copyCode}
        disabled={!studentCode}
        aria-label={copied ? 'Student ID copied' : 'Copy student ID'}
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[#dce8e1] bg-white px-3 text-xs font-bold text-forest-900 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy ID'}</span>
      </button>
    </section>
  );
}
