import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CheckCircle2, Settings, ShieldCheck, Globe } from 'lucide-react';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformName, setPlatformName] = useState('DeutschWelt');
  const [tagline, setTagline] = useState('Your journey to German fluency.');
  const [contactEmail, setContactEmail] = useState('admissions@deutschwelt.de');
  const [savedMessage, setSavedMessage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await api.get('/admin/settings');
        if (res.success) {
          setSettings(res.settings);
          const pName = res.settings.find((s: any) => s.key === 'platform_name');
          const pTag = res.settings.find((s: any) => s.key === 'tagline');
          const pMail = res.settings.find((s: any) => s.key === 'contact_email');
          if (pName) setPlatformName(pName.value);
          if (pTag) setTagline(pTag.value);
          if (pMail) setContactEmail(pMail.value);
        }
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Platform Configuration</h1>
        <p className="text-xs text-dark-muted">Manage global branding, academy parameters, and contact destinations.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-card space-y-6">
        {savedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
            <Button type="submit" variant="primary" size="md" className="font-bold shadow-md" isLoading={saving}>
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
    <div className="space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Security & Audit Logs</h1>
        <p className="text-xs text-dark-muted">Historical audit trail of administrative modifications, role changes, and course publications.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-dark-muted">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy text-white uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-dark">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="p-4 font-mono font-bold text-navy">{log.action}</td>
                    <td className="p-4 text-dark-muted">{log.entityType}</td>
                    <td className="p-4 text-dark font-medium">{log.user?.email || 'System'}</td>
                    <td className="p-4 text-gray-500 font-mono text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="p-4 text-right text-gray-400">
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
