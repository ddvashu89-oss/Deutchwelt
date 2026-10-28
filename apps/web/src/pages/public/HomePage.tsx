import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
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
  Users,
  Video,
  Play,
  Compass,
  Check
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext.js';

const CEFR_JOURNEY = [
  {
    code: 'A1',
    stage: 'Phase 01',
    title: 'Akustisches Fundament & Phonetik',
    subtitle: 'Goethe-Zertifikat A1 (Start Deutsch 1)',
    hours: '60 Intensiv-Stunden',
    description:
      'Lernen Sie das deutsche Lautsystem, die Umlaute (ä, ö, ü), das Alphabet und erste Satzstrukturen. Vom fehlerfreien Grüßen bis zum Bestellen im Restaurant.',
    badge: 'Von Null starten',
    skills: ['Umlaute & Phonetik', 'Nominativ & Akkusativ', 'Zahlen & Uhrzeiten', 'Alltägliche Höflichkeit'],
    quote: '„Der wichtigste Schritt ist der erste Laut.“',
    sampleAudio: 'Guten Tag, wie geht es Ihnen? Ich komme aus Indien und wohne in Berlin.',
    color: 'from-emerald-500/20 to-mint/20'
  },
  {
    code: 'A2',
    stage: 'Phase 02',
    title: 'Dialogische Dynamik & Alltagsautonomie',
    subtitle: 'Goethe-Zertifikat A2 (Fit in Deutsch)',
    hours: '75 Intensiv-Stunden',
    description:
      'Vertiefen Sie den Dativ, Wechselpräpositionen und die Vergangenheitsform (Perfekt). Führen Sie flüssige Gespräche beim Arzt, bei Behörden und im Freundeskreis.',
    badge: 'Konversations-Sprint',
    skills: ['Dativ & Wechselpräpositionen', 'Perfekt & Präteritum', 'Wegbeschreibungen', 'Einfache Meinungsäußerung'],
    quote: '„Aus einzelnen Wörtern werden echte Geschichten.“',
    sampleAudio: 'Gestern bin ich mit dem Zug nach München gefahren und habe meine Freunde besucht.',
    color: 'from-teal-500/20 to-emerald-500/20'
  },
  {
    code: 'B1',
    stage: 'Phase 03',
    title: 'Autonomie & Der Einbürgerungs-Standard',
    subtitle: 'Goethe-Zertifikat B1 / DTZ',
    hours: '90 Intensiv-Stunden',
    description:
      'Die entscheidende Stufe für Niederlassungserlaubnis & deutsche Staatsbürgerschaft. Meistern Sie Konjunktiv II, Passiv, Nebensätze mit ‚obwohl‘ und ‚weil‘ sowie formelle Beschwerden.',
    badge: 'Niederlassung & Beruf',
    skills: ['Konjunktiv II (Wünsche & Höflichkeit)', 'Passiv-Formen', 'Formelle E-Mails & Briefe', 'Prüfungssimulation DTZ'],
    quote: '„Die offizielle Eintrittskarte für Ihr Leben in Deutschland.“',
    sampleAudio: 'Wenn ich mehr Zeit hätte, würde ich gerne ein Auslandspraktikum in Frankfurt absolvieren.',
    color: 'from-forest-500/20 to-teal-500/20'
  },
  {
    code: 'B2',
    stage: 'Phase 04',
    title: 'Professionelle Eloquenz & Verhandlungssicherheit',
    subtitle: 'Goethe-Zertifikat B2 / TestDaF',
    hours: '120 Intensiv-Stunden',
    description:
      'Fachsprache für Ingenieure, Ärzte, IT-Spezialisten und Universitätszulassungen. Komplexe Argumentationen, Nominalstil, Nuancen und spontane Fachdiskussionen.',
    badge: 'C-Level & Universität',
    skills: ['Nominalstil & Fachterminologie', 'Spontane Fachdebatten', 'Wissenschaftliches Schreiben', 'Verhandlungstaktik'],
    quote: '„Verhandeln und überzeugen auf Augenhöhe mit Muttersprachlern.“',
    sampleAudio: 'Hinsichtlich der vorgeschlagenen Optimierung möchte ich auf wirtschaftliche Rahmenbedingungen hinweisen.',
    color: 'from-mint/20 to-emerald-400/20'
  }
];

