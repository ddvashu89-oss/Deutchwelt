import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@deutschwelt/shared';
import { useAuth } from '../../context/AuthContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { ArrowRight, Lock, KeyRound, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setServerError(null);
      await login(data);
      // Let AuthProvider state settle, then navigate to dashboard
      navigate('/student/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" showTagline />
        <h2 className="text-3xl font-extrabold text-navy tracking-tight pt-2">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-dark-muted">
          Continue your German language learning journey.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-3xl sm:px-10 border border-gray-200/90 space-y-6">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs">
              <Link to="/forgot-password" className="font-semibold text-germanRed hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md" isLoading={isSubmitting}>
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-germanRed" /> Quick Demo Fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('student@deutschwelt.de', 'StudentDeutschWelt2026!')}
                className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-navy hover:text-white text-[11px] font-bold text-dark transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('teacher@deutschwelt.de', 'TeacherDeutschWelt2026!')}
                className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-navy hover:text-white text-[11px] font-bold text-dark transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@deutschwelt.de', 'AdminDeutschWelt2026!')}
                className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-navy hover:text-white text-[11px] font-bold text-dark transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-dark-muted pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-germanRed hover:underline">
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
