import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Globe } from 'lucide-react';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-xl bg-gray-100/90 p-1 border border-gray-200/80 shadow-xs ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-navy text-white shadow-xs'
            : 'text-dark-muted hover:text-dark'
        }`}
        title="Switch to English"
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('de')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'de'
            ? 'bg-germanRed text-white shadow-xs'
            : 'text-dark-muted hover:text-dark'
        }`}
        title="Auf Deutsch wechseln"
      >
        <span>DE</span>
      </button>
    </div>
  );
}
