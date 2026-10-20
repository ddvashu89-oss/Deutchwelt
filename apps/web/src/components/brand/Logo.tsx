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
  const heightClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-18'
  };

  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18'
  };

  const content = iconOnly ? (
    <div className={cn('relative inline-flex items-center justify-center select-none', className)}>
      <img
        src="/logo-icon.png"
        alt="DeutschWelt Coaching"
        className={cn('object-contain transition-transform group-hover:scale-105', iconSizes[size])}
        loading="eager"
      />
    </div>
  ) : (
    <div className={cn('inline-flex flex-col items-start select-none group', className)}>
      <img
        src="/logo-transparent.png"
        alt="DeutschWelt Coaching Logo"
        className={cn('w-auto object-contain transition-transform group-hover:scale-[1.02]', heightClasses[size])}
        loading="eager"
      />
      {showTagline && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-dark-muted/80 mt-1 pl-1">
          German Language Academy
        </span>
      )}
    </div>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link to="/" className="inline-flex items-center outline-none focus:outline-none" aria-label="DeutschWelt Coaching Home">
      {content}
    </Link>
  );
}
