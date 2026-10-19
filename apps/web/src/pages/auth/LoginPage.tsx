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
import { ArrowRight, Lock, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setServerError(null);
      const loggedUser = await login(data);
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser?.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      let msg = 'Invalid email or password.';
      if (typeof err === 'string') {
        msg = err;
      } else if (typeof err?.message === 'string') {
        msg = err.message;
      } else if (typeof err?.error === 'string') {
        msg = err.error;
      } else if (err?.message && typeof err.message === 'object') {
        msg = err.message.message || JSON.stringify(err.message);
      }
      setServerError(msg);
    }
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
