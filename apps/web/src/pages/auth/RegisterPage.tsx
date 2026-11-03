import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@deutschwelt/shared';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { ArrowRight, BadgeCheck, Check, ChevronLeft, Eye, EyeOff, Lock, MailCheck, UserRound } from 'lucide-react';
import { countryCallingCodes } from '../../lib/phoneCountryCodes.js';

const registrationSteps = [
  { title: 'Your details', description: 'Tell us a little about yourself.', icon: UserRound },
  { title: 'Secure your account', description: 'Choose a password for your account.', icon: Lock },
  { title: 'Review and submit', description: 'Check your details and agree to our policies.', icon: BadgeCheck }
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isContentGate = searchParams.get('reason') === 'content_access';

  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      consentToTerms: false
    }
  });

  const formValues = watch();

  const goToNextStep = async () => {
    const fieldsToValidate: Array<keyof RegisterInput> = step === 0
      ? ['firstName', 'lastName', 'email', 'phone']
      : ['password'];

    if (await trigger(fieldsToValidate)) {
      setServerError(null);
      setStep((current) => Math.min(current + 1, registrationSteps.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setServerError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError(null);
      const mobileNumber = data.phone?.trim();
      const result: any = await registerUser({
        ...data,
        phone: mobileNumber ? `${countryCode} ${mobileNumber}` : undefined
      });
      navigate('/student/registration', { replace: true, state: { verificationEmailSent: result?.verificationEmailSent, devVerificationToken: result?.devVerificationToken } });
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-7 px-5 shadow-xl sm:rounded-4xl sm:px-10 sm:py-9 border border-gray-200/80 space-y-6">
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

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-800">Step {step + 1} of {registrationSteps.length}</p>
                <p className="text-xs font-semibold text-gray-500">{Math.round(((step + 1) / registrationSteps.length) * 100)}% complete</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label="Registration progress" aria-valuemin={1} aria-valuemax={registrationSteps.length} aria-valuenow={step + 1}>
                <div className="h-full rounded-full bg-forest-800 transition-all duration-300" style={{ width: `${((step + 1) / registrationSteps.length) * 100}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Registration steps">
                {registrationSteps.map((registrationStep, index) => {
                  const StepIcon = registrationStep.icon;
                  const isComplete = index < step;
                  const isCurrent = index === step;
                  return (
                    <div key={registrationStep.title} className={`flex items-center gap-2 text-xs font-semibold ${isCurrent ? 'text-forest-900' : isComplete ? 'text-forest-700' : 'text-gray-400'}`} aria-current={isCurrent ? 'step' : undefined}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isCurrent ? 'bg-forest-900 text-white' : isComplete ? 'bg-forest-100 text-forest-800' : 'bg-gray-100'}`}>
                        {isComplete ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                      </span>
                      <span className="hidden sm:block">{registrationStep.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="min-h-[245px]">
                <div className="mb-5">
                  <h3 className="text-xl font-heading font-bold text-gray-950">{registrationSteps[step].title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{registrationSteps[step].description}</p>
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label={t('reg.firstName')} placeholder="Elena" required error={errors.firstName?.message} autoComplete="given-name" {...register('firstName')} />
                      <Input label={t('reg.lastName')} placeholder="Rostova" required error={errors.lastName?.message} autoComplete="family-name" {...register('lastName')} />
                    </div>
                    <Input label={t('reg.email')} type="email" placeholder="elena@example.com" required error={errors.email?.message} autoComplete="email" {...register('email')} />
                    <div>
                      <label htmlFor="countryCallingCode" className="mb-1.5 block text-xs font-bold tracking-wide text-gray-700">{t('reg.mobile')}</label>
                      <div className="grid grid-cols-[minmax(125px,0.8fr)_minmax(0,2fr)] gap-2">
                        <select
                          id="countryCallingCode"
                          value={countryCode}
                          onChange={(event) => setCountryCode(event.target.value)}
                          aria-label="Country calling code"
                          className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-800/15 focus:border-forest-800"
                        >
                          {countryCallingCodes.map(({ country, code }) => (
                            <option key={country} value={code}>{country} ({code})</option>
                          ))}
                        </select>
                        <Input
                          type="tel"
                          placeholder="98765 43210"
                          error={errors.phone?.message}
                          autoComplete="tel-national"
                          {...register('phone')}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">India (+91) is selected by default.</p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label={t('reg.password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 chars with uppercase & number"
                        required
                        error={errors.password?.message}
                        autoComplete="new-password"
                        {...register('password')}
                      />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-[38px] rounded-md p-1 text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-gray-600">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-forest-800" />
                      <p>Use a strong password that you do not use on other websites. You can sign in with this email and password.</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
                      <div className="flex items-center gap-3 p-4">
                        <UserRound className="h-5 w-5 shrink-0 text-forest-800" />
                        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Student</p><p className="truncate text-sm font-semibold text-gray-900">{[formValues.firstName, formValues.lastName].filter(Boolean).join(' ')}</p></div>
                      </div>
                      <div className="flex items-center gap-3 p-4">
                        <MailCheck className="h-5 w-5 shrink-0 text-forest-800" />
                        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p><p className="truncate text-sm font-semibold text-gray-900">{formValues.email}</p></div>
                      </div>
                      {formValues.phone && <div className="flex items-center gap-3 p-4"><div className="h-5 w-5 shrink-0" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mobile</p><p className="truncate text-sm font-semibold text-gray-900">{countryCode} {formValues.phone}</p></div></div>}
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                      <input type="checkbox" id="terms" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-forest-800 focus:ring-forest-700" {...register('consentToTerms')} />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <label htmlFor="terms" className="cursor-pointer">{t('reg.terms')}{' '}</label>
                        <Link to="/terms" className="font-bold text-forest-800 hover:underline">Terms</Link>{' '}&amp;{' '}
                        <Link to="/privacy" className="font-bold text-forest-800 hover:underline">Privacy</Link>.
                      </p>
                    </div>
                    {errors.consentToTerms && <p className="text-xs font-medium text-red-600">{errors.consentToTerms.message}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                {step > 0 ? (
                  <button type="button" onClick={goToPreviousStep} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : <span />}

                {step < registrationSteps.length - 1 ? (
                  <button type="button" onClick={goToNextStep} className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-forest-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2">
                    Continue <ArrowRight className="h-4 w-4 text-mint" />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-forest-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2">
                    <span>{isSubmitting ? 'Creating account…' : t('reg.submit')}</span>
                    <ArrowRight className="h-4 w-4 text-mint" />
                  </button>
                )}
              </div>
            </form>
          </div>

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
