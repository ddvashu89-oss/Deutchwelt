import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  CheckCircle2,
  Settings,
  ShieldCheck,
  Globe,
  Beaker,
  RotateCcw,
  Lock,
  Server,
  Key,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Check
} from 'lucide-react';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformName, setPlatformName] = useState('DeutschWelt');
  const [tagline, setTagline] = useState('Your journey to German fluency.');
  const [contactEmail, setContactEmail] = useState('admissions@deutschwelt.de');
  const [savedMessage, setSavedMessage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Environment & Sandbox State
  const [envData, setEnvData] = useState<{
    environment?: string;
    isSandbox?: boolean;
    isProduction?: boolean;
    databaseMode?: string;
    securityControls?: Record<string, boolean>;
    sandboxSimulationActive?: boolean;
  } | null>(null);
  const [resettingSandbox, setResettingSandbox] = useState(false);
  const [sandboxResetSuccess, setSandboxResetSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [res, envRes]: any[] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/system/environment')
        ]);

        if (res.success) {
          setSettings(res.settings);
          const pName = res.settings.find((s: any) => s.key === 'platform_name');
          const pTag = res.settings.find((s: any) => s.key === 'tagline');
          const pMail = res.settings.find((s: any) => s.key === 'contact_email');
          if (pName) setPlatformName(pName.value);
          if (pTag) setTagline(pTag.value);
          if (pMail) setContactEmail(pMail.value);
        }

        if (envRes) {
          setEnvData(envRes);
        }
      } catch (e) {
        console.error('Error fetching settings or environment:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);

    try {
      await Promise.all([
        api.patch('/admin/settings/platform_name', { value: platformName }),
        api.patch('/admin/settings/tagline', { value: tagline }),
        api.patch('/admin/settings/contact_email', { value: contactEmail })
      ]);
      setSavedMessage(true);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSandbox = async () => {
    if (!window.confirm('Are you sure you want to restore the Sandbox to factory demo state? All test batches, students, and submissions will reset to initial demo seeds.')) {
      return;
    }

    setResettingSandbox(true);
    try {
      const res: any = await api.post('/system/sandbox/reset', {});
      if (res.success) {
        setSandboxResetSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to reset sandbox:', err);
      alert('Error resetting sandbox: ' + (err?.message || 'Server error'));
    } finally {
      setResettingSandbox(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Platform Configuration & Security</h1>
        <p className="text-xs text-slate-400">Manage global branding, sandbox testbed controls, and platform security defenses.</p>
      </div>

      {/* SECTION 1: SANDBOX & PRODUCTION ENVIRONMENT CONTROLS */}
      <div className="bg-[#0D111F] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-amber-400" /> Environment Control Center
              </span>
              <Badge variant={envData?.isSandbox ? 'warning' : 'success'} className="text-[10px]">
                {envData?.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Current runtime: <strong className="text-white">{envData?.databaseMode || 'Isolated Memory Store'}</strong>
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetSandbox}
            isLoading={resettingSandbox}
            disabled={sandboxResetSuccess}
            className="font-bold shadow-xs border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
          >
            {sandboxResetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Restored Demo State!
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Sandbox to Demo Seeds
              </>
            )}
          </Button>
        </div>

        {/* Security Defenses Checklist Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Security Controls & Protections
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Strict RBAC Authorization</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Admin, Teacher, and Student routes are strictly partitioned with role verification.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Real-Time Suspension</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Blocking a student immediately revokes active sessions and denies further access.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>XSS & Script Sanitizer</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Recursive sanitization strips malicious script tags, event handlers, and pseudo-protocols.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Bcrypt Password Security</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Passwords salted with 10 rounds; hashes are filtered from all API responses.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Brute-Force Rate Limiter</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rate limiting protects authentication and contact forms against credential stuffing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>CORS & Helmet Hardening</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                nosniff, X-Frame-Options: DENY, and origin verification active.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GLOBAL BRANDING PARAMETERS */}
      <div className="bg-[#0D111F] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="space-y-1 pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" /> Platform Identity & Admissions
          </h2>
          <p className="text-xs text-slate-400">Public-facing academy name, taglines, and admissions email destinations.</p>
        </div>

        {savedMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings saved successfully. Changes are live across public views.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Platform Brand Name"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            required
          />

          <Input
            label="Official Brand Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />

          <Input
            label="Official Admissions & Inquiries Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="font-bold shadow-lg shadow-indigo-500/20" isLoading={saving}>
              Save Platform Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res: any = await api.get('/admin/audit-logs');
        if (res.success) {
          setLogs(res.logs);
        }
      } catch (e) {
        console.error('Error loading audit logs:', e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Security & Audit Logs</h1>
        <p className="text-xs text-slate-400">Historical audit trail of administrative modifications, role changes, and course publications.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-3xl bg-white/5" />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-[#0D111F] rounded-3xl border border-white/10">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-[#0D111F] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11162B] text-slate-300 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-400">{log.action}</td>
                    <td className="p-4 text-slate-400">{log.entityType}</td>
                    <td className="p-4 text-slate-200 font-medium">{log.user?.email || 'System'}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="p-4 text-right text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
