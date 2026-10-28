import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  Pause,
  Compass,
  Radio,
  ChevronDown,
  GraduationCap,
  Users
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext.js';

interface CoachingPhrase {
  level: 'A1' | 'A2' | 'B1' | 'B2';
  german: string;
  ipa: string;
  english: string;
  hindi: string;
  context: string;
  dozent: string;
  score: number;
  phoneticsScore: number;
  intonationScore: number;
}

const COACHING_PHRASES: Record<'A1' | 'A2' | 'B1' | 'B2', CoachingPhrase> = {
  A1: {
    level: 'A1',
    german: 'Guten Tag! Mein Name ist Rahul und ich lerne Deutsch.',
    ipa: '/ˈɡuːtn̩ taːk | maɪ̯n ˈnaːmə ɪst ˈʁaːhʊl ʊnt ɪç ˈlɛʁnə dɔɪ̯tʃ/',
    english: 'Good day! My name is Rahul and I am learning German.',
    hindi: 'नमस्ते! मेरा नाम राहुल है और मैं जर्मन सीख रहा हूँ।',
    context: 'Erste Begrüßung & Selbstvorstellung',
    dozent: 'Frau Dr. Weber (Berlin)',
    score: 98,
    phoneticsScore: 97,
    intonationScore: 99
  },
  A2: {
    level: 'A2',
    german: 'Könnten Sie mir bitte sagen, wo der nächste Bahnhof liegt?',
    ipa: '/ˈkœntn̩ ziː miːɐ̯ ˈbɪtə ˈzaːɡŋ̍ | voː deːɐ̯ ˈnɛːçstə ˈbaːnhoːf liːkt/',
    english: 'Could you please tell me where the nearest train station is located?',
    hindi: 'क्या आप मुझे बता सकते हैं कि निकटतम रेलवे स्टेशन कहाँ है?',
    context: 'Höfliche Alltagsorientierung mit Dativ',
    dozent: 'Herr Prof. Schneider (München)',
    score: 96,
    phoneticsScore: 95,
    intonationScore: 98
  },
  B1: {
    level: 'B1',
    german: 'Ich würde mich freuen, wenn Sie meine Bewerbung berücksichtigen.',
    ipa: '/ɪç ˈvʏʁdə mɪç ˈfʁɔɪ̯ən | vɛn ziː ˈmaɪ̯nə bəˈvɛʁbʊŋ bəˈʁʏkˌzɪçtɪɡŋ̍/',
    english: 'I would be pleased if you would consider my application.',
    hindi: 'यदि आप मेरे आवेदन पर विचार करेंगे तो मुझे अत्यंत खुशी होगी।',
    context: 'Offizielle Korrespondenz & Konjunktiv II',
    dozent: 'Frau Müller (Goethe-Prüferin)',
    score: 99,
    phoneticsScore: 98,
    intonationScore: 100
  },
  B2: {
    level: 'B2',
    german: 'Eine fundierte Sprachkompetenz ist die unabdingbare Voraussetzung für den Erfolg.',
    ipa: '/ˈaɪ̯nə fʊnˈdiːɐ̯tə ˈʃpʁaːxˌkɔmpətɛnt͡s ɪst diː ˈʊnʔapˌdɪŋbaːʁə foːɐ̯ˈʔaʊ̯sˌzɛtsʊŋ/',
    english: 'Sound language competence is an indispensable prerequisite for success.',
    hindi: 'सफलता के लिए एक मजबूत भाषाई दक्षता अनिवार्य पूर्वशर्त है।',
    context: 'Fachsprache, Nominalstil & Verhandlungskompetenz',
    dozent: 'Dr. Klaus Becker (Frankfurt)',
    score: 97,
    phoneticsScore: 96,
    intonationScore: 99
  }
};

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
  const [activeLevel, setActiveLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero Scroll Perspective Parallax
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroCockpitRotateX = useTransform(heroScroll, [0, 1], [0, 14]);
  const heroCockpitScale = useTransform(heroScroll, [0, 1], [1, 0.94]);
  const heroCockpitY = useTransform(heroScroll, [0, 1], [0, 80]);
  const heroCockpitOpacity = useTransform(heroScroll, [0, 0.85, 1], [1, 0.85, 0.5]);

  const satelliteTopY = useTransform(heroScroll, [0, 1], [0, -45]);
  const satelliteBottomY = useTransform(heroScroll, [0, 1], [0, 55]);

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

  const currentPhrase = COACHING_PHRASES[activeLevel];

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

            {/* Right Column: 3D Immersion Cockpit */}
            <div className="lg:col-span-6 flex flex-col items-center relative [perspective:1200px]">
              {/* Floating Satellite 1 */}
              <motion.div
                style={{ y: satelliteTopY }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute -top-7 -left-4 sm:-left-8 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0B1325]/95 backdrop-blur-md border border-white/10 shadow-2xl text-slate-200 text-xs font-bold"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                <Video className="w-4 h-4 text-blue-400" />
                <span>Nächste Live-Klasse in 14 Min • Google Meet & Zoom</span>
              </motion.div>

              {/* Floating Satellite 2 */}
              <motion.div
                style={{ y: satelliteBottomY }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -bottom-7 -right-4 sm:-right-6 z-30 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0E172E]/95 backdrop-blur-md border border-blue-500/30 shadow-2xl text-white text-xs font-bold"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white text-xs font-bold">99.2% Bestehensquote</div>
                  <div className="text-[10px] text-slate-400">Goethe A1-B2 & DTZ</div>
                </div>
              </motion.div>

              {/* MAIN COCKPIT: Coaching Cockpit Card */}
              <motion.div
                style={{
                  rotateX: heroCockpitRotateX,
                  scale: heroCockpitScale,
                  y: heroCockpitY,
                  opacity: heroCockpitOpacity,
                  transformStyle: 'preserve-3d'
                }}
                className="w-full max-w-lg rounded-3xl bg-[#0B1325]/95 border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(99,102,241,0.15)] text-white p-6 sm:p-7 relative overflow-hidden space-y-6 backdrop-blur-xl"
              >
                {/* Background Ambient Mesh Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Cockpit Top Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 relative z-10">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <span className="text-[11px] font-mono font-medium text-slate-400 ml-2">
                      live_coaching_hub.de
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                    <Radio className="w-3 h-3 animate-pulse text-blue-400" />
                    <span>Berlin Studio Live</span>
                  </div>
                </div>

                {/* Level Selector Tabs */}
                <div className="flex items-center justify-between gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/[0.08] relative z-10">
                  {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => {
                    const isSelected = activeLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          setActiveLevel(lvl);
                          if (isPlayingAudio && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            setIsPlayingAudio(false);
                          }
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md font-black scale-[1.02]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{lvl}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />}
                      </button>
                    );
                  })}
                </div>

                {/* Active Phrase & Real-Time Waveform Stage */}
                <div className="rounded-2xl bg-[#070D1A] border border-white/[0.08] p-5 space-y-4 relative z-10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {currentPhrase.context}
                    </span>
                    <span className="text-slate-400 font-medium">{currentPhrase.dozent}</span>
                  </div>

                  {/* German Phrase Highlight */}
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl font-heading font-bold text-white leading-snug">
                      „{currentPhrase.german}“
                    </p>
                    <p className="text-[11px] font-mono text-purple-300/80 tracking-wide">
                      {currentPhrase.ipa}
                    </p>
                  </div>

                  {/* Translations */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-xs text-slate-300 font-medium">
                      <span className="text-blue-400 font-bold mr-1.5">EN:</span>
                      {currentPhrase.english}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      <span className="text-amber-300 font-bold mr-1.5">HI:</span>
                      {currentPhrase.hindi}
                    </div>
                  </div>

                  {/* Interactive Audio Player & Dynamic Soundwave */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      onClick={() => speakGerman(currentPhrase.german)}
                      className="px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-transform active:scale-95 shrink-0"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4 fill-current animate-pulse" />
                          <span>{t('home.cockpit.playing')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{t('home.cockpit.listenAudio')}</span>
                        </>
                      )}
                    </button>

                    {/* Animated Audio Equalizer Bars */}
                    <div className="flex items-end gap-1 h-7 flex-1 justify-end px-2">
                      {[14, 26, 18, 32, 22, 28, 16, 24, 30, 20, 27, 15].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={
                            isPlayingAudio
                              ? {
                                  height: [h * 0.4, h, h * 0.3, h * 0.9, h * 0.5],
                                  backgroundColor: ['#6366F1', '#A855F7', '#EC4899', '#6366F1']
                                }
                              : { height: Math.max(6, h * 0.35), backgroundColor: '#312E81' }
                          }
                          transition={
                            isPlayingAudio
                              ? {
                                  repeat: Infinity,
                                  duration: 0.8 + (i % 4) * 0.2,
                                  ease: 'easeInOut'
                                }
                              : { duration: 0.3 }
                          }
                          className="w-1 rounded-full min-h-[4px]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time AI Speech Scoring Telemetry */}
                <div className="grid grid-cols-3 gap-2.5 relative z-10 pt-1">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08] text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Phonetik</div>
                    <div className="text-base font-heading font-black text-blue-400">
                      {currentPhrase.phoneticsScore}%
                    </div>
                    <div className="text-[9px] text-blue-300 font-semibold">Exakt</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08] text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Intonation</div>
                    <div className="text-base font-heading font-black text-purple-400">
                      {currentPhrase.intonationScore}%
                    </div>
                    <div className="text-[9px] text-purple-300 font-semibold">Natürlich</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08] text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Goethe Score</div>
                    <div className="text-base font-heading font-black text-pink-400">
                      {currentPhrase.score}/100
                    </div>
                    <div className="text-[9px] text-pink-300 font-semibold">Sehr gut</div>
                  </div>
                </div>

                {/* Footer Action inside Cockpit */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>342 Lerner aktuell in Live-Übungen</span>
                  </div>
                  <Link
                    to="/vocabulary"
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Lernlabor öffnen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
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
