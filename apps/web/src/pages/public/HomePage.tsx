import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { ArticleBadge } from '../../components/ui/ArticleBadge.js';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  BookOpen,
  Mic,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Volume2,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  RotateCw,
  Users,
  Video,
  FileCheck2,
  Clock,
  Play
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext.js';

export function HomePage() {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Interactive Vocabulary Showcase
  const previewWords = {
    A1: { german: 'Kaffee', article: 'der', english: 'Coffee', hindi: 'कॉफ़ी', example: 'Ich trinke morgens gerne einen heißen Kaffee.', ipa: '/ˈkafe/' },
    A2: { german: 'Wohnung', article: 'die', english: 'Apartment', hindi: 'अपार्टमेंट', example: 'Meine Wohnung hat drei helle Zimmer in Berlin.', ipa: '/ˈvoːnʊŋ/' },
    B1: { german: 'Erfolg', article: 'der', english: 'Success', hindi: 'सफलता', example: 'Konstanz und Übung sind die Schlüssel zum Erfolg.', ipa: '/ɛɐ̯ˈfɔlk/' },
    B2: { german: 'Voraussetzung', article: 'die', english: 'Prerequisite', hindi: 'पूर्वशर्त', example: 'B2 ist eine formale Voraussetzung für die Arbeitsaufnahme.', ipa: '/ˈfoːɐ̯ʔaʊ̯szɛtsʊŋ/' }
  };

  const currentWord = previewWords[activeTab];

  const levels = [
    {
      code: 'A1',
      title: 'Anfänger (Breakthrough)',
      cefr: 'Goethe-Zertifikat A1',
      desc: 'Lernen Sie das deutsche Alphabet, Phonetik, Begrüßungen sowie die Grundlagen von Nominativ & Akkusativ von Grund auf.',
      hours: '60 Stunden',
      slug: 'deutsch-a1-beginner-intensiv',
      badge: 'Start from Zero'
    },
    {
      code: 'A2',
      title: 'Grundstufe (Elementary)',
      cefr: 'Goethe-Zertifikat A2',
      desc: 'Beherrschen Sie den Dativ, Wechselpräpositionen und die Vergangenheitsform (Perfekt) für flüssige Alltagsgespräche.',
      hours: '75 Stunden',
      slug: 'deutsch-a2-elementary-dialoge',
      badge: 'Konversation'
    },
    {
      code: 'B1',
      title: 'Mittelstufe (Autonomy)',
      cefr: 'Goethe-Zertifikat B1 / DTZ',
      desc: 'Offizielle Einbürgerungs- & Niederlassungsstufe. Höfliche Bitten mit Konjunktiv II, Passiv und formelle Korrespondenz.',
      hours: '90 Stunden',
      slug: 'deutsch-b1-intermediate-mastery',
      badge: 'Beruf & Einbürgerung'
    },
    {
      code: 'B2',
      title: 'Fortgeschritten (Fluency)',
      cefr: 'Goethe-Zertifikat B2 / TestDaF',
      desc: 'Fachsprache für Beruf, Ingenieurwesen, Medizin und Hochschulstudium. Komplexe Diskussionen und Nominalstil.',
      hours: '120 Stunden',
      slug: 'deutsch-b2-professional-fluency',
      badge: 'Fach- & Universität'
    }
  ];

  const features = [
    {
      icon: Video,
      title: 'Live-Klassen via Google Meet & Zoom',
      desc: 'Interaktive Kleingruppen-Seminare mit Goethe-zertifizierten Dozenten. Direkte Aussprache-Korrektur und Sprechübungen in Echtzeit.'
    },
    {
      icon: Mic,
      title: 'KI-gestütztes Sprachlabor',
      desc: 'Sprechen Sie deutsche Sätze ein und erhalten Sie sekundenschnelle Auswertung zu Intonation, Grammatik und Vokal-Aussprache.'
    },
    {
      icon: Layers,
      title: 'Leitner Spaced Repetition (SRS)',
      desc: 'Wissenschaftlich erprobter 5-Boxen Wortschatztrainer. Vokabeln wandern automatisch in Ihr Langzeitgedächtnis.'
    },
    {
      icon: Award,
      title: 'Offizielle Abschlusszertifikate',
      desc: 'Nach Bestehen jeder CEFR-Stufe erhalten Sie ein verifizierbares PDF-Zertifikat mit Ausweisnummer und Notenspiegel.'
    }
  ];

  const faqs = [
    {
      q: 'Kann ich starten, wenn ich noch nie ein Wort Deutsch gesprochen habe?',
      a: 'Absolut! Unser A1-Kurs beginnt bei null mit Phonetik, Lautbildung und grundlegenden Begrüßungen. Sie benötigen keinerlei Vorkenntnisse.'
    },
    {
      q: 'Sind die Kurse auf offizielle Goethe- & Telc-Prüfungen ausgerichtet?',
      a: 'Ja. Unser gesamter Lehrplan folgt exakt dem Gemeinsamen Europäischen Referenzrahmen (GER). Jede Einheit enthält gezielte Prüfungsmodule für Lesen, Hören, Schreiben und Sprechen.'
    },
    {
      q: 'Wie laufen die Live-Sitzungen ab?',
      a: 'Über Ihr Dashboard können Sie mit einem Klick dem Google Meet- oder Zoom-Klassenraum beitreten. Der Dozent leitet interaktive Sprechübungen und teilt Arbeitsblätter.'
    },
    {
      q: 'Wie erhalte ich mein Abschlusszertifikat?',
      a: 'Sobald Sie alle Lektionen und das Abschluss-Quiz Ihrer Kursstufe absolviert haben, generiert das System Ihr persönliches Zertifikat, das Sie sofort als PDF herunterladen können.'
    }
  ];

  return (
    <div className="space-y-24 pb-24 font-sans selection:bg-mint selection:text-forest-950">
      {/* ============================================================== */}
      {/* 1. CINEMATIC HERO SECTION                                      */}
      {/* ============================================================== */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-canvas to-canvas">
        {/* Subtle Ambient Mint/Forest Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-mint/15 to-forest-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 text-forest-900 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                DeutschWelt Coaching • GER A1 bis B2
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-950 tracking-tight leading-[1.12]">
                Meistern Sie Deutsch mit <br />
                <span className="text-forest-800">
                  Präzisions-Coaching.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Strukturierte Deutschkurse nach Goethe- & Telc-Standard. Vom ersten Vokabel-Laut auf A1 bis zur professionellen Verhandlungskompetenz auf B2.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <span>Kostenlos starten</span>
                    <ArrowRight className="w-4 h-4 text-mint" />
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <BookOpen className="w-4 h-4 text-forest-800" />
                    <span>Kursübersicht (A1–B2)</span>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-gray-200/80 text-left">
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">100%</div>
                  <div className="text-xs font-medium text-gray-500">Goethe-Prüfungskonform</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">A1–B2</div>
                  <div className="text-xs font-medium text-gray-500">Vollständiger CEFR Pfad</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">4.9/5</div>
                  <div className="text-xs font-medium text-gray-500">Dozenten-Bewertung</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Vocabulary Flashcard */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-md bg-white rounded-4xl p-6 sm:p-7 shadow-xl border border-gray-200/80 relative space-y-5">
                {/* Level Tabs */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex space-x-1.5">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setActiveTab(lvl);
                          setIsFlipped(false);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          activeTab === lvl
                            ? 'bg-forest-900 text-white shadow-xs'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-100">
                    Live-Demo
                  </span>
                </div>

                {/* Flip Card Canvas */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer min-h-[220px] rounded-3xl bg-canvas p-6 border border-gray-200/60 flex flex-col justify-between hover:border-forest-400 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <ArticleBadge article={currentWord.article} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(!isFlipped);
                      }}
                      className="p-1.5 rounded-full bg-white text-gray-500 group-hover:text-forest-900 shadow-xs border border-gray-200/60 transition-transform group-hover:rotate-180 duration-500"
                      title="Karte umdrehen"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isFlipped ? (
                    <div className="my-auto space-y-1 text-center">
                      <div className="text-3xl font-heading font-black text-gray-950 tracking-tight">
                        {currentWord.german}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {currentWord.ipa}
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto space-y-1.5 text-center">
                      <div className="text-2xl font-heading font-bold text-forest-900">
                        {currentWord.english}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {currentWord.hindi}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="italic truncate max-w-[240px]">"{currentWord.example}"</span>
                    <span className="text-[10px] font-bold text-forest-700">Tippen zum Drehen</span>
                  </div>
                </div>

                <Link
                  to="/vocabulary"
                  className="w-full py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Layers className="w-4 h-4 text-forest-800" />
                  <span>Vollen Wortschatz-Trainer öffnen →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CEFR PATHWAY (A1, A2, B1, B2)                               */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Lehrplan nach GER-Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-950 tracking-tight">
            Schritt für Schritt zur Deutsch-Kompetenz
          </h2>
          <p className="text-sm text-gray-500">
            Vier aufeinander aufbauende Stufen. Klar strukturiert für Alltag, Studium und Beruf in Deutschland, Österreich & Schweiz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl) => (
            <div
              key={lvl.code}
              className="rounded-3xl bg-white p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-forest-900 text-mint font-heading font-black text-lg flex items-center justify-center shadow-xs">
                    {lvl.code}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
                    {lvl.badge}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-gray-950 mb-1">
                  {lvl.title}
                </h3>
                <p className="text-xs font-semibold text-forest-700 mb-3">
                  {lvl.cefr}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{lvl.hours}</span>
                <Link
                  to={`/courses/${lvl.slug}`}
                  className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-forest-900 group-hover:text-white flex items-center justify-center text-gray-700 transition-colors border border-gray-200"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. PLATFORM HIGHLIGHTS (Cinematic 4-Grid)                       */}
      {/* ============================================================== */}
      <section className="bg-forest-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-mint bg-mint/15 px-3 py-1 rounded-full border border-mint/20">
              Modernste Lernmethoden
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
              Warum DeutschWelt Coaching?
            </h2>
            <p className="text-sm text-emerald-100/70">
              Die Kombination aus erfahrenen Dozenten, Spaced Repetition und interaktivem Sprechtraining führt schneller zum Ziel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl bg-forest-900/80 p-6 border border-forest-800 flex flex-col justify-between hover:bg-forest-900 transition-all"
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-mint/15 text-mint flex items-center justify-center mb-5 border border-mint/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-white mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-emerald-100/70 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. FAQ ACCORDION                                               */}
      {/* ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-heading font-black text-gray-950 tracking-tight">
            Häufig gestellte Fragen (FAQ)
          </h2>
          <p className="text-sm text-gray-500">
            Alles Wissenswerte zu Kursablauf, Prüfungen und Teilnahme.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-gray-200/80 shadow-xs overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-gray-950 hover:text-forest-900"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    expandedFaq === idx ? 'rotate-180 text-forest-900' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. CALL TO ACTION FOOTER BANNER                                */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-4xl bg-forest-900 text-white p-8 sm:p-14 shadow-xl border border-forest-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-mint">
              Bereit für den Durchbruch?
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white">
              Starten Sie noch heute Ihre Reise zur deutschen Sprachflüssigkeit.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70">
              Registrieren Sie sich kostenlos und erhalten Sie sofortigen Zugriff auf die ersten A1-Lektionen und den Wortschatz-Trainer.
            </p>
          </div>

          <div className="z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/register">
              <button className="px-8 py-3.5 rounded-full bg-mint hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md transition-all">
                Jetzt kostenlos anmelden
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
