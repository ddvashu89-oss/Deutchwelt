import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'germanRed' | 'germanRedSolid' | 'outlineWhite';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    secondary: 'bg-white/5 text-slate-300 border-white/10',
    outline: 'border-white/20 text-slate-300 bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    germanRed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    germanRedSolid: 'bg-rose-600 text-white border-rose-500/40 shadow-xs',
    outlineWhite: 'border border-white/30 text-white bg-white/10 backdrop-blur-xs'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
