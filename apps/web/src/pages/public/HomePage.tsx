import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Mic,
  Award,
  Layers,
  Sparkles,
  Volume2,
  Video,
  Play,
  Compass,
  ChevronDown,
  GraduationCap,
  Users
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
    color: 'from-indigo-500/20 to-purple-500/20'
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
    color: 'from-purple-500/20 to-pink-500/20'
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
    color: 'from-pink-500/20 to-indigo-500/20'
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
    color: 'from-indigo-500/20 to-cyan-500/20'
  }
];

export function HomePage() {
  const { t } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const speakGerman = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
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
    { q: t('home.faq.q1'), a: t('home.faq.a1') },
    { q: t('home.faq.q2'), a: t('home.faq.a2') },
    { q: t('home.faq.q3'), a: t('home.faq.a3') },
    { q: t('home.faq.q4'), a: t('home.faq.a4') }
  ];

  return (
    <div className="relative font-sans bg-[#030712] text-slate-100 selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* 0. CINEMATIC TOP PROGRESSION BAR */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(99,102,241,0.6)]"
      />

      {/* 1. HERO SECTION WITH 3D INTERACTIVE COCKPIT */}
      <section
        ref={heroRef}
        className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-hero-glow bg-mesh-dark"
      >
        {/* Subtle Ambient Background Radials */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818CF8]" />
                <span>{t('home.hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-[1.12]">
                {t('home.hero.titlePrefix')}{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent relative inline-block">
                  {t('home.hero.titleHighlight')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5">
                    <span>{t('home.hero.cta.start')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors backdrop-blur-sm">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>{t('home.hero.cta.courses')}</span>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/[0.08] text-left">
                <div>
                  <div className="text-2xl font-heading font-black text-white">100%</div>
                  <div className="text-xs font-semibold text-slate-400">Goethe-Prüfungskonform</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-white">A1–B2</div>
                  <div className="text-xs font-semibold text-slate-400">Vollständiger CEFR Pfad</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-black text-white">4.9/5</div>
                  <div className="text-xs font-semibold text-slate-400">Dozenten-Bewertung</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Authentic German Academy Photo Showcase */}
            <div className="lg:col-span-6 flex flex-col items-center relative">
              {/* Main Photo Showcase Container */}
              <div className="w-full max-w-lg relative">
                {/* Background ambient sapphire glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-4xl blur-xl opacity-30 -z-10" />

                {/* Photo Frame */}
                <div className="rounded-3xl sm:rounded-4xl overflow-hidden border border-white/15 bg-[#0B1325] shadow-2xl shadow-black/80 relative">
                  {/* German Flag Accent Ribbon at the top */}
                  <div className="h-1.5 w-full flex">
                    <div className="flex-1 bg-black" />
                    <div className="flex-1 bg-rose-600" />
                    <div className="flex-1 bg-amber-400" />
                  </div>

                  {/* High Quality German Image */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                    <img
                      src="/german-hero.jpg"
                      alt="Study German in Germany - Brandenburg Gate Berlin & Academic Immersion"
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                    />
                    {/* Gradient Overlay for Text Readability & Mood */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-black/30" />

                    {/* Top Location Pill */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                      <span>Berlin Campus & Online Classes</span>
                    </div>

                    {/* Top Right CEFR Pill */}
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-extrabold shadow-md border border-blue-400/30">
                      <span>CEFR A1–B2</span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#070D1A]/90 backdrop-blur-xl border border-white/10 shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-400 tracking-wide uppercase">
                          DeutschWelt Academy
                        </span>
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          ★ 4.9/5 (500+ Alumni)
                        </span>
                      </div>
                      <p className="text-sm font-heading font-black text-white leading-snug">
                        Your Direct Pathway to German University, Visa & Career Fluency
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300 border-t border-white/10">
                        <span className="flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Goethe-Zertifikat Prep
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Telc Deutsch B1/B2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Card Bottom Stats Strip */}
                  <div className="p-4 sm:p-5 bg-[#0B1325] border-t border-white/[0.08] grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-base sm:text-lg font-heading font-black text-white">99.2%</div>
                      <div className="text-[11px] font-medium text-slate-400">Exam Pass Rate</div>
                    </div>
                    <div className="border-x border-white/10">
                      <div className="text-base sm:text-lg font-heading font-black text-blue-400">60–75h</div>
                      <div className="text-[11px] font-medium text-slate-400">Per CEFR Level</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-heading font-black text-emerald-400">1-on-1</div>
                      <div className="text-[11px] font-medium text-slate-400">Faculty Mentors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GERMAN MASTERY TRAJECTORY (A1 -> B2) */}
      <section ref={journeyRef} className="py-24 bg-[#050B17] text-slate-100 relative overflow-hidden border-t border-b border-white/[0.08]">
        {/* Ambient Dark Mesh Lighting */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Der strukturierte Lernpfad</span>
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
              Die 4 Stufen zur vollständigen Sprachflüssigkeit
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Vom ersten Tag ohne Deutschkenntnisse bis zu professionellen Verhandlungen und
              Universitätsexamen nach offiziellem Goethe- & Telc-Rahmenplan.
            </p>
          </div>

          {/* Connected Progression Spine */}
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 opacity-25" />

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
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-black">
                          {phase.stage}
                        </span>
                        <span className="text-xs font-mono text-purple-300 font-bold">
                          {phase.subtitle}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                        {phase.title}
                      </h3>

                      <p className="text-sm text-slate-400 leading-relaxed">
                        {phase.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        {phase.skills.map((skill, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2 text-xs text-slate-300 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <Link
                          to={`/courses`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>Curriculum ansehen</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <span className="text-xs text-slate-500 font-mono">• {phase.hours}</span>
                      </div>
                    </div>

                    {/* Interactive Cinematic Stage Card */}
                    <div
                      className={`lg:col-span-6 ${
                        isEven ? 'lg:pl-8' : 'lg:col-start-1 lg:pr-8'
                      }`}
                    >
                      <div className="rounded-3xl bg-[#0B1325] border border-white/[0.08] p-6 sm:p-7 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 glow-card-hover">
                        <div
                          className={`absolute inset-0 bg-gradient-to-tr ${phase.color} opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity`}
                        />

                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-heading font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                              {phase.code}
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                              {phase.badge}
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#070D1A] border border-white/5 space-y-2">
                            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                              <span>Muster-Sprachprobe (Native Audio)</span>
                            </div>
                            <p className="text-sm font-heading font-bold text-white italic">
                              „{phase.sampleAudio}“
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => speakGerman(phase.sampleAudio)}
                              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Audio abspielen</span>
                            </button>

                            <span className="text-xs text-blue-300/80 font-mono italic">
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

      {/* 3. PLATFORM HIGHLIGHTS (Modern 4-Grid Cards) */}
      <section className="bg-[#030712] py-24 text-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
              {t('home.features.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
              {t('home.features.title')}
            </h2>
            <p className="text-sm text-slate-400">
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
                  className="rounded-3xl bg-[#0B1325]/80 hover:bg-[#0E172E] p-7 border border-white/[0.08] hover:border-blue-500/40 glow-card-hover flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white flex items-center justify-center mb-5 border border-blue-500/20 transition-all shadow-md shadow-indigo-500/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-white mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-heading font-black text-white tracking-tight">
            {t('home.faq.title')}
          </h2>
          <p className="text-sm text-slate-400">
            {t('home.faq.badge')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0B1325]/70 border border-white/[0.08] shadow-xs overflow-hidden transition-all hover:border-white/20"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-white hover:text-blue-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedFaq === idx ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-4xl bg-gradient-to-br from-[#0E172E] to-[#070D1A] text-white p-8 sm:p-14 shadow-2xl border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {t('home.cta.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white leading-tight">
              {t('home.cta.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {t('home.cta.subtitle')}
            </p>
          </div>

          <div className="z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/register">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-105">
                {t('home.cta.btn')}
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default HomePage;
