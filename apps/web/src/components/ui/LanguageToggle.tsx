import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-md shadow-xs ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        title="Auf Deutsch wechseln"
      >
        <span>DE</span>
      </button>
    </div>
  );
}

export default LanguageToggle;
