import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'default' 
    | 'secondary' 
    | 'outline' 
    | 'success' 
    | 'warning' 
    | 'germanRed' 
    | 'germanRedSolid' 
    | 'outlineWhite'
    | 'student'
    | 'teacher'
    | 'admin'
    | 'gold';
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    secondary: 'bg-white/5 text-slate-300 border-white/10',
    outline: 'border-white/20 text-slate-300 bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    germanRed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    germanRedSolid: 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-500/40 shadow-xs',
    outlineWhite: 'border border-white/30 text-white bg-white/10 backdrop-blur-xs',
    student: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    teacher: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    admin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  const dotColors = {
    default: 'bg-blue-400 shadow-[0_0_6px_#60A5FA]',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-300',
    success: 'bg-emerald-400 shadow-[0_0_6px_#34D399]',
    warning: 'bg-amber-400 shadow-[0_0_6px_#FBBF24]',
    germanRed: 'bg-rose-400 shadow-[0_0_6px_#FB7185]',
    germanRedSolid: 'bg-white',
    outlineWhite: 'bg-white',
    student: 'bg-cyan-400 shadow-[0_0_6px_#22D3EE]',
    teacher: 'bg-teal-400 shadow-[0_0_6px_#2DD4BF]',
    admin: 'bg-purple-400 shadow-[0_0_6px_#C084FC]',
    gold: 'bg-amber-400 shadow-[0_0_6px_#FBBF24]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
}
