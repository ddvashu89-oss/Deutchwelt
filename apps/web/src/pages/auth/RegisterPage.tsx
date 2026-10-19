import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput, GermanLevel } from '@deutschwelt/shared';
import { useAuth } from '../../context/AuthContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" showTagline />
        <h2 className="text-3xl font-extrabold text-navy tracking-tight pt-2">
          Create Your DeutschWelt Account
        </h2>
        <p className="text-xs text-dark-muted">
          Join thousands of learners achieving Goethe-certified fluency.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-3xl sm:px-10 border border-gray-200/90 space-y-6">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Elena"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Rostova"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="elena@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone Number (Optional)"
                placeholder="+49 151 12345678"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 chars with uppercase & number"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                  Current German Level
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

            <Input
              label="Your Primary Learning Goal (Optional)"
              placeholder="e.g. Master's in Germany, Goethe-Zertifikat A1, Job Relocation"
              error={errors.learningGoal?.message}
              {...register('learningGoal')}
            />

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                {...register('consentToTerms')}
              />
              <label htmlFor="terms" className="text-xs text-dark-muted leading-snug">
                I agree to the{' '}
                <Link to="/terms" className="text-navy font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-navy font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.consentToTerms && (
              <p className="text-xs text-red-600 font-medium">{errors.consentToTerms.message}</p>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full font-bold shadow-md mt-4" isLoading={isSubmitting}>
              Create Free Student Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-dark-muted pt-2 border-t border-gray-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-navy hover:underline">
              Sign In instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
