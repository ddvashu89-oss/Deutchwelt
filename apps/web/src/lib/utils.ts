import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGermanArticle(article: string): { label: string; bg: string; text: string; border: string } {
  const norm = article.toLowerCase();
  switch (norm) {
    case 'der':
      return { label: 'der', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' };
    case 'die':
      return { label: 'die', bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' };
    case 'das':
      return { label: 'das', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    case 'die (pl)':
    case 'plural':
      return { label: 'die (pl)', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
    default:
      return { label: '', bg: 'bg-gray-800/40', text: 'text-gray-300', border: 'border-gray-700/50' };
  }
}
