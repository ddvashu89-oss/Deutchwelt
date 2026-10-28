import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 bg-mesh-cosmic">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={true} tagline="Account Recovery" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          Passwort zurücksetzen
        </h2>
        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
          Geben Sie Ihre registrierte E-Mail-Adresse ein, um einen sicheren Wiederherstellungslink zu erhalten.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0B1325]/90 backdrop-blur-2xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/10 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-black text-white">Postfach prüfen</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Falls ein Account mit <strong className="text-white">{email}</strong> existiert, wurde eine E-Mail mit Instruktionen versandt.
              </p>

              {devToken && (
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-left text-xs text-blue-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Development Fast-Track:
                  </p>
                  <Link to={`/reset-password?token=${devToken}`} className="underline font-mono text-[11px] block break-all text-blue-400 hover:text-blue-300">
                    Click here to open Password Reset with token
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Anmeldung
                </Link>
              </div>
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

              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                variant="primary"
                className="w-full py-3.5 text-sm font-bold shadow-lg shadow-blue-500/25"
              >
                <span>Link zum Zurücksetzen senden</span>
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
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
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 bg-mesh-cosmic">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={true} tagline="Password Update" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          Neues Passwort vergeben
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0B1325]/90 backdrop-blur-2xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/10 space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-heading font-black text-white">Passwort erfolgreich geändert</h3>
              <p className="text-xs text-slate-400">Sie können sich jetzt mit Ihrem neuen Passwort anmelden.</p>
              <Link to="/login">
                <Button variant="primary" className="text-xs font-bold">
                  Weiter zur Anmeldung
                </Button>
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
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm font-bold shadow-lg shadow-blue-500/25"
              >
                Passwort aktualisieren
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
