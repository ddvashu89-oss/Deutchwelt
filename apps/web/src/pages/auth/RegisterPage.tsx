import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput, GermanLevel } from '@deutschwelt/shared';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { ArrowRight, Lock } from 'lucide-react';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isContentGate = searchParams.get('reason') === 'content_access';

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currentLevel: GermanLevel.A1,
      preferredLanguage: 'en',
      consentToTerms: true
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError(null);
      await registerUser(data);
      navigate('/student/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D17] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative font-sans text-slate-100 bg-hero-glow bg-mesh-dark">
      {/* Top Bar with Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          {t('reg.title')}
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
          {t('reg.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#11162B]/95 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/[0.08] space-y-6">
          {/* Content Gate Alert */}
          {isContentGate && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-300 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {t('gate.title')}
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  {t('gate.description')}
                </p>
              </div>
            </div>
          )}

          {serverError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('reg.firstName')}
                placeholder="Elena"
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label={t('reg.lastName')}
                placeholder="Rostova"
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Email Address & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('reg.email')}
                type="email"
                placeholder="elena@example.com"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('reg.mobile')}
                type="tel"
                placeholder="+49 151 12345678"
                required
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            {/* Address */}
            <Input
              label={t('reg.address')}
              placeholder="e.g. Friedrichstraße 45, 10117 Berlin, Germany"
              required
              error={errors.address?.message}
              {...register('address')}
            />

            {/* Password */}
            <Input
              label={t('reg.password')}
              type="password"
              placeholder="Minimum 8 chars with uppercase & number"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            {/* German Level & Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {t('reg.level')}
                </label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  {...register('currentLevel')}
                >
                  <option value={GermanLevel.BEGINNER}>Beginner (Zero German)</option>
                  <option value={GermanLevel.A1}>A1 — Starter</option>
                  <option value={GermanLevel.A2}>A2 — Elementary</option>
                  <option value={GermanLevel.B1}>B1 — Intermediate</option>
                  <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
                  <option value={GermanLevel.UNSURE}>Unsure / Take placement test</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Explanation Language
                </label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0F1424] px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  {...register('preferredLanguage')}
                >
                  <option value="en">English explanations</option>
                  <option value="hi">English + Hindi explanations (हिंदी)</option>
                  <option value="de">Deutsch immersiv (All German)</option>
                </select>
              </div>
            </div>

            {/* Learning Goal */}
            <Input
              label={t('reg.goal')}
              placeholder="e.g. Master's in Germany, Goethe-Zertifikat A1, Job Relocation"
              error={errors.learningGoal?.message}
              {...register('learningGoal')}
            />

            {/* Terms & Consent */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0F1424] text-indigo-600 focus:ring-indigo-500"
                {...register('consentToTerms')}
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-snug">
                {t('reg.terms')}{' '}
                <Link to="/terms" className="text-indigo-400 font-bold hover:underline">
                  Terms
                </Link>{' '}
                &{' '}
                <Link to="/privacy" className="text-indigo-400 font-bold hover:underline">
                  Privacy
                </Link>
                .
              </label>
            </div>
            {errors.consentToTerms && (
              <p className="text-xs text-rose-400 font-medium">{errors.consentToTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all mt-4"
            >
              <span>{isSubmitting ? 'Wird erstellt...' : t('reg.submit')}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            {t('reg.hasAccount')}{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
