import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Logo } from '../../components/brand/Logo.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { LanguageToggle } from '../../components/ui/LanguageToggle.js';
import { ArrowRight, Shield, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | null>(null);

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

  const fillQuickCreds = (role: 'admin' | 'teacher' | 'student') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setValue('email', 'admin@deutschwelt.de');
      setValue('password', 'AdminDeutschWelt2026!');
    } else if (role === 'teacher') {
      setValue('email', 'teacher@deutschwelt.de');
      setValue('password', 'TeacherDeutschWelt2026!');
    } else {
      setValue('email', 'student@deutschwelt.de');
      setValue('password', 'StudentDeutschWelt2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans text-slate-100 bg-mesh-cosmic">
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={true} tagline="German Language Academy" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight pt-2">
          {t('login.title') || 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
          {t('login.subtitle') || 'Sign in to access your German coursework, live faculty batches, and progress analytics.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0B1325]/90 backdrop-blur-2xl py-8 px-6 shadow-2xl sm:rounded-4xl sm:px-10 border border-white/10 space-y-6">
          {serverError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          {/* Quick Demo Role Switcher */}
          <div className="space-y-2 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Quick Role Autofill (Click to Switch)
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">Sandbox Testbed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => fillQuickCreds('admin')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-md shadow-purple-500/15'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-400">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">admin@...</div>
              </button>

              {/* Teacher Button */}
              <button
                type="button"
                onClick={() => fillQuickCreds('teacher')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-teal-500/20 border-teal-500/50 shadow-md shadow-teal-500/15'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-400">
                  <GraduationCap className="w-3.5 h-3.5" /> Faculty
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">teacher@...</div>
              </button>

              {/* Student Button */}
              <button
                type="button"
                onClick={() => fillQuickCreds('student')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  selectedRole === 'student'
                    ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md shadow-cyan-500/15'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" /> Student
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">student@...</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('login.email') || 'Email Address'}
              type="email"
              autoComplete="email"
              placeholder={t('login.emailPlaceholder') || 'name@example.com'}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('login.password') || 'Password'}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/forgot-password" className="font-bold text-blue-400 hover:text-blue-300 hover:underline">
                {t('login.forgotPassword') || 'Forgot password?'}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25"
            >
              <span>{isSubmitting ? t('login.submitting') : (t('login.submit') || 'Sign In to DeutschWelt')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/[0.08]">
            {t('login.noAccount') || "Don't have an account?"}{' '}
            <Link to="/register" className="font-bold text-blue-400 hover:text-blue-300 hover:underline ml-1">
              {t('login.registerNow') || 'Create student account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
