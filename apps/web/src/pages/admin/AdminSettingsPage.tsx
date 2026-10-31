import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CheckCircle2, Settings, ShieldCheck, Globe, HardDrive, FolderOpen, Link2 } from 'lucide-react';

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

type DriveStatus = {
  databaseReady: boolean;
  configured: boolean;
  connected: boolean;
  folder: { id: string; name: string } | null;
  pickerReady: boolean;
};

function loadGooglePicker() {
  return new Promise<void>((resolve, reject) => {
    const finish = () => {
      if (!window.gapi?.load) return reject(new Error('Google Picker could not load.'));
      window.gapi.load('picker', { callback: resolve });
    };

    if (window.gapi?.load) return finish();
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-picker]');
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Picker could not load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.googlePicker = 'true';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error('Google Picker could not load.'));
    document.head.appendChild(script);
  });
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformName, setPlatformName] = useState('DeutschWelt');
  const [tagline, setTagline] = useState('Your journey to German fluency.');
  const [contactEmail, setContactEmail] = useState('admissions@deutschwelt.de');
  const [savedMessage, setSavedMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveMessage, setDriveMessage] = useState('');
  const [driveError, setDriveError] = useState('');

  const refreshDriveStatus = async () => {
    try {
      const res: any = await api.get('/admin/drive/status');
      if (res.success) setDriveStatus(res.drive);
    } catch (error: any) {
      setDriveError(error?.message || 'Could not check Google Drive connection.');
    }
  };

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
    refreshDriveStatus();

    const driveState = new URLSearchParams(window.location.search).get('drive');
    if (driveState === 'connected') setDriveMessage('Google Drive connected. Select the folder for course files.');
    if (driveState === 'cancelled') setDriveError('Google Drive connection was cancelled.');
    if (driveState === 'database-required') setDriveError('PostgreSQL disconnected during setup. Start the database and connect Google Drive again.');
  }, []);

  const connectDrive = () => {
    setDriveError('');
    if (!driveStatus?.configured) {
      setDriveError('Add the Google OAuth Client ID and Client Secret to the API environment first.');
      return;
    }
    window.location.assign('/api/v1/admin/drive/connect');
  };

  const selectDriveFolder = async () => {
    setDriveBusy(true);
    setDriveMessage('');
    setDriveError('');
    try {
      const res: any = await api.get('/admin/drive/picker-config');
      const pickerConfig = res.picker;
      await loadGooglePicker();
      const google = window.google;
      if (!google?.picker) throw new Error('Google Picker is unavailable. Check that the Picker API is enabled.');

      const folderView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);
      const picker = new google.picker.PickerBuilder()
        .setAppId(pickerConfig.projectNumber)
        .setDeveloperKey(pickerConfig.apiKey)
        .setOAuthToken(pickerConfig.accessToken)
        .addView(folderView)
        .setTitle('Choose the DeutschWelt storage folder')
        .setCallback(async (data: any) => {
          if (data.action !== google.picker.Action.PICKED || !data.docs?.[0]?.id) {
            setDriveBusy(false);
            return;
          }
          try {
            const saved: any = await api.post('/admin/drive/folder', { id: data.docs[0].id });
            setDriveStatus((current) => current ? { ...current, folder: saved.folder } : current);
            setDriveMessage(`Storage folder set to “${saved.folder.name}”.`);
          } catch (error: any) {
            setDriveError(error?.message || 'Could not save the selected folder.');
          } finally {
            setDriveBusy(false);
          }
        })
        .build();
      picker.setVisible(true);
    } catch (error: any) {
      setDriveError(error?.message || 'Could not open Google Drive folder picker.');
      setDriveBusy(false);
    }
  };

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

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-card space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-navy">Google Drive storage</h2>
            <p className="mt-1 text-xs leading-relaxed text-dark-muted">
              Connect the academy Google account and choose a private folder. Uploaded class files stay in Drive; students access them through their DeutschWelt batch permissions.
            </p>
          </div>
        </div>

        {driveMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{driveMessage}</span>
          </div>
        )}
        {driveError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            {driveError}
          </div>
        )}

        {driveStatus?.connected && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <FolderOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-navy">{driveStatus.folder?.name || 'No storage folder selected'}</p>
                <p className="text-[11px] text-dark-muted mt-0.5">
                  {driveStatus.folder ? 'Private storage folder connected' : 'Choose the folder teachers will upload course files into.'}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={selectDriveFolder} isLoading={driveBusy} disabled={!driveStatus.pickerReady || !driveStatus.databaseReady}>
              <FolderOpen className="w-4 h-4 mr-1.5" /> {driveStatus.folder ? 'Change Folder' : 'Choose Folder'}
            </Button>
          </div>
        )}
        {driveStatus && !driveStatus.databaseReady && (
          <p className="text-[11px] text-amber-800">Start PostgreSQL before connecting Drive. DeutschWelt needs it to save the encrypted connection and file access records.</p>
        )}
        {driveStatus?.connected && !driveStatus.pickerReady && (
          <p className="text-[11px] text-dark-muted">Add the Google Picker API key and project number to the API environment to enable folder selection.</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button type="button" variant="primary" size="sm" onClick={connectDrive} disabled={!driveStatus?.configured || !driveStatus.databaseReady}>
              <Link2 className="w-4 h-4 mr-1.5" /> {driveStatus?.connected ? 'Reconnect Google Drive' : 'Connect Google Drive'}
            </Button>
            {!driveStatus?.configured && (
              <p className="text-[11px] text-dark-muted">Google OAuth client credentials are not configured on the API yet.</p>
            )}
          </div>
      </section>
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
