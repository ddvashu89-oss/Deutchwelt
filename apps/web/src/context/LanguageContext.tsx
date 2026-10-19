import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.vocabulary': 'Vocabulary Trainer',
    'nav.about': 'About Us',
    'nav.contact': 'Contact & Admissions',
    'nav.login': 'Sign In',
    'nav.register': 'Create Account',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Sign Out',
    'nav.lectures': 'Class Lectures & Files',

    // Content Gate
    'gate.title': 'Account Required to Access Learning Content',
    'gate.description': 'Please create a free DeutschWelt student account or sign in to access full course modules, video lectures, vocabulary flashcards, and speaking labs.',
    'gate.btn.register': 'Create Free Account',
    'gate.btn.login': 'Already have an account? Sign In',

    // Hero
    'hero.badge': 'CEFR Certified A1 to B2 German Academy',
    'hero.title': 'Master German with Precision and Academic Confidence',
    'hero.subtitle': 'Structured coaching designed for Goethe-Zertifikat and TestDaF success. Combining elite European pedagogy with interactive spaced-repetition and speech labs.',
    'hero.cta.start': 'Start Free Today',
    'hero.cta.courses': 'Explore Curriculum',

    // Registration Form
    'reg.title': 'Create Your DeutschWelt Account',
    'reg.subtitle': 'Join thousands of learners achieving Goethe-certified fluency.',
    'reg.firstName': 'First Name',
    'reg.lastName': 'Last Name',
    'reg.email': 'Email Address',
    'reg.mobile': 'Mobile Number',
    'reg.address': 'Residential Address (Street, City, Country)',
    'reg.password': 'Password (min. 8 characters)',
    'reg.confirmPassword': 'Confirm Password',
    'reg.level': 'Current German Level',
    'reg.goal': 'Primary Goal (e.g. University, Job, Goethe Exam)',
    'reg.terms': 'I agree to the Terms of Service & Privacy Policy',
    'reg.submit': 'Create Free Student Account',
    'reg.hasAccount': 'Already have an account? Sign in here'
  },
  de: {
    // Nav
    'nav.home': 'Startseite',
    'nav.courses': 'Kurse',
    'nav.vocabulary': 'Wortschatz-Trainer',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt & Beratung',
    'nav.login': 'Anmelden',
    'nav.register': 'Konto erstellen',
    'nav.dashboard': 'Übersicht',
    'nav.logout': 'Abmelden',
    'nav.lectures': 'Vorlesungen & Dateien',

    // Content Gate
    'gate.title': 'Konto erforderlich für Lerninhalte',
    'gate.description': 'Bitte erstellen Sie ein kostenloses DeutschWelt-Konto oder melden Sie sich an, um auf Kursmodule, Video-Vorlesungen, Wortschatz-Karten und das Sprachlabor zuzugreifen.',
    'gate.btn.register': 'Kostenloses Konto erstellen',
    'gate.btn.login': 'Bereits registriert? Anmelden',

    // Hero
    'hero.badge': 'Zertifizierte Deutsch-Akademie von A1 bis B2',
    'hero.title': 'Deutsch meistern mit Präzision und akademischer Exzellenz',
    'hero.subtitle': 'Strukturierte Vorbereitung auf Goethe-Zertifikat und TestDaF. Verbindet fundierte europäische Didaktik mit Spaced Repetition und Sprachlabor.',
    'hero.cta.start': 'Jetzt kostenlos starten',
    'hero.cta.courses': 'Lehrplan entdecken',

    // Registration Form
    'reg.title': 'Erstellen Sie Ihr DeutschWelt-Konto',
    'reg.subtitle': 'Schließen Sie sich Tausenden erfolgreichen Deutschlernern an.',
    'reg.firstName': 'Vorname',
    'reg.lastName': 'Nachname',
    'reg.email': 'E-Mail-Adresse',
    'reg.mobile': 'Handynummer / Mobilnummer',
    'reg.address': 'Wohnadresse (Straße, Stadt, Land)',
    'reg.password': 'Passwort (mind. 8 Zeichen)',
    'reg.confirmPassword': 'Passwort bestätigen',
    'reg.level': 'Aktuelles Sprachniveau',
    'reg.goal': 'Lernziel (z.B. Studium, Beruf, Goethe-Prüfung)',
    'reg.terms': 'Ich stimme den Nutzungsbedingungen & Datenschutzbestimmungen zu',
    'reg.submit': 'Kostenloses Konto anlegen',
    'reg.hasAccount': 'Haben Sie bereits ein Konto? Hier anmelden'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dw_language');
    return saved === 'de' ? 'de' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dw_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
