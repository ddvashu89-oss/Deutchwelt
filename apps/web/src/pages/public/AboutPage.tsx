import React from 'react';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardContent } from '../../components/ui/Card.js';
import { ShieldCheck, GraduationCap, Award, Globe, Users, HeartHandshake } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
          Unsere Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-gray-950 tracking-tight">
          Akademische Exzellenz trifft moderne EdTech
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          DeutschWelt Coaching schließt die Lücke zwischen oberflächlichen Vokabel-Apps und starren, teuren Sprachschulen. Wir begleiten Sie strukturiert vom ersten Wort bis zum Goethe-Zertifikat B2.
        </p>
      </div>

      {/* Vision Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-gray-950">Didaktische Präzision</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Wir vereinfachen das deutsche Kasus-System (Nominativ, Akkusativ, Dativ, Genitiv) mit intuitiven Farb- und Strukturmustern, sodass Grammatik sofort verständlich wird.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-mint/15 text-forest-900 border border-mint/20 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-gray-950">Goethe- & telc-Fokus</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Speziell konzipiert für Mediziner, Ingenieure, Studenten und Fachkräfte, die anerkannte CEFR-Nachweise für Studium, Arbeitsplatz oder Visum in Deutschland benötigen.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-gray-950">Persönliche Begleitung</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Moderne Algorithmen unterstützen das tägliche Üben, während erfahrene Dozenten Ihre Aussprache in Live-Seminaren individuell korrigieren.
          </p>
        </div>
      </div>

      {/* Story / Context */}
      <div className="bg-white rounded-4xl p-8 sm:p-12 border border-gray-200/80 shadow-xs space-y-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-950">
          Die Philosophie von DeutschWelt Coaching
        </h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            Deutsch ist eine logische, strukturierte und ausdrucksstarke Sprache. Dennoch brechen viele Lernende auf Niveau A1 oder A2 frustriert ab, weil standardisierte Quiz-Apps keine Zusammenhänge vermitteln und traditionelle Lehrbücher oft trocken und überladen wirken.
          </p>
          <p>
            Bei DeutschWelt setzen wir auf klare visuelle Leitlinien: Farbcodierte Artikel (der/die/das), kontextbezogene Beispielsätze mit Alltagsrelevanz und Audio-Sprechlabore, in denen Hemmungen vor dem freien Sprechen Schritt für Schritt abgebaut werden.
          </p>
          <p>
            Ob Studium an einer deutschen Spitzenuniversität, Karriere im Ingenieur- oder Gesundheitswesen oder der Start eines neuen Lebenskapitels in Deutschland, Österreich oder der Schweiz – wir ebnen Ihnen den Weg dorthin.
          </p>
        </div>
      </div>
    </div>
  );
}
