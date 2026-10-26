import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { ArrowRight, Shield, GraduationCap, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
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
      const user = await login({ email: data.email, password: data.password });
      
      const email = data.email.toLowerCase();
      if (user?.role === 'ADMIN' || email.includes('admin')) {
        navigate('/admin', { replace: true });
      } else if (user?.role === 'TEACHER' || email.includes('teacher')) {
        navigate('/teacher', { replace: true });
      } else {
        navigate(from === '/login' ? '/student' : from, { replace: true });
      }
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const fillQuickCreds = (email: string) => {
    setValue('email', email);
    if (email.includes('admin')) {
      setValue('password', 'AdminDeutschWelt2026!');
    } else if (email.includes('teacher')) {
      setValue('password', 'TeacherDeutschWelt2026!');
    } else {
      setValue('password', 'StudentDeutschWelt2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D17] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans text-slate-100 bg-hero-glow bg-mesh-dark">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          {t('login.title')}
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          {t('login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#11162B]/95 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/[0.08] space-y-6">
          {serverError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          {/* Quick Demo Login Switcher */}
          <div className="space-y-1.5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Role Login (Click to fill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCreds('admin@deutschwelt.de')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                  <Shield className="w-3 h-3" /> Admin
                </div>
                <div className="text-[9px] text-slate-400 truncate">admin@...</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCreds('teacher@deutschwelt.de')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <GraduationCap className="w-3 h-3" /> Teacher
                </div>
                <div className="text-[9px] text-slate-400 truncate">teacher@...</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCreds('student@deutschwelt.de')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-pink-400">
                  <Sparkles className="w-3 h-3" /> Student
                </div>
                <div className="text-[9px] text-slate-400 truncate">student@...</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              autoComplete="email"
              placeholder={t('login.emailPlaceholder')}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('login.password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                {t('login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>{isSubmitting ? t('login.submitting') : t('login.submit')}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              {t('login.registerNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
