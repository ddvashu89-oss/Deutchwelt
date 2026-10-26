import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white' | 'ghost' | 'danger' | 'default' | 'germanRed';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 shadow-lg shadow-indigo-500/20 focus-visible:ring-indigo-500',
      default: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 shadow-lg shadow-indigo-500/20 focus-visible:ring-indigo-500',
      secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10 shadow-xs focus-visible:ring-indigo-500',
      germanRed: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95 shadow-md shadow-rose-900/30 focus-visible:ring-rose-500',
      outline: 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-indigo-500 shadow-xs backdrop-blur-sm',
      'outline-white': 'border border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/60 focus-visible:ring-white',
      ghost: 'text-slate-300 hover:text-white hover:bg-white/10 focus-visible:ring-indigo-500',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-md shadow-rose-900/30'
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
