import React from 'react';
import { cn } from '../../lib/utils.js';

interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  barColor?: string;
  showLabel?: boolean;
}

export function Progress({ 
  value = 0, 
  className, 
  barColor = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400',
  showLabel = false 
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Fortschritt</span>
          <span className="text-white">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner', className)}
      >
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full shadow-sm', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
