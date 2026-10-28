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
import { Button } from '../../components/ui/Button.js';
import { ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative font-sans text-slate-100 bg-mesh-cosmic">
      {/* Top Bar with Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={true} tagline="Student Admissions" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          {t('reg.title') || 'Start Your German Fluency Journey'}
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
          {t('reg.subtitle') || 'Create your student account to access CEFR course modules, vocabulary trainers, and interactive speech labs.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#0B1325]/90 backdrop-blur-2xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/10 space-y-6">
          {/* Content Gate Alert */}
          {isContentGate && (
            <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-300 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {t('gate.title') || 'Premium Course Material'}
                </h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  {t('gate.description') || 'Register a free account to unlock lessons, vocabulary decks, and pronunciation lab modules.'}
                </p>
              </div>
            </div>
          )}

          {serverError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('reg.firstName') || 'First Name'}
                placeholder="Elena"
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label={t('reg.lastName') || 'Last Name'}
                placeholder="Rostova"
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Email Address & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('reg.email') || 'Email Address'}
                type="email"
                placeholder="elena@example.com"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('reg.mobile') || 'Mobile Number'}
                type="tel"
                placeholder="+49 151 12345678"
                required
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            {/* Address */}
            <Input
              label={t('reg.address') || 'City & Address'}
              placeholder="e.g. Friedrichstraße 45, 10117 Berlin, Germany"
              required
              error={errors.address?.message}
              {...register('address')}
            />

            {/* Password */}
            <Input
              label={t('reg.password') || 'Password'}
              type="password"
              placeholder="Minimum 8 characters with numbers"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            {/* German Level & Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-sans">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  {t('reg.level') || 'Current German CEFR Level'}
                </label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A]/90 px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
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

              <div className="space-y-1.5 font-sans">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  Explanation Language
                </label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A]/90 px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
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
              label={t('reg.goal') || 'Learning Goal'}
              placeholder="e.g. Master's in Germany, Goethe-Zertifikat A1, Job Relocation"
              error={errors.learningGoal?.message}
              {...register('learningGoal')}
            />

            {/* Terms & Consent */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#070D1A] text-blue-600 focus:ring-blue-500"
                {...register('consentToTerms')}
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-snug">
                {t('reg.terms') || 'I agree to the'}{' '}
                <Link to="/terms" className="text-blue-400 font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                &{' '}
                <Link to="/privacy" className="text-blue-400 font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.consentToTerms && (
              <p className="text-xs text-rose-400 font-medium">{errors.consentToTerms.message}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 mt-4"
            >
              <span>{isSubmitting ? 'Wird erstellt...' : (t('reg.submit') || 'Create Student Account')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/[0.08]">
            {t('reg.hasAccount') || 'Already have an account?'}{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 hover:underline ml-1">
              {t('nav.login') || 'Sign in here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