export function HomePage() {
  const { t } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Scroll Progress for Hairline Top Indicator
  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Native Speech Synthesis for Authentic German Audio
  const speakGerman = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer simulation
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const features = [
    {
      icon: Video,
      title: t('home.features.f1.title'),
      desc: t('home.features.f1.desc')
    },
    {
      icon: Layers,
      title: t('home.features.f2.title'),
      desc: t('home.features.f2.desc')
    },
    {
      icon: Mic,
      title: t('home.features.f3.title'),
      desc: t('home.features.f3.desc')
    },
    {
      icon: Award,
      title: t('home.features.f4.title'),
      desc: t('home.features.f4.desc')
    }
  ];

  const faqs = [
    {
      q: t('home.faq.q1'),
      a: t('home.faq.a1')
    },
    {
      q: t('home.faq.q2'),
      a: t('home.faq.a2')
    },
    {
      q: t('home.faq.q3'),
      a: t('home.faq.a3')
    },
    {
      q: t('home.faq.q4'),
      a: t('home.faq.a4')
    }
  ];

  return (
    <div className="relative font-sans selection:bg-mint selection:text-forest-950 overflow-x-hidden">
      {/* ============================================================== */}
      {/* 0. CINEMATIC SCROLL PROGRESSION BAR                            */}
      {/* ============================================================== */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-800 via-mint to-forest-500 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(46,206,134,0.6)]"
      />

      {/* ============================================================== */}
      {/* 1. CINEMATIC HERO SECTION WITH 3D INTERACTIVE COCKPIT          */}
      {/* ============================================================== */}
      <section
        ref={heroRef}
        className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-canvas to-canvas"
      >
        {/* Ambient Shifting Glow Radiance */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-mint/20 via-forest-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-mint/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-forest-50 border border-forest-200/80 text-forest-900 text-xs font-bold tracking-wide shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse shadow-[0_0_8px_#2ECE86]" />
                <span>{t('home.hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-950 tracking-tight leading-[1.12]">
                {t('home.hero.titlePrefix')}{' '}
                <span className="text-forest-800 relative inline-block">
                  {t('home.hero.titleHighlight')}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-mint/60 -z-10"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
                    <span>{t('home.hero.cta.start')}</span>
                    <ArrowRight className="w-4 h-4 text-mint" />
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <BookOpen className="w-4 h-4 text-forest-800" />
                    <span>{t('home.hero.cta.courses')}</span>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-gray-200/80 text-left">
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">100%</div>
                  <div className="text-xs font-semibold text-gray-500">Goethe-Prüfungskonform</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">A1–B2</div>
                  <div className="text-xs font-semibold text-gray-500">Vollständiger CEFR Pfad</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-gray-950">4.9/5</div>
                  <div className="text-xs font-semibold text-gray-500">Dozenten-Bewertung</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: High-Resolution German Landmark Showcase (Static, Non-Animated) */}
            <div className="lg:col-span-6 flex flex-col items-center relative">
              {/* Photo Card Container - Fully Static, No Hover Motion or Tilt */}
              <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200/90 shadow-xl overflow-hidden">
                {/* German Tricolor Accent Ribbon */}
                <div className="h-1.5 w-full flex">
                  <div className="flex-1 bg-black" />
                  <div className="flex-1 bg-[#D94747]" />
                  <div className="flex-1 bg-[#F59E0B]" />
                </div>

                {/* Hero Photo Section */}
                <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src="/german-hero.jpg"
                    alt="Deutsches Coaching — Brandenburger Tor Berlin"
                    className="w-full h-full object-cover select-none"
                    loading="eager"
                  />
                  {/* Subtle Gradient Shadow for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/20 to-transparent pointer-events-none" />

                  {/* Top Left Static Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md text-forest-900 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-mint" />
                    <span>Goethe & Telc Vorbereitung</span>
                  </div>

                  {/* Top Right Static Badge */}
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-950/90 backdrop-blur-md border border-mint/30 shadow-md text-white text-xs font-bold">
                    <Compass className="w-3.5 h-3.5 text-mint" />
                    <span>Berlin & Deutschland</span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-forest-900 tracking-wide uppercase">
                        DeutschWelt Akademie
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        ★ 4.9/5 (500+ Alumni)
                      </span>
                    </div>
                    <p className="text-sm font-heading font-black text-gray-950 leading-snug">
                      Ihr direkter Weg zu Studium, Visum & Karriere-Flüssigkeit in Deutschland
                    </p>
                    <div className="flex items-center justify-between pt-1.5 text-[11px] text-gray-600 border-t border-gray-200/80">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" /> A1 bis B2 Intensivkurse
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" /> Muttersprachliche Dozenten
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo Card Bottom Stats Strip */}
                <div className="p-4 sm:p-5 bg-forest-50/70 border-t border-forest-100 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-base sm:text-lg font-heading font-black text-forest-950">99.2%</div>
                    <div className="text-[11px] font-semibold text-gray-600">Bestehensquote</div>
                  </div>
                  <div className="border-x border-forest-200/70">
                    <div className="text-base sm:text-lg font-heading font-black text-forest-800">60–120h</div>
                    <div className="text-[11px] font-semibold text-gray-600">Pro CEFR-Stufe</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-heading font-black text-forest-950">1-zu-1</div>
                    <div className="text-[11px] font-semibold text-gray-600">Phonetik-Coaching</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CINEMATIC SCROLL-BASED GERMAN MASTERY TRAJECTORY (A1 -> B2) */}
      {/* ============================================================== */}
      <section ref={journeyRef} className="py-24 bg-forest-950 text-white relative overflow-hidden">
        {/* Ambient Dark Forest Lighting */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-mint/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-forest-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint/15 border border-mint/30 text-mint text-xs font-bold uppercase tracking-widest"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Der filmische Lernpfad</span>
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
              Die 4 Stufen zur vollständigen Sprachflüssigkeit
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed">
              Vom ersten Tag ohne Deutschkenntnisse bis zu professionellen Verhandlungen und
              Universitätsexamen nach offiziellem Goethe- & Telc-Rahmenplan.
            </p>
          </div>

          {/* Connected Scroll Progression Spine */}
          <div className="relative">
            {/* Vertical Center Spine Line (Desktop) */}
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-mint via-forest-500 to-emerald-400 opacity-25" />

            <div className="space-y-16 lg:space-y-24">
              {CEFR_JOURNEY.map((phase, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={phase.code}
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                      isEven ? '' : 'lg:grid-flow-dense'
                    }`}
                  >
                    {/* Narrative Description Card */}
                    <div
                      className={`lg:col-span-6 space-y-4 ${
                        isEven ? 'lg:pr-8 text-left' : 'lg:col-start-7 lg:pl-8 text-left'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-mint/20 border border-mint/40 text-mint text-xs font-black">
                          {phase.stage}
                        </span>
                        <span className="text-xs font-mono text-emerald-300 font-bold">
                          {phase.subtitle}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                        {phase.title}
                      </h3>

                      <p className="text-sm text-emerald-100/80 leading-relaxed">
                        {phase.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        {phase.skills.map((skill, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2 text-xs text-emerald-200/90 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <Link
                          to={`/courses`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-mint hover:text-emerald-300 transition-colors"
                        >
                          <span>Curriculum ansehen</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <span className="text-xs text-gray-400 font-mono">• {phase.hours}</span>
                      </div>
                    </div>

                    {/* Interactive Cinematic Stage Card */}
                    <div
                      className={`lg:col-span-6 ${
                        isEven ? 'lg:pl-8' : 'lg:col-start-1 lg:pr-8'
                      }`}
                    >
                      <div className="rounded-3xl bg-[#08130F] border border-emerald-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden group hover:border-mint/60 transition-all">
                        {/* Shifting Gradient Backdrop */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-tr ${phase.color} opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity`}
                        />

                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="w-12 h-12 rounded-2xl bg-mint text-forest-950 font-heading font-black text-xl flex items-center justify-center shadow-lg">
                              {phase.code}
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/10">
                              {phase.badge}
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                              <Volume2 className="w-3.5 h-3.5 text-mint" />
                              <span>Muster-Sprachprobe (Native Audio)</span>
                            </div>
                            <p className="text-sm font-heading font-bold text-white italic">
                              „{phase.sampleAudio}“
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => speakGerman(phase.sampleAudio)}
                              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-mint hover:text-forest-950 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Audio abspielen</span>
                            </button>

                            <span className="text-xs text-emerald-300/70 font-mono italic">
                              {phase.quote}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. PLATFORM HIGHLIGHTS (Cinematic 4-Grid with Entrance Physics) */}
      {/* ============================================================== */}
      <section className="bg-canvas py-24 text-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800 bg-forest-50 px-3.5 py-1.5 rounded-full border border-forest-200">
              {t('home.features.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-950 tracking-tight">
              {t('home.features.title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-3xl bg-white p-7 border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-xl hover:border-forest-400 transition-all group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-900 group-hover:bg-forest-900 group-hover:text-mint flex items-center justify-center mb-5 border border-forest-100 transition-colors shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-gray-950 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. FAQ ACCORDION                                               */}
      {/* ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-heading font-black text-gray-950 tracking-tight">
            {t('home.faq.title')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('home.faq.badge')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-gray-200/90 shadow-xs overflow-hidden transition-all"
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
      {/* 5. CINEMATIC CALL TO ACTION FOOTER BANNER                      */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-4xl bg-[#0A1612] text-white p-8 sm:p-14 shadow-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-mint flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              {t('home.cta.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white leading-tight">
              {t('home.cta.title')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70">
              {t('home.cta.subtitle')}
            </p>
          </div>

          <div className="z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/register">
              <button className="px-8 py-4 rounded-full bg-mint hover:bg-emerald-400 text-forest-950 font-black text-sm shadow-xl transition-all transform hover:scale-105">
                {t('home.cta.btn')}
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
