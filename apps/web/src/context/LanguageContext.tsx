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
    // Navigation & Announcement
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
    'nav.ribbon.badge': 'Intensive Courses 2026',
    'nav.ribbon.text': 'Goethe & Telc Preparation A1–B2 • Small Groups & 1-on-1 Coaching.',
    'nav.ribbon.cta': 'Assess Level Now →',
    'nav.mobile.dashboard': 'Go to Dashboard',
    'nav.mobile.startFree': 'Start Free',

    // Content Gate
    'gate.title': 'Account Required to Access Learning Content',
    'gate.description': 'Please create a free DeutschWelt student account or sign in to access full course modules, video lectures, vocabulary flashcards, and speaking labs.',
    'gate.btn.register': 'Create Free Account',
    'gate.btn.login': 'Already have an account? Sign In',

    // Auth - Login
    'login.title': 'Sign In to DeutschWelt',
    'login.subtitle': 'Seamlessly continue your German learning journey from A1 to B2.',
    'login.email': 'Email Address',
    'login.emailPlaceholder': 'your.email@example.com',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot password?',
    'login.submit': 'Sign In Now',
    'login.submitting': 'Signing in...',
    'login.noAccount': "Don't have an account yet?",
    'login.registerNow': 'Register for free',

    // Auth - Register
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
    'reg.submitting': 'Creating Account...',
    'reg.hasAccount': 'Already have an account? Sign in here',

    // Home - Hero Section
    'home.hero.badge': 'DeutschWelt Coaching • CEFR A1 to B2',
    'home.hero.titlePrefix': 'Master German with',
    'home.hero.titleHighlight': 'Precision Coaching.',
    'home.hero.subtitle': 'Structured German courses aligned with Goethe & Telc standards. Live seminars with native instructors, real-time AI speech lab, and verifiable completion certificates.',
    'home.hero.cta.start': 'Start Free Today',
    'home.hero.cta.courses': 'Explore Curriculum',
    'home.hero.pill1': 'Live Online Cohorts',
    'home.hero.pill2': 'Goethe Exam Pass Guarantee',
    'home.hero.pill3': '5-Box Spaced Repetition',

    // Home - Cockpit Card
    'home.cockpit.title': 'German Coaching Cockpit',
    'home.cockpit.speakingBadge': 'Speaking Lab Ready',
    'home.cockpit.listenAudio': 'Listen to audio',
    'home.cockpit.playing': 'Playing sample...',
    'home.cockpit.grammar': 'Key Grammar Focus',
    'home.cockpit.pronunciation': 'Pronunciation Accuracy',
    'home.cockpit.fluency': 'Fluency Score',
    'home.cockpit.feedbackTitle': 'Native German Coach Feedback',
    'home.cockpit.feedbackText': 'Clear articulation and correct verb-second position. Pitch inflection matches natural spoken German.',

    // Home - Features
    'home.features.badge': 'Why DeutschWelt?',
    'home.features.title': 'A Complete Learning Ecosystem for Fluency',
    'home.features.subtitle': 'Designed for university applicants, medical professionals, engineers, and career specialists seeking accredited German certification.',
    'home.features.f1.title': 'Live Interactive Seminars',
    'home.features.f1.desc': 'Small cohorts taught by native Goethe-certified instructors with interactive Q&A and personalized corrections.',
    'home.features.f2.title': 'Leitner 5-Box SRS Trainer',
    'home.features.f2.desc': 'Scientifically optimized spaced repetition to ensure vocabulary moves permanently into your long-term memory.',
    'home.features.f3.title': 'Audio Speaking Lab',
    'home.features.f3.desc': 'Record speaking prompts directly in your browser and receive multi-criteria rubric feedback on pronunciation and grammar.',
    'home.features.f4.title': 'Accredited Certificates',
    'home.features.f4.desc': 'Earn verifiable CEFR certificates (A1 to B2) with unique verification numbers for university and visa applications.',

    // Home - Levels Roadmap
    'home.levels.badge': 'CEFR Curriculum',
    'home.levels.title': 'From Complete Beginner to Fluent Professional',
    'home.levels.subtitle': 'Choose your level and start practicing immediately.',
    'home.levels.cta': 'View Level Syllabus',

    // Home - FAQ
    'home.faq.badge': 'Frequently Asked Questions',
    'home.faq.title': 'Everything you need to know',
    'home.faq.q1': 'How long does it take from A1 to B2?',
    'home.faq.a1': 'With our intensive coaching cohorts, learners typically progress through each CEFR level in 6 to 8 weeks with 4 to 6 study hours weekly.',
    'home.faq.q2': 'Are DeutschWelt certificates officially recognized?',
    'home.faq.a2': 'Yes, our courses follow the strict CEFR guidelines of the Goethe-Institut and Telc. Each certificate features a tamper-proof verification ID.',
    'home.faq.q3': 'What equipment do I need for the Speaking Lab?',
    'home.faq.a3': 'A standard computer, tablet, or smartphone with a built-in microphone and modern web browser (Chrome, Safari, Firefox). No software installation required.',
    'home.faq.q4': 'How do I receive my completion certificate?',
    'home.faq.a4': 'Once you complete all lessons and quizzes for your level, the system generates your personalized PDF certificate instantly.',

    // Home - Bottom CTA
    'home.cta.badge': 'Enrollment Open for 2026',
    'home.cta.title': 'Ready to Achieve German Fluency?',
    'home.cta.subtitle': 'Join our structured coaching batches or learn at your own pace with interactive tools.',
    'home.cta.btn': 'Create Your Free Account',

    // Courses Page
    'courses.badge': 'CEFR Curriculum A1 to B2',
    'courses.title': 'Certified German Courses',
    'courses.subtitle': 'Structured curricula designed for Goethe-Zertifikat and TestDaF success.',
    'courses.filter.all': 'All Levels',
    'courses.viewCourse': 'View Course Syllabus',
    'courses.duration': 'Duration',
    'courses.units': 'Units',
    'courses.lessons': 'Lessons',
    'courses.level': 'Level',
    'courses.priceFree': 'Free with Account',

    // About Page
    'about.badge': 'Our Mission',
    'about.title': 'Academic Excellence Meets Modern EdTech',
    'about.subtitle': 'DeutschWelt Coaching bridges the gap between superficial flashcard apps and rigid, overpriced language schools. We guide you from your very first word to your Goethe-Zertifikat B2.',
    'about.p1.title': 'Didactic Precision',
    'about.p1.desc': 'We demystify the German case system (Nominative, Accusative, Dative, Genitive) with intuitive visual patterns so grammar clicks immediately.',
    'about.p2.title': 'Goethe & Telc Focus',
    'about.p2.desc': 'Tailored for medical professionals, engineers, students, and skilled workers requiring recognized CEFR certification for university or visa purposes.',
    'about.p3.title': 'Active Speaking Mastery',
    'about.p3.desc': 'We prioritize active conversational competence from day one through guided speaking lab submissions and live native coach review.',

    // Contact Page
    'contact.badge': 'Contact & Admissions',
    'contact.title': 'We are here to support your German journey',
    'contact.subtitle': 'Have questions about course placement, exam preparation, or batch schedules? Get in touch with our academic advisors.',
    'contact.name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.phone': 'Phone Number (Optional)',
    'contact.targetLevel': 'Target CEFR Level',
    'contact.message': 'Your Message',
    'contact.submit': 'Send Enquiry',
    'contact.submitting': 'Sending...',
    'contact.successTitle': 'Enquiry Received!',
    'contact.successDesc': 'Thank you for reaching out. Our academic advisors will contact you within 24 hours.',
    'contact.office': 'Berlin Campus & Online',
    'contact.hours': 'Mon - Fri: 9:00 - 18:00 CET',

    // Vocabulary Trainer
    'vocab.badge': 'Leitner Spaced Repetition',
    'vocab.title': 'Interactive Vocabulary Trainer',
    'vocab.subtitle': 'Master high-frequency German words with color-coded gender articles and scientifically spaced review intervals.',
    'vocab.box': 'Box',
    'vocab.flipHint': 'Click card to flip and view English translation',
    'vocab.correct': 'I Knew This (+1 Box)',
    'vocab.incorrect': 'Need Review (Reset to Box 1)',
    'vocab.mastered': 'Words Mastered',
    'vocab.learning': 'In Progress',
    'vocab.sound': 'Pronunciation',

    // Dashboard & Sidebar
    'dash.menu.dashboard': 'Dashboard',
    'dash.menu.tasks': 'Tasks & Courses',
    'dash.menu.calendar': 'Calendar & Materials',
    'dash.menu.analytics': 'Analytics & Practice',
    'dash.menu.team': 'Team & Batches',
    'dash.menu.settings': 'Settings',
    'dash.menu.help': 'Help & FAQ',
    'dash.menu.logout': 'Sign Out',
    'dash.searchPlaceholder': 'Search task, course, or lesson...',
    'dash.app.title': 'Download our Mobile App',
    'dash.app.subtitle': 'Learn flexibly on the go',
    'dash.app.btn': 'Download',
    'dash.app.alert': 'DeutschWelt Mobile App for iOS and Android is in active beta preview!',

    // Student Dashboard
    'sdash.title': 'Dashboard',
    'sdash.subtitle': 'Welcome back,',
    'sdash.subtitleSuffix': '! Track your German learning journey from A1 to B2.',
    'sdash.viewCert': 'View Certificate',
    'sdash.continueLearning': '+ Continue Learning',
    'sdash.activeCourse': 'Active Course',
    'sdash.completed': 'completed',
    'sdash.streakLabel': 'Daily Streak',
    'sdash.streakUnit': 'Days',
    'sdash.streakHint': 'Stay active every day',
    'sdash.studyTime': 'Study Time Today',
    'sdash.studyGoalSuffix': 'min left to daily goal',
    'sdash.certificates': 'Certificates',
    'sdash.certUnit': 'Official',
    'sdash.certHint': 'Goethe & Telc certified',
    'sdash.analyticsTitle': 'Study Analytics',
    'sdash.analyticsWeek': 'This Week',
    'sdash.activeLearningDay': 'Active Learning Day',
    'sdash.restDay': 'Rest Day',
    'sdash.remindersTitle': 'Reminders & Live Class',
    'sdash.today': 'Today',
    'sdash.liveCoach': 'Goethe B1 Live Coaching',
    'sdash.joinSession': '🎥 Join Live Session',
    'sdash.timerLabel': 'Live Time Tracker',
    'sdash.timerRunning': 'Running',
    'sdash.timerPaused': 'Paused',
    'sdash.timerSession': 'Session: German B1 • Grammar & Conversation',
    'sdash.pauseTimer': 'Pause Timer',
    'sdash.startTimer': 'Start Timer',
    'sdash.lessonsTitle': 'Upcoming Lessons',
    'sdash.viewAll': 'View all →',
    'sdash.noSubmissions': 'All lessons completed!',

    // Teacher Dashboard
    'tdash.title': 'Teacher Workspace',
    'tdash.subtitle': 'Manage your classes, review audio recordings, and upload video lectures.',
    'tdash.startLive': '🎥 Start Live Class',
    'tdash.uploadVideo': '+ Upload Video',
    'tdash.activeBatches': 'Active Learning Groups',
    'tdash.goexams': 'Goethe Exams',
    'tdash.students': 'Students Supervised',
    'tdash.studentsUnit': 'Students',
    'tdash.activeWeek': '100% active this week',
    'tdash.pendingSubs': 'Pending Submissions',
    'tdash.pendingUnit': 'To Review',
    'tdash.pendingHint': 'Incl. 2 audio speaking recordings',
    'tdash.avgScore': 'Average Score',
    'tdash.avgUnit': 'Excellent',
    'tdash.avgHint': '+4% above Goethe benchmark',
    'tdash.submissionsTitle': 'Open Assignments & Audio Recordings',
    'tdash.submissionsSubtitle': 'Students are waiting for your feedback and pronunciation corrections',
    'tdash.viewAllSubs': 'View all →',
    'tdash.participant': 'Student:',
    'tdash.submitted': 'Submitted on',
    'tdash.review': 'Review',
    'tdash.noSubs': 'No pending submissions. All assignments graded!',
    'tdash.liveTitle': 'Google Meet Live Conference',
    'tdash.liveDesc': 'Start the conference for your participants. Whiteboard and screen sharing are active.',
    'tdash.openMeet': 'Open Google Meet Room',
    'tdash.uploadTitle': 'Upload Video Lecture',
    'tdash.uploadDesc': 'Upload a video lesson directly to the local uploads folder',
    'tdash.lecTitle': 'Lecture Title',
    'tdash.lecTitlePlaceholder': 'e.g. Lesson 14: Relative Clauses with Prepositions',
    'tdash.cefrLevel': 'CEFR Level',
    'tdash.videoFile': 'Video File (MP4 / WebM)',
    'tdash.cancel': 'Cancel',
    'tdash.uploadPublish': 'Upload & Publish',
    'tdash.saving': 'Saving...',

    // Admin Dashboard
    'adash.title': 'Admin Control Centre',
    'adash.status': 'System Online',
    'adash.subtitle': 'Platform telemetry, user accounts, and course management for the DeutschWelt Academy.',
    'adash.addCourse': '+ Add Course',
    'adash.inviteTeacher': '+ Invite Teacher',
    'adash.totalStudents': 'Enrolled Students',
    'adash.activeStudents': 'Active Students (30d)',
    'adash.teachers': 'Teachers',
    'adash.courses': 'Active Courses',
    'adash.manageStu': 'Manage Students',
    'adash.teachers2': 'Teachers',
    'adash.curriculum': 'Curriculum',
    'adash.requests': 'Enquiries',
    'adash.chartReg': 'Student Registrations',
    'adash.chartRegSub': 'New registrations in the last 6 months',
    'adash.liveData': 'Live Data',
    'adash.chartCefr': 'CEFR Level Distribution',
    'adash.chartCefrSub': 'Students by proficiency level',
    'adash.a1b2': 'A1 to B2',

    // Footer
    'footer.tagline': 'DeutschWelt Coaching is your premier academy for German language proficiency under the Common European Framework of Reference (CEFR A1 to B2).',
    'footer.colCourses': 'Course Levels',
    'footer.colTools': 'Learning Tools',
    'footer.colAcademy': 'Academy',
    'footer.a1': 'A1 Beginner (Start from Zero)',
    'footer.a2': 'A2 Elementary (Conversation)',
    'footer.b1': 'B1 Intermediate (Career & Daily Life)',
    'footer.b2': 'B2 Advanced (Goethe-Zertifikat)',
    'footer.examPrep': 'Exam Preparation',
    'footer.srs': 'Vocabulary Trainer (SRS)',
    'footer.speakingLab': 'Speaking Lab',
    'footer.liveClasses': 'Live Classes (Zoom/Meet)',
    'footer.flashcards': 'Leitner Flashcard System',
    'footer.mentorship': '1-on-1 Coach Mentorship',
    'footer.about': 'About DeutschWelt',
    'footer.contact': 'Contact & Admissions',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Notice',
    'footer.rights': 'All rights reserved.',
    'footer.certNote': 'Certified German courses according to Goethe & Telc standards.'
  },
  de: {
    // Navigation & Announcement
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
    'nav.ribbon.badge': 'Intensivkurse 2026',
    'nav.ribbon.text': 'Goethe & Telc Vorbereitung A1–B2 • Kleine Gruppen & 1-zu-1 Coaching.',
    'nav.ribbon.cta': 'Jetzt Einstufen →',
    'nav.mobile.dashboard': 'Zum Dashboard',
    'nav.mobile.startFree': 'Kostenlos starten',

    // Content Gate
    'gate.title': 'Konto erforderlich für Lerninhalte',
    'gate.description': 'Bitte erstellen Sie ein kostenloses DeutschWelt-Konto oder melden Sie sich an, um auf Kursmodule, Video-Vorlesungen, Wortschatz-Karten und das Sprachlabor zuzugreifen.',
    'gate.btn.register': 'Kostenloses Konto erstellen',
    'gate.btn.login': 'Bereits registriert? Anmelden',

    // Auth - Login
    'login.title': 'Anmelden bei DeutschWelt',
    'login.subtitle': 'Setzen Sie Ihren Deutschkurs von A1 bis B2 nahtlos fort.',
    'login.email': 'E-Mail-Adresse',
    'login.emailPlaceholder': 'ihre.email@example.com',
    'login.password': 'Passwort',
    'login.forgotPassword': 'Passwort vergessen?',
    'login.submit': 'Jetzt Anmelden',
    'login.submitting': 'Wird angemeldet...',
    'login.noAccount': 'Noch kein Konto?',
    'login.registerNow': 'Kostenlos registrieren',

    // Auth - Register
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
    'reg.submitting': 'Konto wird erstellt...',
    'reg.hasAccount': 'Haben Sie bereits ein Konto? Hier anmelden',

    // Home - Hero Section
    'home.hero.badge': 'DeutschWelt Coaching • GER A1 bis B2',
    'home.hero.titlePrefix': 'Meistern Sie Deutsch mit',
    'home.hero.titleHighlight': 'Präzisions-Coaching.',
    'home.hero.subtitle': 'Strukturierte Deutschkurse nach Goethe- & Telc-Standard. Live-Seminare mit muttersprachlichen Dozenten, Echtzeit-KI-Sprachlabor und verifizierbare Abschlusszertifikate.',
    'home.hero.cta.start': 'Kostenlos starten',
    'home.hero.cta.courses': 'Lehrplan entdecken',
    'home.hero.pill1': 'Live Online-Gruppen',
    'home.hero.pill2': 'Goethe-Bestehensgarantie',
    'home.hero.pill3': '5-Box Leitner-System',

    // Home - Cockpit Card
    'home.cockpit.title': 'Deutsches Coaching-Cockpit',
    'home.cockpit.speakingBadge': 'Sprachlabor Aktiv',
    'home.cockpit.listenAudio': 'Aussprache anhören',
    'home.cockpit.playing': 'Wird abgespielt...',
    'home.cockpit.grammar': 'Grammatik-Schwerpunkt',
    'home.cockpit.pronunciation': 'Aussprache-Präzision',
    'home.cockpit.fluency': 'Flüssigkeits-Wert',
    'home.cockpit.feedbackTitle': 'Feedback des Dozenten',
    'home.cockpit.feedbackText': 'Klare Artikulation und fehlerfreie Verbzweitstellung. Satzmelodie entspricht natürlichem Deutsch.',

    // Home - Features
    'home.features.badge': 'Warum DeutschWelt?',
    'home.features.title': 'Ein vollständiges Lernökosystem für echte Sprachkompetenz',
    'home.features.subtitle': 'Konzipiert für Studienbewerber, Mediziner, Ingenieure und Fachkräfte, die zertifizierte Deutschkenntnisse benötigen.',
    'home.features.f1.title': 'Live-Interaktive Seminare',
    'home.features.f1.desc': 'Kleine Gruppen mit muttersprachlichen Goethe-zertifizierten Dozenten, interaktivem Q&A und individuellen Korrekturen.',
    'home.features.f2.title': 'Leitner 5-Box Vokabeltrainer',
    'home.features.f2.desc': 'Wissenschaftlich optimiertes Spaced Repetition System für dauerhaftes Behalten des Wortschatzes.',
    'home.features.f3.title': 'Audio-Sprachlabor',
    'home.features.f3.desc': 'Nehmen Sie Sprachübungen direkt im Browser auf und erhalten Sie detailliertes Feedback zu Aussprache und Grammatik.',
    'home.features.f4.title': 'Anerkannte Abschlusszertifikate',
    'home.features.f4.desc': 'Erhalten Sie verifizierbare CEFR-Zertifikate (A1 bis B2) mit individueller Prüfnummer für Universität und Visum.',

    // Home - Levels Roadmap
    'home.levels.badge': 'GER Lehrplan',
    'home.levels.title': 'Vom Anfänger bis zur verhandlungssicheren Sprachkompetenz',
    'home.levels.subtitle': 'Wählen Sie Ihre Kursstufe und starten Sie sofort mit dem Training.',
    'home.levels.cta': 'Lehrplan ansehen',

    // Home - FAQ
    'home.faq.badge': 'Häufig gestellte Fragen',
    'home.faq.title': 'Alles, was Sie wissen müssen',
    'home.faq.q1': 'Wie lange dauert es von A1 bis B2?',
    'home.faq.a1': 'In unseren Intensivgruppen absolvieren Lernende eine GER-Stufe typischerweise in 6 bis 8 Wochen bei 4 bis 6 Wochenstunden Lernaufwand.',
    'home.faq.q2': 'Sind DeutschWelt-Zertifikate offiziell anerkannt?',
    'home.faq.a2': 'Ja, unsere Curricula orientieren sich strikt am GER sowie den Vorgaben des Goethe-Instituts und Telc. Jedes Zertifikat verfügt über eine fälschungssichere Prüf-ID.',
    'home.faq.q3': 'Welche Ausrüstung benötige ich für das Sprachlabor?',
    'home.faq.a3': 'Ein Standard-PC, Laptop, Tablet oder Smartphone mit Mikrofon und einem modernen Browser (Chrome, Safari, Firefox). Keine Zusatzsoftware erforderlich.',
    'home.faq.q4': 'Wie erhalte ich mein Abschlusszertifikat?',
    'home.faq.a4': 'Sobald Sie alle Lektionen und das Abschluss-Quiz Ihrer Kursstufe absolviert haben, generiert das System Ihr persönliches PDF-Zertifikat sofort zum Download.',

    // Home - Bottom CTA
    'home.cta.badge': 'Anmeldungen für 2026 geöffnet',
    'home.cta.title': 'Bereit, fließend Deutsch zu sprechen?',
    'home.cta.subtitle': 'Schließen Sie sich unseren Coaching-Gruppen an oder lernen Sie in Ihrem eigenen Tempo.',
    'home.cta.btn': 'Kostenloses Konto anlegen',

    // Courses Page
    'courses.badge': 'Lehrplan A1 bis B2',
    'courses.title': 'Zertifizierte Deutschkurse',
    'courses.subtitle': 'Strukturierte Lehrpläne für Ihren Erfolg bei Goethe-Zertifikat und TestDaF.',
    'courses.filter.all': 'Alle Stufen',
    'courses.viewCourse': 'Lehrplan ansehen',
    'courses.duration': 'Dauer',
    'courses.units': 'Einheiten',
    'courses.lessons': 'Lektionen',
    'courses.level': 'Stufe',
    'courses.priceFree': 'Kostenlos mit Account',

    // About Page
    'about.badge': 'Unsere Mission',
    'about.title': 'Akademische Exzellenz trifft moderne EdTech',
    'about.subtitle': 'DeutschWelt Coaching schließt die Lücke zwischen oberflächlichen Vokabel-Apps und starren, teuren Sprachschulen. Wir begleiten Sie strukturiert vom ersten Wort bis zum Goethe-Zertifikat B2.',
    'about.p1.title': 'Didaktische Präzision',
    'about.p1.desc': 'Wir vereinfachen das deutsche Kasus-System (Nominativ, Akkusativ, Dativ, Genitiv) mit intuitiven Farbmustern, sodass Grammatik sofort verständlich wird.',
    'about.p2.title': 'Goethe- & Telc-Fokus',
    'about.p2.desc': 'Speziell konzipiert für Mediziner, Ingenieure, Studenten und Fachkräfte, die anerkannte CEFR-Nachweise für Studium, Arbeitsplatz oder Visum in Deutschland benötigen.',
    'about.p3.title': 'Aktive Sprechkompetenz',
    'about.p3.desc': 'Wir legen ab Tag eins den Fokus auf aktives Sprechen durch Audio-Übungen im Sprachlabor und persönliche Korrekturen durch muttersprachliche Coaches.',

    // Contact Page
    'contact.badge': 'Kontakt & Beratung',
    'contact.title': 'Wir unterstützen Sie auf Ihrem Weg zur Deutsch-Kompetenz',
    'contact.subtitle': 'Haben Sie Fragen zur Einstufung, Prüfungsvorbereitung oder Terminen? Schreiben Sie uns.',
    'contact.name': 'Vollständiger Name',
    'contact.email': 'E-Mail-Adresse',
    'contact.phone': 'Telefonnummer (Optional)',
    'contact.targetLevel': 'Angestrebte Kursstufe',
    'contact.message': 'Ihre Nachricht',
    'contact.submit': 'Anfrage absenden',
    'contact.submitting': 'Wird gesendet...',
    'contact.successTitle': 'Anfrage erfolgreich versendet!',
    'contact.successDesc': 'Vielen Dank für Ihre Nachricht. Unsere Studienberater melden sich innerhalb von 24 Stunden bei Ihnen.',
    'contact.office': 'Berlin Campus & Online',
    'contact.hours': 'Mo - Fr: 9:00 - 18:00 Uhr',

    // Vocabulary Trainer
    'vocab.badge': 'Leitner Spaced Repetition',
    'vocab.title': 'Interaktiver Wortschatz-Trainer',
    'vocab.subtitle': 'Meistern Sie den deutschen Wortschatz mit Farbcodierung der Artikel und wissenschaftlich optimierten Wiederholungsintervallen.',
    'vocab.box': 'Kasten',
    'vocab.flipHint': 'Klicken zum Umdrehen und englische Übersetzung ansehen',
    'vocab.correct': 'Gewusst (+1 Kasten)',
    'vocab.incorrect': 'Nicht gewusst (Zurück auf 1)',
    'vocab.mastered': 'Gemeisterte Wörter',
    'vocab.learning': 'In Bearbeitung',
    'vocab.sound': 'Aussprache',

    // Dashboard & Sidebar
    'dash.menu.dashboard': 'Übersicht',
    'dash.menu.tasks': 'Aufgaben & Kurse',
    'dash.menu.calendar': 'Materialien & Termine',
    'dash.menu.analytics': 'Wortschatz & Übungen',
    'dash.menu.team': 'Sprechen & Gruppen',
    'dash.menu.settings': 'Einstellungen',
    'dash.menu.help': 'Hilfe & FAQ',
    'dash.menu.logout': 'Abmelden',
    'dash.searchPlaceholder': 'Aufgabe oder Lektion suchen...',
    'dash.app.title': 'Laden Sie unsere App',
    'dash.app.subtitle': 'Lernen Sie flexibel unterwegs',
    'dash.app.btn': 'Herunterladen',
    'dash.app.alert': 'DeutschWelt Mobile App für iOS und Android befindet sich im Beta-Preview!',

    // Student Dashboard
    'sdash.title': 'Dashboard',
    'sdash.subtitle': 'Willkommen zurück,',
    'sdash.subtitleSuffix': '! Verfolgen Sie Ihren Deutschkurs von A1 bis B2.',
    'sdash.viewCert': 'Zertifikat ansehen',
    'sdash.continueLearning': '+ Weiterlernen',
    'sdash.activeCourse': 'Aktiver Kurs',
    'sdash.completed': 'abgeschlossen',
    'sdash.streakLabel': 'Lernserie (Streak)',
    'sdash.streakUnit': 'Tage',
    'sdash.streakHint': 'Täglich aktiv bleiben',
    'sdash.studyTime': 'Lernzeit heute',
    'sdash.studyGoalSuffix': 'Min bis Tagesziel',
    'sdash.certificates': 'Zertifikate',
    'sdash.certUnit': 'Offiziell',
    'sdash.certHint': 'Goethe & Telc konform',
    'sdash.analyticsTitle': 'Study Analytics',
    'sdash.analyticsWeek': 'Diese Woche',
    'sdash.activeLearningDay': 'Aktiver Lerntag',
    'sdash.restDay': 'Ruhetag',
    'sdash.remindersTitle': 'Reminders & Live Class',
    'sdash.today': 'Heute',
    'sdash.liveCoach': 'Goethe B1 Live Coaching',
    'sdash.joinSession': '🎥 Live Session beitreten',
    'sdash.timerLabel': 'Live Time Tracker',
    'sdash.timerRunning': 'Läuft',
    'sdash.timerPaused': 'Pausiert',
    'sdash.timerSession': 'Sitzung: Deutsch B1 • Grammatik & Konversation',
    'sdash.pauseTimer': 'Pause Timer',
    'sdash.startTimer': 'Start Timer',
    'sdash.lessonsTitle': 'Nächste Lektionen',
    'sdash.viewAll': 'Alle ansehen →',
    'sdash.noSubmissions': 'Alle Lektionen abgeschlossen!',

    // Teacher Dashboard
    'tdash.title': 'Dozenten-Workspace',
    'tdash.subtitle': 'Verwalten Sie Ihre Klassen, prüfen Sie Audio-Aufnahmen und laden Sie Video-Lektionen hoch.',
    'tdash.startLive': '🎥 Live-Klasse starten',
    'tdash.uploadVideo': '+ Video hochladen',
    'tdash.activeBatches': 'Aktive Lerngruppen',
    'tdash.goexams': 'Goethe Prüfungen',
    'tdash.students': 'Betreute Teilnehmer',
    'tdash.studentsUnit': 'Studenten',
    'tdash.activeWeek': '100% aktiv diese Woche',
    'tdash.pendingSubs': 'Offene Abgaben',
    'tdash.pendingUnit': 'Zur Korrektur',
    'tdash.pendingHint': 'Inkl. 2 Audio-Sprechaufnahmen',
    'tdash.avgScore': 'Durchschnittsnote',
    'tdash.avgUnit': 'Sehr gut',
    'tdash.avgHint': '+4% über Goethe Benchmark',
    'tdash.submissionsTitle': 'Offene Hausaufgaben & Audio-Aufnahmen',
    'tdash.submissionsSubtitle': 'Studenten warten auf Ihr Feedback und Aussprache-Korrektur',
    'tdash.viewAllSubs': 'Alle ansehen →',
    'tdash.participant': 'Teilnehmer:',
    'tdash.submitted': 'Eingereicht am',
    'tdash.review': 'Bewerten',
    'tdash.noSubs': 'Keine ausstehenden Abgaben. Alle Aufgaben wurden bewertet!',
    'tdash.liveTitle': 'Google Meet Live-Konferenz',
    'tdash.liveDesc': 'Starten Sie die Konferenz für Ihre Teilnehmer. Whiteboard und Bildschirmfreigabe sind aktiv.',
    'tdash.openMeet': 'Google Meet Raum öffnen',
    'tdash.uploadTitle': 'Video-Vorlesung hochladen',
    'tdash.uploadDesc': 'Laden Sie eine Videolektion direkt in den lokalen Speicherordner',
    'tdash.lecTitle': 'Titel der Vorlesung',
    'tdash.lecTitlePlaceholder': 'z.B. Lektion 14: Relativsätze mit Präpositionen',
    'tdash.cefrLevel': 'CEFR-Niveau',
    'tdash.videoFile': 'Videodatei (MP4 / WebM)',
    'tdash.cancel': 'Abbrechen',
    'tdash.uploadPublish': 'Hochladen & Veröffentlichen',
    'tdash.saving': 'Wird gespeichert...',

    // Admin Dashboard
    'adash.title': 'Admin-Zentrale',
    'adash.status': 'System Online',
    'adash.subtitle': 'Plattform-Telemetrie, Benutzerkonten und Kursverwaltung der DeutschWelt Akademie.',
    'adash.addCourse': '+ Kurs anlegen',
    'adash.inviteTeacher': '+ Dozent einladen',
    'adash.totalStudents': 'Eingeschriebene Studenten',
    'adash.activeStudents': 'Aktive Studenten (30T)',
    'adash.teachers': 'Lehrende',
    'adash.courses': 'Aktive Kurse',
    'adash.manageStu': 'Studenten verwalten',
    'adash.teachers2': 'Lehrkräfte',
    'adash.curriculum': 'Lehrplan',
    'adash.requests': 'Anfragen',
    'adash.chartReg': 'Studentenregistrierungen',
    'adash.chartRegSub': 'Neuanmeldungen der letzten 6 Monate',
    'adash.liveData': 'Live-Daten',
    'adash.chartCefr': 'CEFR-Niveau Verteilung',
    'adash.chartCefrSub': 'Studenten nach Kompetenzstufe',
    'adash.a1b2': 'A1 bis B2',

    // Footer
    'footer.tagline': 'DeutschWelt Coaching ist Ihre Akademie für deutsche Sprachkompetenz nach dem Gemeinsamen Europäischen Referenzrahmen (GER A1 bis B2).',
    'footer.colCourses': 'Kursstufen',
    'footer.colTools': 'Lernwerkzeuge',
    'footer.colAcademy': 'Akademie',
    'footer.a1': 'A1 Anfänger (Start from Zero)',
    'footer.a2': 'A2 Grundstufe (Konversation)',
    'footer.b1': 'B1 Mittelstufe (Beruf & Alltag)',
    'footer.b2': 'B2 Fortgeschritten (Goethe-Zertifikat)',
    'footer.examPrep': 'Prüfungstraining',
    'footer.srs': 'Wortschatz-Trainer (SRS)',
    'footer.speakingLab': 'Aussprache-Labor',
    'footer.liveClasses': 'Live-Unterricht (Meet/Zoom)',
    'footer.flashcards': 'Leitner-Karteikartensystem',
    'footer.mentorship': '1-zu-1 Dozentenbetreuung',
    'footer.about': 'Über DeutschWelt',
    'footer.contact': 'Kontakt & Beratung',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB & Nutzungsbedingungen',
    'footer.cookies': 'Cookie-Richtlinie',
    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.certNote': 'Zertifizierte Deutschkurse nach Goethe- & Telc-Standards.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('dw_language');
      return saved === 'de' ? 'de' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('dw_language', lang);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
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
