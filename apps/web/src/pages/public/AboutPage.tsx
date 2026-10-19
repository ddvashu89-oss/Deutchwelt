import React from 'react';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardContent } from '../../components/ui/Card.js';
import { ShieldCheck, GraduationCap, Award, Globe, Users, HeartHandshake } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="uppercase font-bold tracking-wider">Our Mission</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Combining Academic Rigor with Modern EdTech
        </h1>
        <p className="text-base sm:text-lg text-dark-muted leading-relaxed">
          DeutschWelt was established to solve a critical problem: language learning apps are often too superficial for real examinations, while traditional institutes are rigid and expensive.
        </p>
      </div>

      {/* Vision Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-navy-100 text-navy flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy">Pedagogical Integrity</h3>
          <p className="text-xs text-dark-muted leading-relaxed">
            Our courses do not shy away from the German grammatical case system (Nominativ, Akkusativ, Dativ, Genitiv). We teach you the principles behind the language from day one.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-germanRed-100 text-germanRed flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy">Goethe & telc Exam Focus</h3>
          <p className="text-xs text-dark-muted leading-relaxed">
            Designed for students moving to Germany for higher education, nursing/medical careers, and EU Blue Card visas who need recognized CEFR certifications.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy">Human Coaching</h3>
          <p className="text-xs text-dark-muted leading-relaxed">
            Technology powers your daily practice, but experienced instructors provide the qualitative review your speaking and writing skills require.
          </p>
        </Card>
      </div>

      {/* Story / Context */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/90 shadow-card space-y-6">
        <h2 className="text-2xl font-bold text-navy">The DeutschWelt Philosophy</h2>
        <div className="space-y-4 text-sm text-dark leading-relaxed">
          <p>
            German is a beautiful, logical, and structured language. Yet millions of learners drop out at A1 or A2 because standard flashcard apps fail to teach them how the language actually works, while textbooks make simple concepts feel needlessly intimidating.
          </p>
          <p>
            At DeutschWelt, we introduce visual article distinctions (blue for masculine, red for feminine, green for neuter), intuitive two-way prepositions, and audio recording labs that let learners speak without fear of making mistakes in public.
          </p>
          <p>
            Whether your dream is studying engineering at TU Munich, working as a healthcare specialist in Berlin, or building a new life in Germany, we provide the pathway to help you succeed.
          </p>
        </div>
      </div>
    </div>
  );
}
