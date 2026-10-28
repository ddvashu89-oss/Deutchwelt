import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { GraduationCap, Award, HeartHandshake } from 'lucide-react';

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans text-slate-100">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          {t('about.badge')}
        </span>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Vision Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-[#0B1325] border border-white/[0.08] shadow-xl space-y-3 glow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-blue-400 flex items-center justify-center border border-indigo-500/20 shadow-md shadow-indigo-500/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white">{t('about.p1.title')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('about.p1.desc')}
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-[#0B1325] border border-white/[0.08] shadow-xl space-y-3 glow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-md shadow-purple-500/10">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white">{t('about.p2.title')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('about.p2.desc')}
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-[#0B1325] border border-white/[0.08] shadow-xl space-y-3 glow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/20 flex items-center justify-center shadow-md shadow-pink-500/10">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white">{t('about.p3.title')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('about.p3.desc')}
          </p>
        </div>
      </div>

      {/* Story / Context */}
      <div className="bg-[#0B1325] rounded-4xl p-8 sm:p-12 border border-white/[0.08] shadow-2xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Die Philosophie von DeutschWelt Coaching
        </h2>
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Deutsch ist eine logische, strukturierte und ausdrucksstarke Sprache. Dennoch brechen viele Lernende auf Niveau A1 oder A2 frustriert ab, weil standardisierte Quiz-Apps keine Zusammenhänge vermitteln und traditionelle Lehrbücher oft trocken und überladen wirken.
          </p>
          <p>
            Bei DeutschWelt setzen wir auf moderne intuitive Leitlinien: Farbcodierte Artikel (der/die/das), kontextbezogene Beispielsätze mit Alltagsrelevanz und Audio-Sprechlabore, in denen Hemmungen vor dem freien Sprechen Schritt für Schritt abgebaut werden.
          </p>
          <p>
            Ob Studium an einer deutschen Spitzenuniversität, Karriere im Ingenieur- oder Gesundheitswesen oder der Start eines neuen Lebenskapitels in Deutschland, Österreich oder der Schweiz – wir ebnen Ihnen den Weg dorthin.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
