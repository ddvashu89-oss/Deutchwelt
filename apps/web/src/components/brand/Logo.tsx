import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showTagline = false, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5 group select-none', className)}>
      {/* Brand Geometric Emblem */}
      <div className={cn('relative flex items-center justify-center rounded-xl bg-navy text-white font-heading font-extrabold shadow-sm transition-transform group-hover:scale-105', iconSizes[size])}>
        <span className="text-white text-xs sm:text-sm font-black">DW</span>
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-germanRed ring-2 ring-white" />
      </div>

      <div className="flex flex-col">
        <span className={cn('font-heading font-extrabold tracking-tight text-navy leading-none', sizeClasses[size])}>
          Deutsch<span className="text-germanRed">Welt</span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-dark-muted mt-0.5">
            German Academy
          </span>
        )}
      </div>
    </Link>
  );
}
