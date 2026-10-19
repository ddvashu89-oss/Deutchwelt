import React from 'react';
import { cn } from '../../lib/utils.js';

interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  barColor?: string;
}

export function Progress({ value = 0, className, barColor = 'bg-germanRed' }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}
    >
      <div
        className={cn('h-full transition-all duration-500 ease-out rounded-full', barColor)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
