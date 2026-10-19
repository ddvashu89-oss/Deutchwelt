import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGermanArticle(article: string): { label: string; bg: string; text: string; border: string } {
  const norm = article.toLowerCase();
  switch (norm) {
    case 'der':
      return { label: 'der', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'die':
      return { label: 'die', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'das':
      return { label: 'das', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'die (pl)':
    case 'plural':
      return { label: 'die (pl)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    default:
      return { label: '', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}
