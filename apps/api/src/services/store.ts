import { UserRole, GermanLevel, PublicationStatus, GermanArticle, PartOfSpeech, ExerciseType, LessonContentType, SubmissionStatus, EnquiryStatus, VocabMasteryStatus } from '@deutschwelt/shared';
import bcrypt from 'bcryptjs';

// Stateful mock/cache store for zero-friction local development and automated testing
export class DataStore {
  users: any[] = [];
  studentProfiles: any[] = [];
  teacherProfiles: any[] = [];
  sessions: any[] = [];
  courses: any[] = [];
  units: any[] = [];
  lessons: any[] = [];
  contentBlocks: any[] = [];
  vocabulary: any[] = [];
  vocabCategories: any[] = [];
  studentVocabProgress: any[] = [];
  exercises: any[] = [];
  questions: any[] = [];
  options: any[] = [];
  attempts: any[] = [];
  answers: any[] = [];
  speakingPrompts: any[] = [];
  speakingAttempts: any[] = [];
  assignments: any[] = [];
  submissions: any[] = [];
  batches: any[] = [];
  batchMemberships: any[] = [];
  teacherBatchAssignments: any[] = [];
  teacherLectures: any[] = [];
  teacherMaterials: any[] = [];
  batchAnnouncements: any[] = [];
  enrollments: any[] = [];
  lessonProgress: any[] = [];
  enquiries: any[] = [];
  notifications: any[] = [];
  siteSettings: any[] = [];
  auditLogs: any[] = [];
  certificates: any[] = [];
  feePlans: any[] = [];
  payments: any[] = [];
  attendance: any[] = [];
  lessonReports: any[] = [];

  constructor() {
    this.seedInitialData();
  }

