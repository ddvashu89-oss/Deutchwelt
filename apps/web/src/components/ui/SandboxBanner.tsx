import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Sparkles, RotateCcw, ShieldCheck, Beaker, Check, X } from 'lucide-react';

export function SandboxBanner() {
  const [envInfo, setEnvInfo] = useState<{
    environment?: string;
    isSandbox?: boolean;
    secure?: boolean;
  } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/system/environment')
      .then((res: any) => {
        if (mounted && res) {
          setEnvInfo(res);
        }
      })
      .catch(() => {
        // Do not label an unreachable production API as a sandbox.
        if (mounted) setEnvInfo(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Reset all sandbox demo data (students, teachers, batches, courses) back to original factory state?')) {
      return;
    }
    setResetting(true);
    try {
      await api.post('/system/sandbox/reset', {});
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e) {
      console.error('Failed to reset sandbox:', e);
      alert('Failed to reset sandbox. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  if (dismissed || !envInfo) return null;

  const isSandbox = envInfo.isSandbox !== false && envInfo.environment !== 'production';

  return (
    <aside aria-label="Environment Notice" className={`w-full py-1.5 px-3 sm:px-6 text-xs transition-all border-b z-50 flex items-center justify-between gap-2 ${
      isSandbox
        ? 'bg-amber-950/40 border-amber-500/20 text-amber-200 backdrop-blur-md'
        : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-200 backdrop-blur-md'
    }`}>
      <div className="flex items-center gap-2 overflow-hidden">
        {isSandbox ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-500/30 shrink-0">
            <Beaker className="w-3 h-3 text-amber-400" /> Sandbox Testbed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Production
          </span>
        )}

        <span className="truncate hidden md:inline font-medium text-slate-300">
          {isSandbox
            ? 'Operating in isolated sandbox mode with simulated payments, demo roles, and hardened security filters.'
            : 'Live production environment with strict encryption, RBAC enforcement, and rate limiting active.'}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isSandbox && (
          <button
            onClick={handleReset}
            disabled={resetting || resetSuccess}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
            title="Reset sandbox to factory demo state"
          >
            {resetSuccess ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Reset!
              </>
            ) : (
              <>
                <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset Sandbox</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          title="Dismiss banner"
          aria-label="Dismiss environment notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

export default SandboxBanner;
