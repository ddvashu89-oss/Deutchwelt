import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  tagline?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  asLink?: boolean;
  roleBadge?: 'student' | 'teacher' | 'admin' | null;
}

export function Logo({
  className,
  showTagline = false,
  tagline,
  size = 'md',
  iconOnly = false,
  asLink = true,
  roleBadge = null
}: LogoProps) {
  const iconSizes = {
    xs: 'w-6 h-6 rounded-lg p-0.5',
    sm: 'w-8 h-8 rounded-xl p-1',
    md: 'w-10 h-10 rounded-xl p-1',
    lg: 'w-12 h-12 rounded-2xl p-1.5',
    xl: 'w-14 h-14 rounded-2xl p-1.5'
  };

  const fontSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const roleBadgeStyles = {
    student: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    teacher: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const roleBadgeLabels = {
    student: 'Campus',
    teacher: 'Faculty Studio',
    admin: 'Command',
  };

  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      {/* High-Precision German Flag Emblem with Metallic Ring & Sapphire Glow */}
      <div className={cn(
        'bg-[#0B1325] border border-white/10 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/15 group-hover:border-blue-500/40 group-hover:shadow-blue-500/25 transition-all duration-300',
        iconSizes[size]
      )}>
        <div className="w-full h-full rounded-[6px] overflow-hidden flex flex-col shadow-inner">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-rose-600" />
          <div className="flex-1 bg-amber-400" />
        </div>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className={cn('font-heading font-black tracking-tight text-white flex items-center', fontSizes[size])}>
              Deutsch
              <span className="text-gradient-brand ml-0.5">
                Welt
              </span>
            </span>

            {roleBadge && (
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                roleBadgeStyles[roleBadge]
              )}>
                {roleBadgeLabels[roleBadge]}
              </span>
            )}
          </div>

          {showTagline && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              {tagline || 'German Language Academy'}
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
