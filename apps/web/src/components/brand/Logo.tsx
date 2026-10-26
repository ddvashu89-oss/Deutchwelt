import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  asLink?: boolean;
}

export function Logo({
  className,
  showTagline = false,
  size = 'md',
  iconOnly = false,
  asLink = true
}: LogoProps) {
  const iconSizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg'
  };

  const fontSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      {/* High-tech German Flag Logo Emblem */}
      <div className={cn(
        'rounded-xl bg-[#11162B] border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10 group-hover:border-indigo-500/40 transition-all',
        iconSizes[size]
      )}>
        <div className="w-full h-full rounded-lg overflow-hidden flex flex-col shadow-inner">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-rose-600" />
          <div className="flex-1 bg-amber-400" />
        </div>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className={cn('font-heading font-black tracking-tight text-white flex items-center', fontSizes[size])}>
            <span>Deutsch</span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ml-0.5">
              Welt
            </span>
          </div>
          {showTagline && (
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
              German Language Academy
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
