import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput, GermanLevel } from '@deutschwelt/shared';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { Logo } from '../../components/brand/Logo.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { ArrowRight, Lock, MapPin, Phone, Mail, User, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Top Bar with Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-950 tracking-tight pt-2">
          {t('reg.title')}
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">
          {t('reg.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-4xl sm:px-10 border border-gray-200/80 space-y-6">
          {/* Content Gate Alert */}
          {isContentGate && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">
                  {t('gate.title')}
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t('gate.description')}
                </p>
              </div>
            </div>
          )}

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
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
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                  {t('reg.level')}
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
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
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                  Explanation Language
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
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
                className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                {...register('consentToTerms')}
              />
              <label htmlFor="terms" className="text-xs text-dark-muted leading-snug">
                {t('reg.terms')}{' '}
                <Link to="/terms" className="text-navy font-bold hover:underline">
                  Terms
                </Link>{' '}
                &{' '}
                <Link to="/privacy" className="text-navy font-bold hover:underline">
                  Privacy
                </Link>
                .
              </label>
            </div>
            {errors.consentToTerms && (
              <p className="text-xs text-red-600 font-medium">{errors.consentToTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all mt-4"
            >
              <span>{isSubmitting ? 'Wird erstellt...' : t('reg.submit')}</span>
              <ArrowRight className="w-4 h-4 text-mint" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            {t('reg.hasAccount')}{' '}
            <Link to="/login" className="font-bold text-forest-800 hover:text-forest-900 hover:underline">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
