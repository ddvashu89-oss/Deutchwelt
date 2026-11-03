import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { GermanLevel } from '@deutschwelt/shared';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Logo } from '../../components/brand/Logo.js';
import { CheckCircle2, Clock3, Mail, RefreshCw, ShieldCheck } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<'working' | 'success' | 'error'>('working');
  const [message, setMessage] = useState('Verifying your email address…');
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setMessage('This verification link is missing its token. Sign in and request a fresh email.');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(async () => { await refreshUser(); setState('success'); setMessage('Email verified. You can now finish your student registration.'); })
      .catch((error: any) => { setState('error'); setMessage(error.message || 'This verification link is invalid or expired.'); });
  }, []);

  return <AuthShell title="Email verification">
    <div className="text-center">
      {state === 'success' ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /> : state === 'working' ? <RefreshCw className="mx-auto h-12 w-12 animate-spin text-navy" /> : <Mail className="mx-auto h-12 w-12 text-rose-600" />}
      <p className="mt-4 text-sm text-slate-600">{message}</p>
      <Link to="/student/registration" className="mt-6 inline-flex rounded-full bg-navy px-5 py-3 text-sm font-bold text-white">Continue registration</Link>
    </div>
  </AuthShell>;
}

export function StudentRegistrationPage() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(user?.studentProfile || {});
  const [verified, setVerified] = useState(Boolean(user?.isEmailVerified));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentLevel, setCurrentLevel] = useState(profile.currentLevel || GermanLevel.A1);
  const [learningGoal, setLearningGoal] = useState(profile.learningGoal || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage || 'en');
  const devToken = (location.state as any)?.devVerificationToken as string | undefined;
  const verificationEmailSent = (location.state as any)?.verificationEmailSent as boolean | undefined;

  const loadState = async () => {
    const result: any = await api.get('/student/registration');
    const nextProfile = result.profile || {};
    setProfile(nextProfile);
    setVerified(Boolean(result.isEmailVerified));
    setPhone(result.phone || user?.phone || '');
    setCurrentLevel(nextProfile.currentLevel || GermanLevel.A1);
    setLearningGoal(nextProfile.learningGoal || '');
    setPreferredLanguage(nextProfile.preferredLanguage || 'en');
    setLoading(false);
  };

  useEffect(() => { loadState().catch((e: any) => { setError(e.message || 'Could not load your registration.'); setLoading(false); }); }, []);

  async function verifyDevelopmentToken() {
    if (!devToken) return;
    setSaving(true); setError('');
    try {
      await api.post('/auth/verify-email', { token: devToken });
      await refreshUser();
      await loadState();
      setNotice('Email verified. Please complete the registration details below.');
    } catch (e: any) { setError(e.message || 'Could not verify the email address.'); }
    finally { setSaving(false); }
  }

  async function resendVerification() {
    setResending(true); setError(''); setNotice('');
    try {
      const result: any = await api.post('/auth/resend-verification');
      if (result.alreadyVerified) { await loadState(); setNotice('Your email is already verified.'); }
      else if (result.emailSent) setNotice('A new verification email has been sent. Check your inbox and spam folder.');
      else setNotice('Email delivery is not configured right now. Please contact the academy administrator.');
    } catch (e: any) { setError(e.message || 'Could not resend the verification email.'); }
    finally { setResending(false); }
  }

  async function submitForApproval(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await api.patch('/student/registration', { phone: phone || null, currentLevel, learningGoal, preferredLanguage });
      const result: any = await api.post('/student/registration/request-approval');
      setProfile(result.profile);
      await refreshUser();
      setNotice('Your registration has been sent to the academy admin for review.');
    } catch (e: any) { setError(e.message || 'Could not submit your registration for approval.'); }
    finally { setSaving(false); }
  }

  async function refreshApproval() {
    setLoading(true); setError('');
    try { await refreshUser(); await loadState(); }
    catch (e: any) { setError(e.message || 'Could not refresh the registration status.'); setLoading(false); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-navy" /></div>;
  if (profile.registrationStatus === 'APPROVED') {
    return <AuthShell title="Registration approved"><div className="text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><p className="mt-3 text-sm text-slate-600">Your student account is approved. Continue to your dashboard.</p><Button className="mt-5" onClick={() => navigate('/student/dashboard', { replace: true })}>Open student dashboard</Button></div></AuthShell>;
  }

  return <AuthShell title="Complete your student registration">
    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy"><ShieldCheck className="h-5 w-5" /></div>
      <div><p className="text-sm font-bold text-navy">Welcome, {user?.firstName}</p><p className="text-xs text-slate-500">Verify your email and tell us about your learning goals. An admin will review your registration.</p></div>
    </div>

    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

    {!verified && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div className="flex-1"><h2 className="font-bold text-amber-950">Verify your email first</h2><p className="mt-1 text-sm text-amber-900">{verificationEmailSent === false && !devToken ? 'We could not send the verification email yet. Please contact the academy or try again later.' : <>A verification link was sent to <b>{user?.email}</b>. Check your inbox and spam folder.</>}</p>
        <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={resendVerification} disabled={resending}>{resending ? 'Sending…' : 'Resend verification email'}</Button>{devToken && <Button type="button" variant="outline" onClick={verifyDevelopmentToken} disabled={saving}>Verify test email</Button>}</div>
      </div></div>
    </div>}

    {profile.registrationStatus === 'PENDING_APPROVAL' ? <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center gap-3"><Clock3 className="h-6 w-6 text-blue-700" /><h2 className="text-lg font-bold text-blue-950">Waiting for admin approval</h2></div>
      <p className="mt-3 text-sm text-blue-900">Your details were submitted{profile.registrationRequestedAt ? ` on ${new Date(profile.registrationRequestedAt).toLocaleString()}` : ''}. You’ll receive an email when the academy reviews your registration.</p>
      <Button type="button" variant="outline" className="mt-5" onClick={refreshApproval}>Refresh status</Button>
    </section> : <form onSubmit={submitForApproval} className="space-y-4">
      {profile.registrationStatus === 'REJECTED' && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><h2 className="font-bold text-rose-900">Please update your registration</h2><p className="mt-1 text-sm text-rose-800">Admin note: {profile.registrationReviewNote || 'Please review and update your details.'}</p></div>}
      <Input label="Mobile number (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 151 12345678" />
      <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Current German level</span><select value={currentLevel} onChange={e => setCurrentLevel(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"><option value={GermanLevel.BEGINNER}>Beginner (no German yet)</option><option value={GermanLevel.A1}>A1 — Starter</option><option value={GermanLevel.A2}>A2 — Elementary</option><option value={GermanLevel.B1}>B1 — Intermediate</option><option value={GermanLevel.B2}>B2 — Upper intermediate</option><option value={GermanLevel.UNSURE}>Unsure — I need a level check</option></select></label>
      <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-slate-700">What is your main learning goal?</span><textarea required minLength={3} maxLength={250} value={learningGoal} onChange={e => setLearningGoal(e.target.value)} placeholder="For example: prepare for a Goethe exam, work, study, or everyday conversation" className="min-h-24 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm" /></label>
      <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Language for explanations</span><select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"><option value="en">English</option><option value="hi">Hindi and English</option><option value="de">German</option></select></label>
      <Button className="w-full" disabled={saving || !verified}>{saving ? 'Submitting…' : 'Submit registration for admin approval'}</Button>
    </form>}
    <p className="mt-6 text-center text-xs text-slate-500">Need help? <Link className="font-bold text-navy underline" to="/contact">Contact the academy</Link> · <Link className="font-bold text-navy underline" to="/faq">FAQ</Link></p>
  </AuthShell>;
}

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f6f2] px-4 py-10"><Link to="/" className="mb-6"><Logo size="lg" /></Link><section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9"><h1 className="mb-6 text-center text-2xl font-black text-navy">{title}</h1>{children}</section></main>;
}
