import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'outline' 
    | 'outline-white' 
    | 'ghost' 
    | 'danger' 
    | 'default' 
    | 'germanRed'
    | 'germanGold'
    | 'student'
    | 'teacher'
    | 'admin';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 focus-visible:ring-blue-500',
      default: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 focus-visible:ring-blue-500',
      secondary: 'bg-[#0E1629] text-slate-200 hover:bg-[#16223D] hover:text-white border border-white/10 shadow-md focus-visible:ring-blue-500',
      student: 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border border-cyan-300/30 focus-visible:ring-cyan-400',
      teacher: 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 border border-teal-400/30 focus-visible:ring-teal-500',
      admin: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30 focus-visible:ring-purple-500',
      germanGold: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 border border-amber-300/40 focus-visible:ring-amber-500',
      germanRed: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-900/30 border border-rose-400/30 focus-visible:ring-rose-500',
      outline: 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/25 focus-visible:ring-blue-500 backdrop-blur-md shadow-xs',
      'outline-white': 'border border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/60 focus-visible:ring-white',
      ghost: 'text-slate-300 hover:text-white hover:bg-white/5 focus-visible:ring-blue-500',
      danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 focus-visible:ring-rose-600 shadow-lg shadow-rose-900/30 border border-rose-500/30'
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-xl',
      md: 'text-sm px-5 py-2.5 gap-2 rounded-2xl',
      lg: 'text-base px-7 py-3.5 gap-2.5 rounded-2xl'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