  async seedInitialData() {
    const adminPasswordHash = await bcrypt.hash('AdminDeutschWelt2026!', 10);
    const teacherPasswordHash = await bcrypt.hash('TeacherDeutschWelt2026!', 10);
    const studentPasswordHash = await bcrypt.hash('StudentDeutschWelt2026!', 10);

    const admin = {
      id: 'user-admin-1',
      email: 'admin@deutschwelt.de',
      passwordHash: adminPasswordHash,
      firstName: 'Maximilian',
      lastName: 'Schmidt',
      phone: '+49 151 12345678',
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const teacher = {
      id: 'user-teacher-1',
      email: 'teacher@deutschwelt.de',
      passwordHash: teacherPasswordHash,
      firstName: 'Dr. Katharina',
      lastName: 'Weber',
      phone: '+49 151 87654321',
      role: UserRole.TEACHER,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const student = {
      id: 'user-student-1',
      email: 'student@deutschwelt.de',
      passwordHash: studentPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '+91 9876543210',
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const teacher2 = {
      id: 'user-teacher-2',
      email: 'florian@deutschwelt.de',
      passwordHash: teacherPasswordHash,
      firstName: 'Florian',
      lastName: 'Becker',
      phone: '+49 152 98765432',
      role: UserRole.TEACHER,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const student2 = {
      id: 'user-student-2',
      email: 'lukas@example.com',
      passwordHash: studentPasswordHash,
      firstName: 'Lukas',
      lastName: 'Meyer',
      phone: '+49 170 11223344',
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users = [admin, teacher, teacher2, student, student2];

    this.studentProfiles = [
      {
        id: 'profile-student-1',
        userId: student.id,
        currentLevel: GermanLevel.A1,
        learningGoal: 'Pass Goethe-Zertifikat A1 with 90%+ for German university visa',
        preferredLanguage: 'en',
        dailyGoalMinutes: 25,
        streakCount: 7,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'profile-student-2',
        userId: student2.id,
        currentLevel: GermanLevel.B1,
        learningGoal: 'Pass Goethe-Zertifikat B1 for job application',
        preferredLanguage: 'en',
        dailyGoalMinutes: 40,
        streakCount: 12,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.teacherProfiles = [
      {
        id: 'profile-teacher-1',
        userId: teacher.id,
        bio: 'Goethe-Institut certified DaF specialist with 12+ years of experience training students from A1 to TestDaF.',
        qualifications: 'MA Germanistik (LMU Munich)',
        specialization: 'Phonetics & A1-A2 Foundation',
        maxBatches: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'profile-teacher-2',
        userId: teacher2.id,
        bio: 'Senior DaF Lecturer and TestDaF official examiner specializing in advanced grammar and business German.',
        qualifications: 'PhD Applied Linguistics (FU Berlin)',
        specialization: 'B1-B2 Exam Preparation & Advanced Writing',
        maxBatches: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Courses A1, A2, B1, B2
    this.courses = [
      {
        id: 'course-a1',
        slug: 'deutsch-a1-beginner-intensiv',
        title: 'Deutsch A1: Complete Beginner to Breakthrough',
        description: 'Comprehensive foundation for learning German from scratch. Master pronunciation, basic greetings, shopping, ordering food, and the German case system (Nominativ & Akkusativ).',
        level: GermanLevel.A1,
        learningObjectives: [
          'Master the German alphabet, umlauts (ä, ö, ü), and phonetics',
          'Introduce yourself and hold simple daily conversations',
          'Understand noun genders (der, die, das) and plural forms',
          'Use Nominative and Accusative cases accurately',
          'Prepare thoroughly for the Goethe-Zertifikat A1 exam'
        ],
        estimatedHours: 60,
        thumbnailUrl: '/images/courses/course-a1.jpg',
        status: PublicationStatus.PUBLISHED,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course-a2',
        slug: 'deutsch-a2-elementary-dialoge',
        title: 'Deutsch A2: Elementary Fluency & Real-World Dialogues',
        description: 'Expand your conversation abilities. Learn the Dative case, two-way prepositions (Wechselpräpositionen), expressing past events with Perfekt, and giving opinions.',
        level: GermanLevel.A2,
        learningObjectives: [
          'Confidently use the Dativ case and two-way prepositions',
          'Narrate past experiences using the Perfekt tense with haben and sein',
          'Form complex sentences with weil, dass, and wenn',
          'Prepare for Goethe-Zertifikat A2 / telc Deutsch A2'
        ],
        estimatedHours: 75,
        thumbnailUrl: '/images/courses/course-a2.jpg',
        status: PublicationStatus.PUBLISHED,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course-b1',
        slug: 'deutsch-b1-intermediate-mastery',
        title: 'Deutsch B1: Independent Communication & Exam Preparation',
        description: 'Achieve communicative autonomy in Germany. Master Präteritum, Konjunktiv II for polite requests and wishes, the Passive voice, and professional correspondence.',
        level: GermanLevel.B1,
        learningObjectives: [
          'Express hypotheses, dreams, and polite requests using Konjunktiv II',
          'Use the Passive Voice (Vorgangspassiv) across present and past tenses',
          'Handle complex job interviews and official appointments in Germany',
          'Pass the Goethe-Zertifikat B1 or telc Deutsch B1 / DTZ examination'
        ],
        estimatedHours: 90,
        thumbnailUrl: '/images/courses/course-b1.jpg',
        status: PublicationStatus.PUBLISHED,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course-b2',
        slug: 'deutsch-b2-professional-fluency',
        title: 'Deutsch B2: Academic & Professional Fluency',
        description: 'High-level training for universities, hospitals, and multinational companies in DACH countries. Focuses on advanced grammar, formal writing, and nuanced debates.',
        level: GermanLevel.B2,
        learningObjectives: [
          'Understand and produce complex technical and academic texts',
          'Master Nominalstil (nominalization) and participle attributes',
          'Argue spontaneously and fluently on controversial topics',
          'Achieve the prerequisite score for university admission (TestDaF / Goethe B2)'
        ],
        estimatedHours: 120,
        thumbnailUrl: '/images/courses/course-b2.jpg',
        status: PublicationStatus.PUBLISHED,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Units
    this.units = [
      {
        id: 'unit-a1-1',
        courseId: 'course-a1',
        title: 'Einheit 1: Hallo und Willkommen (Greetings & First Steps)',
        description: 'Learn German phonetics, greetings, how to introduce yourself, and say where you are from.',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'unit-a1-2',
        courseId: 'course-a1',
        title: 'Einheit 2: Der, Die, Das — Die deutschen Artikel',
        description: 'Master the three German grammatical genders and the concept of noun capitalization.',
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Lessons
    this.lessons = [
      {
        id: 'lesson-a1-1-1',
        unitId: 'unit-a1-1',
        title: 'Lektion 1.1: Sich vorstellen (Introducing Yourself)',
        description: 'Essential phrases: "Ich heiße...", "Ich komme aus...", "Wie geht es dir?"',
        durationMinutes: 15,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'lesson-a1-1-2',
        unitId: 'unit-a1-1',
        title: 'Lektion 1.2: Das deutsche Alphabet & Aussprache',
        description: 'Master the German alphabet, umlauts (ä, ö, ü), and the sharp S (ß).',
        durationMinutes: 20,
        order: 2,
        status: PublicationStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'lesson-a1-2-1',
        unitId: 'unit-a1-2',
        title: 'Lektion 2.1: Die drei Genera (Maskulin, Feminin, Neutral)',
        description: 'Rules and tips to identify der, die, and das with high accuracy.',
        durationMinutes: 25,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Content Blocks
    this.contentBlocks = [
      {
        id: 'block-1-1',
        lessonId: 'lesson-a1-1-1',
        type: LessonContentType.TEXT,
        title: 'Herzlich Willkommen bei DeutschWelt!',
        content: `### Welcome to Your First German Lesson!
Learning German begins with mastering warm, natural introductions. In German-speaking countries (Germany, Austria, Switzerland), using the appropriate level of politeness is deeply valued.

#### 1. Wichtige Begrüßungen (Everyday Greetings)
* **Guten Morgen** — Good morning (until ~11:00)
* **Guten Tag** — Good day / Hello (standard respectful greeting)
* **Guten Abend** — Good evening (from ~18:00)
* **Hallo** — Hello (friendly and informal)
* **Auf Wiedersehen** — Goodbye (formal, spoken in person)
* **Tschüss** — Bye (friendly and casual)

#### 2. Sich vorstellen (Introducing Yourself)
* **Ich heiße Anna.** — My name is Anna.
* **Ich komme aus Indien.** — I come from India.
* **Ich wohne in München.** — I live in Munich.
* **Ich lerne Deutsch.** — I am learning German.`,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'block-1-2',
        lessonId: 'lesson-a1-1-1',
        type: LessonContentType.GRAMMAR,
        title: 'Grammatik: Verb Conjugation (heißen, kommen, wohnen)',
        content: `### Present Tense Verb Endings
In German, regular verbs in the present tense take consistent endings based on the subject pronoun:

* **ich** (I) &rarr; end with **-e** (*ich komm-e*)
* **du** (you informal) &rarr; end with **-st** (*du komm-st*)
* **er / sie / es** (he/she/it) &rarr; end with **-t** (*er komm-t*)
* **wir** (we) &rarr; end with **-en** (*wir komm-en*)
* **ihr** (you plural) &rarr; end with **-t** (*ihr komm-t*)
* **Sie / sie** (You formal / they) &rarr; end with **-en** (*Sie komm-en*)

> **Pro Tip**: Notice how "wir" and formal "Sie" always take the base infinitive form ending in **-en**!`,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Exercises
    this.exercises = [
      {
        id: 'exercise-a1-1',
        lessonId: 'lesson-a1-1-1',
        title: 'Übung 1: Begrüßungen & Verben',
        description: 'Practice self-introductions, greetings, and verb conjugations.',
        level: GermanLevel.A1,
        type: ExerciseType.MULTIPLE_CHOICE,
        passingScore: 70.0,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.questions = [
      {
        id: 'q-a1-1',
        exerciseId: 'exercise-a1-1',
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'How do you say "Good day, my name is Lukas" in German?',
        instructions: 'Choose the correct formal sentence.',
        explanation: '"Guten Tag, ich heiße Lukas." is the correct polite greeting and verb conjugation for "ich".',
        points: 10,
        order: 1,
        correctAnswer: 'Guten Tag, ich heiße Lukas.'
      },
      {
        id: 'q-a1-2',
        exerciseId: 'exercise-a1-1',
        type: ExerciseType.FILL_IN_BLANK,
        prompt: 'Fill in the blank with the correct form of the verb "kommen":\n"Woher ______ du?"',
        instructions: 'Type the conjugated verb in lowercase.',
        hint: 'The subject pronoun is "du" (2nd person singular).',
        explanation: 'For "du", regular verbs end in -st: "kommst".',
        points: 10,
        order: 2,
        correctAnswer: 'kommst'
      },
      {
        id: 'q-a1-3',
        exerciseId: 'exercise-a1-1',
        type: ExerciseType.TRUE_FALSE,
        prompt: 'In German, all nouns are always written with a capital first letter.',
        instructions: 'Select True or False.',
        explanation: 'True! In German orthography, every noun (e.g., der Tisch, das Haus, die Frau) must be capitalized.',
        points: 10,
        order: 3,
        correctAnswer: 'true'
      }
    ];

    this.options = [
      { id: 'opt-1-1', questionId: 'q-a1-1', label: 'Guten Tag, ich heiße Lukas.', isCorrect: true, order: 1 },
      { id: 'opt-1-2', questionId: 'q-a1-1', label: 'Gute Nacht, du heißt Lukas.', isCorrect: false, order: 2 },
      { id: 'opt-1-3', questionId: 'q-a1-1', label: 'Auf Wiedersehen, ich bin Lukas.', isCorrect: false, order: 3 },
      { id: 'opt-1-4', questionId: 'q-a1-1', label: 'Tschüss, er heißt Lukas.', isCorrect: false, order: 4 },
      { id: 'opt-3-1', questionId: 'q-a1-3', label: 'True (Richtig)', isCorrect: true, order: 1 },
      { id: 'opt-3-2', questionId: 'q-a1-3', label: 'False (Falsch)', isCorrect: false, order: 2 }
    ];

    // Vocabulary
    this.vocabCategories = [
      { id: 'cat-1', name: 'Alltag & Begrüßung', slug: 'alltag-und-begruessung', description: 'Everyday greetings and phrases', order: 1 },
      { id: 'cat-2', name: 'Essen & Trinken', slug: 'essen-und-trinken', description: 'Food and dining terms', order: 2 },
      { id: 'cat-3', name: 'Wohnen & Stadt', slug: 'wohnen-und-stadt', description: 'Living and urban navigation', order: 3 }
    ];

    this.vocabulary = [
      {
        id: 'vocab-1',
        german: 'Guten Tag',
        english: 'Good day / Hello',
        hindi: 'नमस्ते / शुभ दिन',
        article: GermanArticle.NONE,
        plural: null,
        partOfSpeech: PartOfSpeech.PHRASE,
        level: GermanLevel.A1,
        category: 'Alltag & Begrüßung',
        exampleSentenceDe: 'Guten Tag, wie geht es Ihnen?',
        exampleSentenceEn: 'Good day, how are you (formal)?',
        exampleSentenceHi: 'नमस्ते, आप कैसे हैं?',
        ipa: '/ˌɡuːtn̩ ˈtaːk/',
        tags: ['greeting', 'polite'],
        difficulty: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-2',
        german: 'Apfel',
        english: 'Apple',
        hindi: 'सेब',
        article: GermanArticle.DER,
        plural: 'die Äpfel',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: 'Essen & Trinken',
        exampleSentenceDe: 'Der Apfel schmeckt frisch und süß.',
        exampleSentenceEn: 'The apple tastes fresh and sweet.',
        exampleSentenceHi: 'सेब ताज़ा और मीठा लगता है।',
        ipa: '/ˈʔapfl̩/',
        tags: ['food', 'fruit', 'masculine'],
        difficulty: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-3',
        german: 'Kaffee',
        english: 'Coffee',
        hindi: 'कॉफ़ी',
        article: GermanArticle.DER,
        plural: 'die Kaffees',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: 'Essen & Trinken',
        exampleSentenceDe: 'Ich trinke morgens gerne einen heißen Kaffee.',
        exampleSentenceEn: 'I like to drink a hot coffee in the morning.',
        exampleSentenceHi: 'मुझे सुबह गर्म कॉफ़ी पीना पसंद है।',
        ipa: '/ˈkafe/',
        tags: ['drink', 'breakfast', 'masculine'],
        difficulty: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-4',
        german: 'Wohnung',
        english: 'Apartment / Flat',
        hindi: 'मकान / अपार्टमेंट',
        article: GermanArticle.DIE,
        plural: 'die Wohnungen',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: 'Wohnen & Stadt',
        exampleSentenceDe: 'Meine Wohnung hat drei helle Zimmer.',
        exampleSentenceEn: 'My apartment has three bright rooms.',
        exampleSentenceHi: 'मेरे अपार्टमेंट में तीन चमकदार कमरे हैं।',
        ipa: '/ˈvoːnʊŋ/',
        tags: ['living', 'home', 'feminine'],
        difficulty: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-5',
        german: 'Buch',
        english: 'Book',
        hindi: 'किताब',
        article: GermanArticle.DAS,
        plural: 'die Bücher',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: 'Alltag & Begrüßung',
        exampleSentenceDe: 'Das Buch liegt auf dem Schreibtisch.',
        exampleSentenceEn: 'The book is lying on the desk.',
        exampleSentenceHi: 'किताब मेज पर रखी है।',
        ipa: '/buːx/',
        tags: ['study', 'reading', 'neuter'],
        difficulty: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-6',
        german: 'Bahnhof',
        english: 'Train station',
        hindi: 'रेलवे स्टेशन',
        article: GermanArticle.DER,
        plural: 'die Bahnhöfe',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A2,
        category: 'Wohnen & Stadt',
        exampleSentenceDe: 'Wir treffen uns um 18 Uhr am Hauptbahnhof.',
        exampleSentenceEn: 'We meet at 6 PM at the central station.',
        exampleSentenceHi: 'हम शाम 6 बजे मुख्य रेलवे स्टेशन पर मिलते हैं।',
        ipa: '/ˈbaːnhoːf/',
        tags: ['travel', 'transport', 'masculine'],
        difficulty: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-7',
        german: 'entscheiden',
        english: 'to decide',
        hindi: 'निर्णय लेना',
        article: GermanArticle.NONE,
        plural: null,
        partOfSpeech: PartOfSpeech.VERB,
        level: GermanLevel.B1,
        category: 'Alltag & Begrüßung',
        exampleSentenceDe: 'Ich habe mich für das Studium in Deutschland entschieden.',
        exampleSentenceEn: 'I decided to study in Germany.',
        exampleSentenceHi: 'मैंने जर्मनी में पढ़ाई करने का निर्णय लिया है।',
        ipa: '/ʔɛntˈʃaɪ̯dn̩/',
        tags: ['verb', 'reflexive', 'B1'],
        difficulty: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'vocab-8',
        german: 'Voraussetzung',
        english: 'Prerequisite / Requirement',
        hindi: 'पूर्वशर्त / आवश्यकता',
        article: GermanArticle.DIE,
        plural: 'die Voraussetzungen',
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.B2,
        category: 'Alltag & Begrüßung',
        exampleSentenceDe: 'Fließende Deutschkenntnisse sind eine wichtige Voraussetzung.',
        exampleSentenceEn: 'Fluent German knowledge is an important prerequisite.',
        exampleSentenceHi: 'जर्मन भाषा का धाराप्रवाह ज्ञान एक महत्वपूर्ण आवश्यकता है।',
        ipa: '/foːɐ̯ˈʔaʊ̯szɛtsʊŋ/',
        tags: ['academic', 'formal', 'feminine', 'B2'],
        difficulty: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.studentVocabProgress = this.vocabulary.map((w, idx) => ({
      id: `svp-${idx + 1}`,
      userId: student.id,
      wordId: w.id,
      status: idx < 3 ? VocabMasteryStatus.LEARNING : (idx === 4 ? VocabMasteryStatus.MASTERED : VocabMasteryStatus.NEW),
      box: idx === 4 ? 5 : 2,
      timesReviewed: idx < 5 ? 3 : 0,
      timesCorrect: idx < 5 ? 3 : 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Speaking Prompts
    this.speakingPrompts = [
      {
        id: 'sp-1',
        title: 'Sich vorstellen (A1 Self-Introduction)',
        topic: 'Personal Information & Introductions',
        level: GermanLevel.A1,
        scenario: 'You are introducing yourself in the first German seminar at DeutschWelt.',
        instructions: 'Record 30-60 seconds in German. State your name, hometown, current residence, language background, and why you are learning German.',
        sampleAnswerDe: 'Guten Tag! Mein Name ist Elena. Ich komme aus Indien und wohne jetzt in Frankfurt. Ich spreche Englisch und lerne Deutsch für mein Masterstudium. Freut mich, Sie kennenzulernen!',
        sampleAnswerEn: 'Good day! My name is Elena. I come from India and now live in Frankfurt. I speak English and am learning German for my master studies. Pleased to meet you!',
        minDurationSeconds: 15,
        maxDurationSeconds: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sp-2',
        title: 'Mein gestriger Tag (A2 Past Events with Perfekt)',
        topic: 'Daily Routine & Narrative',
        level: GermanLevel.A2,
        scenario: 'Describe your day yesterday to your conversation partner using the Perfekt tense.',
        instructions: 'Speak for 45-90 seconds. Incorporate verbs with haben (gefrühstückt, gearbeitet) and sein (aufgestanden, gefahren).',
        sampleAnswerDe: 'Gestern bin ich um 7 Uhr aufgestanden. Ich habe gemütlich Kaffee getrunken und danach bin ich mit der U-Bahn ins Büro gefahren...',
        sampleAnswerEn: 'Yesterday I got up at 7 AM. I casually drank coffee and after that I took the subway to the office...',
        minDurationSeconds: 30,
        maxDurationSeconds: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Assignments
    this.assignments = [
      {
        id: 'assign-1',
        courseId: 'course-a1',
        teacherId: 'profile-teacher-1',
        title: 'Schreibaufgabe: Eine kurze E-Mail an das Hotel',
        description: 'Write a short formal inquiry email to book a room at a hotel in Munich.',
        level: GermanLevel.A1,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        maxPoints: 100,
        instructions: `Write ~40-60 words in German including:
1. Formal greeting (Sehr geehrte Damen und Herren)
2. Request a double room for 2 nights
3. Mention arrival date and time
4. Ask if breakfast is included
5. Formal closing (Mit freundlichen Grüßen)`,
        rubricCriteria: [
          { name: 'Formal Greeting & Closing', description: 'Accurate polite opening and closing', maxPoints: 20 },
          { name: 'Content Completion', description: 'All required points addressed', maxPoints: 40 },
          { name: 'Grammar & Orthography', description: 'Verb position and noun capitalization', maxPoints: 40 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.submissions = [
      {
        id: 'sub-1',
        assignmentId: 'assign-1',
        userId: student.id,
        content: `Sehr geehrte Damen und Herren,\n\nich möchte gern ein Doppelzimmer für zwei Nächte vom 14. bis 16. November reservieren. Wir kommen um ca. 18 Uhr an.\nBieten Sie auch ein Frühstücksbüffet an?\n\nVielen Dank im Voraus für Ihre Hilfe.\n\nMit freundlichen Grüßen,\nElena Rostova`,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    // Batches
    this.batches = [
      {
        id: 'batch-1',
        name: 'Goethe A1 Intensive — Winter 2026',
        level: GermanLevel.A1,
        description: 'Morning intensive batch meeting Mon-Thu 10:00-11:30 CET for Goethe-Zertifikat A1 candidates.',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        maxStudents: 15,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'batch-2',
        name: 'Goethe B1/B2 Mastery — Abendkurs',
        level: GermanLevel.B1,
        description: 'Evening advanced batch meeting Tue & Thu 19:00-20:30 CET focusing on complex grammar and exam simulations.',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        maxStudents: 12,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.teacherBatchAssignments = [
      {
        id: 'tba-1',
        batchId: 'batch-1',
        teacherId: 'profile-teacher-1',
        isPrimary: true,
        assignedAt: new Date().toISOString()
      },
      {
        id: 'tba-2',
        batchId: 'batch-2',
        teacherId: 'profile-teacher-2',
        isPrimary: true,
        assignedAt: new Date().toISOString()
      }
    ];

    this.batchMemberships = [
      {
        id: 'bm-1',
        batchId: 'batch-1',
        userId: student.id,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString()
      },
      {
        id: 'bm-2',
        batchId: 'batch-2',
        userId: student2.id,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString()
      }
    ];

    // Teacher Uploaded Lectures & Live Video Sessions
    this.teacherLectures = [
      {
        id: 'lec-1',
        teacherId: 'profile-teacher-1',
        batchId: 'batch-1',
        title: 'A1.1 Aussprache & Alphabet Meisterklasse',
        description: 'Core phonetic rules in German: Umlauts (ä, ö, ü), diphthongs (ei, ie, eu), and the soft/hard ch sound.',
        level: GermanLevel.A1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        durationMinutes: 45,
        fileSize: '15.4 MB',
        originalFilename: 'A1_Phonetik_Alphabet.mp4',
        scheduledFor: new Date().toISOString(),
        isLive: false,
        meetingUrl: 'https://meet.google.com/dw-a1-live',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'lec-2',
        teacherId: 'profile-teacher-1',
        batchId: 'batch-1',
        title: 'A1.2 Nominativ vs. Akkusativ Satzbau',
        description: 'Understanding how direct objects transform der -> den, with interactive sentence breakdown examples.',
        level: GermanLevel.A1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        durationMinutes: 50,
        fileSize: '24.1 MB',
        originalFilename: 'A1_Akkusativ_Satzbau.mp4',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        isLive: false,
        meetingUrl: 'https://meet.google.com/dw-a1-live',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'lec-3',
        teacherId: 'profile-teacher-2',
        batchId: 'batch-2',
        title: 'B1 Konjunktiv II: Wünsche & Höfliche Bitten',
        description: 'Advanced hypotheticals using wäre, hätte, and würde + Infinitiv for official Goethe B1 speaking exam.',
        level: GermanLevel.B1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        durationMinutes: 60,
        fileSize: '36.8 MB',
        originalFilename: 'B1_Konjunktiv_II_Mastery.mp4',
        scheduledFor: new Date().toISOString(),
        isLive: false,
        meetingUrl: 'https://meet.google.com/dw-b1-live',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString()
      }
    ];

    // Teacher Uploaded Study Materials & Worksheets
    this.teacherMaterials = [
      {
        id: 'mat-1',
        teacherId: 'profile-teacher-1',
        batchId: 'batch-1',
        title: 'A1 Grammatik-Übersicht: Bestimmte & Unbestimmte Artikel',
        category: 'GRAMMAR_CHEAT_SHEET',
        description: 'Complete 2-page color-coded reference guide for der/die/das in Nominativ and Akkusativ.',
        fileUrl: '/uploads/materials/A1_Grammatik_Artikel.pdf',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        level: GermanLevel.A1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mat-2',
        teacherId: 'profile-teacher-1',
        batchId: 'batch-1',
        title: 'A1 Übungsblatt: Begrüßungen & Höflichkeitsformen',
        category: 'WORKSHEET',
        description: 'Fill-in-the-blank practice worksheet for formal Sie vs. informal du in everyday German.',
        fileUrl: '/uploads/materials/A1_Begruessungen_Uebungen.pdf',
        fileType: 'PDF',
        fileSize: '850 KB',
        level: GermanLevel.A1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mat-3',
        teacherId: 'profile-teacher-2',
        batchId: 'batch-2',
        title: 'B1 Nebensätze: weil, dass, obwohl, wenn Satzstruktur',
        category: 'GRAMMAR_CHEAT_SHEET',
        description: 'Summary table of subordinating conjunctions and verb kick rules at the end of the clause.',
        fileUrl: '/uploads/materials/B1_Nebensaetze_Regeln.pdf',
        fileType: 'PDF',
        fileSize: '1.5 MB',
        level: GermanLevel.B1,
        createdAt: new Date().toISOString()
      }
    ];

    // Batch Noticeboard Announcements
    this.batchAnnouncements = [
      {
        id: 'anc-1',
        teacherId: 'profile-teacher-1',
        batchId: 'batch-1',
        title: 'Morgen: Live-Sprechtraining um 10:00 Uhr',
        content: 'Liebe Kursteilnehmer, morgen üben wir die Dialoge aus Einheit 1 live auf Google Meet. Bitte bereiten Sie Ihre 60-Sekunden Selbstvorstellung vor!',
        createdAt: new Date().toISOString()
      }
    ];

    this.enrollments = [
      {
        id: 'enr-1',
        userId: student.id,
        courseId: 'course-a1',
        status: 'ACTIVE',
        progressPercentage: 35.0,
        enrolledAt: new Date().toISOString()
      }
    ];

    this.lessonProgress = [
      {
        id: 'lp-1',
        userId: student.id,
        lessonId: 'lesson-a1-1-1',
        isCompleted: true,
        score: 100,
        timeSpentSeconds: 900,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.enquiries = [
      {
        id: 'enq-1',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 9811223344',
        level: GermanLevel.A1,
        message: 'Hello DeutschWelt team, I am planning to move to Munich this autumn for my engineering master degree. Does your A1 course include live conversation practice with certified instructors?',
        status: EnquiryStatus.NEW,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'enq-2',
        name: 'Marcus Chen',
        email: 'marcus.chen@example.com',
        phone: '+49 176 99887766',
        level: GermanLevel.B1,
        message: 'I passed A2 last year and want to prepare for the Goethe-Zertifikat B1 exam in 3 months. Can I get a placement test before enrolling?',
        status: EnquiryStatus.CONTACTED,
        adminNotes: 'Contacted by phone on Oct 18. Scheduled placement test.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.notifications = [
      {
        id: 'notif-1',
        userId: student.id,
        title: 'Willkommen bei DeutschWelt!',
        message: 'Welcome to your German learning journey! Start with Einheit 1: Sich vorstellen.',
        type: 'INFO',
        linkUrl: '/courses/deutsch-a1-beginner-intensiv',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif-2',
        userId: student.id,
        title: 'Neue Schreibaufgabe bereit',
        message: 'Dr. Katharina Weber has published a new writing assignment: "Eine kurze E-Mail an das Hotel".',
        type: 'ASSIGNMENT',
        linkUrl: '/student/assignments',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    this.siteSettings = [
      { id: 'set-1', key: 'platform_name', value: 'DeutschWelt', description: 'Platform brand name', updatedAt: new Date().toISOString() },
      { id: 'set-2', key: 'tagline', value: 'Your journey to German fluency.', description: 'Tagline', updatedAt: new Date().toISOString() },
      { id: 'set-3', key: 'contact_email', value: 'admissions@deutschwelt.de', description: 'Primary contact email', updatedAt: new Date().toISOString() }
    ];

    this.certificates = [
      {
        id: 'cert-1',
        certificateNumber: 'DW-2026-A1-8841',
        userId: student.id,
        userFullName: `${student.firstName} ${student.lastName}`,
        courseId: 'course-a1',
        courseTitle: 'Deutsch A1: Complete Beginner to Breakthrough',
        level: GermanLevel.A1,
        gradeScore: 96,
        gradeClassification: 'Sehr Gut (With Distinction)',
        issuedAt: new Date().toISOString(),
        instructorName: 'Dr. Katharina Weber',
        directorName: 'Dr. Klaus Becker',
        directorTitle: 'Direktor Akademische Bildung, DeutschWelt',
        verificationCode: 'DW-VERIFY-A1-8841'
      }
    ];

    this.feePlans = [
      {
        id: 'fee-1',
        name: 'Intensivkurs Flatrate',
        price: 399,
        currency: 'EUR',
        billingCycle: 'MONTHLY',
        features: ['Alle GER-Stufen A1 bis B2', '4x wöchentlich Live-Klassen (Google Meet)', 'Unbegrenzter Wortschatz-Trainer', 'Audio-Sprachlabor mit Dozenten-Feedback'],
        isActive: true
      },
      {
        id: 'fee-2',
        name: '1-zu-1 VIP Coaching',
        price: 799,
        currency: 'EUR',
        billingCycle: 'MONTHLY',
        features: ['Persönlicher Goethe-Dozent', '12 Einzelsitzungen im Monat', 'Individueller Lehrplan & Korrekturservice', 'Garantierte Bestehensbegleitung'],
        isActive: true
      },
      {
        id: 'fee-3',
        name: 'Selbstlerner Goethe-Prüfungspaket',
        price: 149,
        currency: 'EUR',
        billingCycle: 'ONE_TIME',
        features: ['Vollständiges digitales Lehrmaterial', 'Original Goethe & Telc Modellprüfungen', 'KI-Aussprachetraining'],
        isActive: true
      }
    ];

    this.payments = [
      {
        id: 'pay-1',
        studentName: 'Elena Rostova',
        studentEmail: 'student@deutschwelt.de',
        courseName: 'Goethe A1 Intensive — Winter 2026',
        amount: 399,
        currency: 'EUR',
        method: 'Stripe (Credit Card)',
        status: 'COMPLETED',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        invoiceNumber: 'INV-2026-00481'
      },
      {
        id: 'pay-2',
        studentName: 'Lucas Weber',
        studentEmail: 'lucas.weber@gmail.com',
        courseName: 'Goethe B1/B2 Mastery — Abendkurs',
        amount: 799,
        currency: 'EUR',
        method: 'SEPA Direct Debit',
        status: 'COMPLETED',
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        invoiceNumber: 'INV-2026-00480'
      },
      {
        id: 'pay-3',
        studentName: 'Ananya Sharma',
        studentEmail: 'ananya.s@outlook.com',
        courseName: 'Deutsch A1: Beginner Intensiv',
        amount: 399,
        currency: 'EUR',
        method: 'PayPal',
        status: 'COMPLETED',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        invoiceNumber: 'INV-2026-00479'
      },
      {
        id: 'pay-4',
        studentName: 'Matteo Rossi',
        studentEmail: 'matteo.rossi@yahoo.it',
        courseName: 'Selbstlerner Goethe-Prüfungspaket',
        amount: 149,
        currency: 'EUR',
        method: 'Stripe',
        status: 'COMPLETED',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        invoiceNumber: 'INV-2026-00478'
      }
    ];

    this.attendance = [
      {
        id: 'att-1',
        batchId: 'batch-1',
        batchName: 'Goethe A1 Intensive — Winter 2026',
        date: new Date().toISOString().split('T')[0],
        totalEnrolled: 15,
        presentCount: 14,
        attendanceRate: 93,
        students: [
          { studentId: 'user-student-1', studentName: 'Elena Rostova', status: 'PRESENT' },
          { studentId: 'user-student-2', studentName: 'Lucas Weber', status: 'PRESENT' },
          { studentId: 'user-student-3', studentName: 'Mia G', status: 'ABSENT' }
        ]
      },
      {
        id: 'att-2',
        batchId: 'batch-2',
        batchName: 'Goethe B1/B2 Mastery — Abendkurs',
        date: new Date().toISOString().split('T')[0],
        totalEnrolled: 12,
        presentCount: 12,
        attendanceRate: 100,
        students: [
          { studentId: 'user-student-2', studentName: 'Lucas Weber', status: 'PRESENT' },
          { studentId: 'user-student-4', studentName: 'Enoch', status: 'PRESENT' }
        ]
      }
    ];

    this.lessonReports = [
      {
        id: 'rep-1',
        teacherId: 'profile-teacher-1',
        studentId: student.id,
        studentName: 'Elena Rostova',
        lessonTopic: 'Aussprache & Verb-Konjugation A1',
        date: new Date().toISOString(),
        rating: 5,
        notes: 'Hervorragende Mitarbeit. Die Umlaute ä und ö gelingen bereits flüssig. Hausaufgabe: Übung 3 auf Seite 12.'
      }
    ];
  }
}

export const store = new DataStore();
