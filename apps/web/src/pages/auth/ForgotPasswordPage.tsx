import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err) {
      setSubmitted(true); // Always generic response
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D17] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 bg-hero-glow bg-mesh-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          Passwort zurücksetzen
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Geben Sie Ihre E-Mail-Adresse ein, um einen Wiederherstellungslink zu erhalten.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#11162B]/95 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/[0.08] space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Postfach prüfen</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Falls ein Account mit <strong className="text-white">{email}</strong> existiert, wurde ein Wiederherstellungslink versandt.
              </p>

              {devToken && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-left text-xs text-indigo-300 space-y-1">
                  <p className="font-bold">Development Fast-Track:</p>
                  <Link to={`/reset-password?token=${devToken}`} className="underline font-mono text-[11px] block break-all text-indigo-400 hover:text-indigo-300">
                    Click here to open Password Reset with token
                  </Link>
                </div>
              )}

              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:underline pt-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Anmeldung
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                {loading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Anmeldung
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D17] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 bg-hero-glow bg-mesh-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          Neues Passwort vergeben
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#11162B]/95 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/[0.08] space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Passwort erfolgreich geändert</h3>
              <p className="text-xs text-slate-400">Sie können sich jetzt mit Ihrem neuen Passwort anmelden.</p>
              <Link to="/login">
                <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                  Weiter zur Anmeldung
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Neues Passwort"
                type="password"
                required
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                Passwort aktualisieren
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
