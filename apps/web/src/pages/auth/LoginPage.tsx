import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';

const loginSchema = z.object({
  email: z.string().email('login.invalidEmail'),
  password: z.string().min(1, 'login.passwordRequired')
});

type LoginFormData = z.infer<typeof loginSchema>;
const levels = ['A1', 'A2', 'B1', 'B2'] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<(typeof levels)[number]>('A1');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const from = (location.state as any)?.from?.pathname || '/student';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const user = await login({ email: data.email, password: data.password });
      if (user?.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user?.role === 'TEACHER') navigate('/teacher', { replace: true });
      else navigate(from === '/login' ? '/student' : from, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const passwordHintIds = [errors.password && 'login-password-error', capsLockOn && 'login-caps-lock'].filter(Boolean).join(' ') || undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f2ec] font-sans text-gray-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(#144e3d14 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:py-7">
        <Logo size="md" />
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="hidden items-center gap-2 text-xs font-bold text-forest-900 transition-colors hover:text-forest-600 sm:inline-flex">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('login.backHome')}
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-[1320px] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_-42px_rgba(9,36,28,0.42)] ring-1 ring-forest-950/10 lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[36px] xl:min-h-[760px]">
        <section className="relative isolate flex min-h-[365px] flex-col justify-between overflow-hidden bg-forest-950 p-7 text-white sm:min-h-[430px] sm:p-10 lg:min-h-full lg:p-12" aria-label={t('login.journeyLabel')}>
          <img src="/german-hero.jpg" alt="" className="absolute inset-0 -z-30 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-b from-forest-950/85 via-forest-950/45 to-forest-950/95" />
          <div className="absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-mint/20 blur-3xl" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-mint" aria-hidden="true" />{t('login.journeyLabel')}
            </span>
            <span className="text-xs font-semibold tracking-[0.2em] text-white/70">{String(levels.indexOf(selectedLevel) + 1).padStart(2, '0')} / 04</span>
          </div>
          <div className="max-w-xl py-7 sm:py-12">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-mint">{t('login.welcomeBack')}</p>
            <h1 className="max-w-lg font-heading text-[clamp(2.4rem,5vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white">{t('login.heroTitle')}</h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{t('login.heroDescription')}</p>
          </div>
          <div className="rounded-[22px] border border-white/20 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{t('login.explorePath')}</span>
              <span className="text-xs font-bold text-mint" aria-live="polite">{selectedLevel}</span>
            </div>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label={t('login.explorePath')}>
              {levels.map((level) => (
                <button key={level} type="button" aria-pressed={selectedLevel === level} onClick={() => setSelectedLevel(level)} className={`rounded-xl px-2 py-2.5 text-xs font-extrabold transition-all duration-300 motion-reduce:transition-none sm:text-sm ${selectedLevel === level ? 'bg-mint text-forest-950 shadow-[0_8px_24px_-8px_rgba(52,211,153,0.7)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-3 min-h-10 text-xs leading-relaxed text-white/85 sm:text-sm" aria-live="polite">{t(`login.level.${selectedLevel}`)}</p>
          </div>
        </section>

        <section className="flex flex-col justify-center bg-[#fffefa] px-6 py-12 sm:px-12 lg:px-[clamp(2.5rem,5vw,5.5rem)] lg:py-16" aria-labelledby="login-heading">
          <div className="mx-auto w-full max-w-md">
            <span className="inline-flex rounded-full bg-forest-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-forest-800 ring-1 ring-forest-100">{t('login.memberAccess')}</span>
            <h2 id="login-heading" className="mt-5 font-heading text-3xl font-black tracking-tight text-forest-950 sm:text-[2.6rem]">{t('login.title')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t('login.subtitle')}</p>

            {serverError && <div role="alert" className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{serverError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-bold tracking-wide text-gray-800">{t('login.email')}</label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-forest-700" aria-hidden="true" />
                  <input id="login-email" type="email" autoComplete="username" placeholder={t('login.emailPlaceholder')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100 ${errors.email ? 'border-rose-400' : 'border-gray-200 hover:border-gray-300'}`} {...register('email')} />
                </div>
                {errors.email && <p id="login-email-error" className="mt-2 text-xs font-semibold text-rose-600">{t(errors.email.message || 'login.invalidEmail')}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="text-xs font-bold tracking-wide text-gray-800">{t('login.password')}</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-forest-700 underline-offset-4 transition-colors hover:text-forest-950 hover:underline">{t('login.forgotPassword')}</Link>
                </div>
                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-forest-700" aria-hidden="true" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={passwordHintIds} onKeyDown={(event) => setCapsLockOn(event.getModifierState('CapsLock'))} onKeyUp={(event) => setCapsLockOn(event.getModifierState('CapsLock'))} className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-14 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100 ${errors.password ? 'border-rose-400' : 'border-gray-200 hover:border-gray-300'}`} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')} aria-pressed={showPassword} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-forest-50 hover:text-forest-900">
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" className="mt-2 text-xs font-semibold text-rose-600">{t(errors.password.message || 'login.passwordRequired')}</p>}
                {capsLockOn && <p id="login-caps-lock" className="mt-2 text-xs font-semibold text-amber-700">{t('login.capsLock')}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-forest-900 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_-12px_rgba(9,36,28,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-[0_18px_28px_-12px_rgba(9,36,28,0.75)] disabled:cursor-wait disabled:opacity-70 motion-reduce:transform-none motion-reduce:transition-none">
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <span>{isSubmitting ? t('login.submitting') : t('login.submit')}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4 text-mint transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="font-extrabold text-forest-800 underline-offset-4 hover:underline">{t('login.registerNow')}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2 px-5 py-5 text-[11px] font-medium text-gray-500 sm:px-8">
        <span>© {new Date().getFullYear()} DeutschWelt Coaching</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-forest-900">{t('login.privacy')}</Link>
          <Link to="/contact" className="hover:text-forest-900">{t('login.support')}</Link>
        </div>
      </footer>
    </div>
  );
}
