import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'germanRed' | 'germanRedSolid' | 'outlineWhite';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-navy-100 text-navy-800 border-navy-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    germanRed: 'bg-germanRed-50 text-germanRed-700 border-germanRed-200',
    germanRedSolid: 'bg-germanRed text-white border-germanRed/40 shadow-xs',
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
