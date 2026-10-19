import React from 'react';
import { cn, formatGermanArticle } from '../../lib/utils.js';

interface ArticleBadgeProps {
  article: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ArticleBadge({ article, className, size = 'md' }: ArticleBadgeProps) {
  if (!article || article.toLowerCase() === 'none') {
    return null;
  }

  const { label, bg, text, border } = formatGermanArticle(article);

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm font-bold'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase rounded-md border tracking-wider select-none',
        bg,
        text,
        border,
        sizeStyles[size],
        className
      )}
    >
      {label}
    </span>
  );
}
