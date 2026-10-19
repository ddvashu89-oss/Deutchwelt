import { describe, it, expect } from 'vitest';
import { cn, formatGermanArticle } from '../lib/utils';

describe('Web Utility Functions', () => {
  it('combines class names correctly with cn()', () => {
    const result = cn('text-base', false && 'hidden', 'font-bold', undefined, 'p-4');
    expect(result).toBe('text-base font-bold p-4');
  });

  it('merges tailwind conflicts properly with twMerge in cn()', () => {
    const result = cn('p-2', 'p-4', 'text-red-500', 'text-blue-500');
    expect(result).toBe('p-4 text-blue-500');
  });

  it('formats German masculine article (der) correctly', () => {
    const styling = formatGermanArticle('der');
    expect(styling.label).toBe('der');
    expect(styling.bg).toContain('blue');
    expect(styling.text).toContain('blue');
  });

  it('formats German feminine article (die) correctly', () => {
    const styling = formatGermanArticle('die');
    expect(styling.label).toBe('die');
    expect(styling.bg).toContain('red');
    expect(styling.text).toContain('red');
  });

  it('formats German neuter article (das) correctly', () => {
    const styling = formatGermanArticle('das');
    expect(styling.label).toBe('das');
    expect(styling.bg).toContain('emerald');
    expect(styling.text).toContain('emerald');
  });

  it('formats German plural article (die (pl)) correctly', () => {
    const styling = formatGermanArticle('die (pl)');
    expect(styling.label).toBe('die (pl)');
    expect(styling.bg).toContain('amber');
    expect(styling.text).toContain('amber');
  });

  it('handles unknown article with neutral fallback', () => {
    const styling = formatGermanArticle('unknown');
    expect(styling.label).toBe('');
    expect(styling.bg).toContain('gray');
  });
});
