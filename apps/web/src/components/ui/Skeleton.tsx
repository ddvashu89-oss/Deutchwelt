import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-white/5 border border-white/5', className)}
      {...props}
    />
  );
}
