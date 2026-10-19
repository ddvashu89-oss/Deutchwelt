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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none';

    const variants = {
      primary: 'bg-navy text-white hover:bg-navy-700 focus-visible:ring-navy shadow-sm',
      default: 'bg-navy text-white hover:bg-navy-700 focus-visible:ring-navy shadow-sm',
      secondary: 'bg-germanRed text-white hover:bg-germanRed-600 focus-visible:ring-germanRed shadow-sm',
      germanRed: 'bg-germanRed text-white hover:bg-germanRed-600 focus-visible:ring-germanRed shadow-sm',
      outline: 'border border-gray-300 bg-white text-dark hover:bg-gray-50 focus-visible:ring-navy',
      'outline-white': 'border border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/60 focus-visible:ring-white',
      ghost: 'text-dark hover:bg-gray-100 focus-visible:ring-navy',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600'
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
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
