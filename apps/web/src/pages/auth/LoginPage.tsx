import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const from = (location.state as any)?.from?.pathname || '/student';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login({ email: data.email, password: data.password });
      
      const email = data.email.toLowerCase();
      if (email.includes('admin')) {
        navigate('/admin', { replace: true });
      } else if (email.includes('teacher')) {
        navigate('/teacher', { replace: true });
      } else {
        navigate(from === '/login' ? '/student' : from, { replace: true });
      }
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const quickFill = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-950 tracking-tight pt-2">
          Anmelden bei DeutschWelt
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          Setzen Sie Ihren Deutschkurs von A1 bis B2 nahtlos fort.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-4xl sm:px-10 border border-gray-200/80 space-y-6">
          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-Mail-Adresse"
              type="email"
              autoComplete="email"
              placeholder="ihre.email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Passwort"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/forgot-password" className="font-semibold text-forest-800 hover:text-forest-900 hover:underline">
                Passwort vergessen?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>{isSubmitting ? 'Wird angemeldet...' : 'Jetzt Anmelden'}</span>
              <ArrowRight className="w-4 h-4 text-mint" />
            </button>
          </form>

          {/* 1-Click Demo Login Options */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[11px] font-bold text-center uppercase tracking-wider text-gray-400">
              1-Klick Demo Login (Testmodus)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('student@deutschwelt.de', 'StudentDeutschWelt2026!')}
                className="py-2.5 px-2 rounded-2xl bg-forest-50 hover:bg-forest-100/80 text-forest-950 text-[11px] font-bold border border-forest-200 transition-colors flex flex-col items-center shadow-xs cursor-pointer"
              >
                <span>Student</span>
                <span className="text-[9px] text-forest-700 font-medium">B1 Lerner</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('teacher@deutschwelt.de', 'TeacherDeutschWelt2026!')}
                className="py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 text-[11px] font-bold border border-emerald-200 transition-colors flex flex-col items-center shadow-xs cursor-pointer"
              >
                <span>Dozent</span>
                <span className="text-[9px] text-emerald-700 font-medium">Elena Schmidt</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@deutschwelt.de', 'AdminDeutschWelt2026!')}
                className="py-2.5 px-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-[11px] font-bold border border-gray-300 transition-colors flex flex-col items-center shadow-xs cursor-pointer"
              >
                <span>Admin</span>
                <span className="text-[9px] text-gray-600 font-medium">Vollzugriff</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2">
            Noch kein Konto?{' '}
            <Link to="/register" className="font-bold text-forest-800 hover:text-forest-900 hover:underline">
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
