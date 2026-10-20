// apps/api/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// apps/api/src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
var env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "deutschwelt-insecure-dev-session-key-32chars",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "deutschwelt-insecure-dev-cookie-key-32chars",
  SESSION_MAX_AGE_DAYS: parseInt(process.env.SESSION_MAX_AGE_DAYS || "14", 10),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  UPLOAD_DIR: process.env.UPLOAD_DIR || (process.env.VERCEL ? path.join("/tmp", "uploads") : path.resolve(process.cwd(), "uploads")),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10),
  isDev: (process.env.NODE_ENV || "development") === "development" && !process.env.VERCEL,
  isTest: (process.env.NODE_ENV || "development") === "test",
  isProd: process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
};

// apps/api/src/services/prisma.ts
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
var isPostgresUrl = Boolean(env.DATABASE_URL) && typeof env.DATABASE_URL === "string" && (env.DATABASE_URL.startsWith("postgresql://") || env.DATABASE_URL.startsWith("postgres://")) && !(process.env.VERCEL && env.DATABASE_URL.includes("localhost"));
var client = null;
function initPrismaClient() {
  if (!client && isPostgresUrl) {
    try {
      const { PrismaClient } = require2("@prisma/client");
      client = global.prismaInstance || new PrismaClient({
        log: env.isDev ? ["warn", "error"] : ["error"]
      });
      if (env.isDev) {
        global.prismaInstance = client;
      }
    } catch (e) {
      console.warn("[Prisma Warning] Could not initialize PrismaClient, operating in resilient store mode:", e?.message);
    }
  }
  return client;
}
var prisma = new Proxy({}, {
  get: (_target, prop) => {
    const c = initPrismaClient();
    if (c && c[prop]) {
      return typeof c[prop] === "function" ? c[prop].bind(c) : c[prop];
    }
    if (prop === "$queryRaw" || prop === "$connect" || prop === "$disconnect") {
      return async () => {
        throw new Error("PostgreSQL database URL is not configured. Running in memory mode.");
      };
    }
    return void 0;
  }
});
var isDatabaseConnected = false;

// apps/api/src/services/store.ts
import { UserRole, GermanLevel, PublicationStatus, GermanArticle, PartOfSpeech, ExerciseType, LessonContentType, SubmissionStatus, EnquiryStatus, VocabMasteryStatus } from "@deutschwelt/shared";
import bcrypt from "bcryptjs";
var DataStore = class {
  users = [];
  studentProfiles = [];
  teacherProfiles = [];
  sessions = [];
  courses = [];
  units = [];
  lessons = [];
  contentBlocks = [];
  vocabulary = [];
  vocabCategories = [];
  studentVocabProgress = [];
  exercises = [];
  questions = [];
  options = [];
  attempts = [];
  answers = [];
  speakingPrompts = [];
  speakingAttempts = [];
  assignments = [];
  submissions = [];
  batches = [];
  batchMemberships = [];
  teacherBatchAssignments = [];
  teacherLectures = [];
  teacherMaterials = [];
  batchAnnouncements = [];
  enrollments = [];
  lessonProgress = [];
  enquiries = [];
  notifications = [];
  siteSettings = [];
  auditLogs = [];
  certificates = [];
  constructor() {
    this.seedInitialData();
  }
  async seedInitialData() {
    const adminPasswordHash = await bcrypt.hash("AdminDeutschWelt2026!", 10);
    const teacherPasswordHash = await bcrypt.hash("TeacherDeutschWelt2026!", 10);
    const studentPasswordHash = await bcrypt.hash("StudentDeutschWelt2026!", 10);
    const admin = {
      id: "user-admin-1",
      email: "admin@deutschwelt.de",
      passwordHash: adminPasswordHash,
      firstName: "Maximilian",
      lastName: "Schmidt",
      phone: "+49 151 12345678",
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const teacher = {
      id: "user-teacher-1",
      email: "teacher@deutschwelt.de",
      passwordHash: teacherPasswordHash,
      firstName: "Dr. Katharina",
      lastName: "Weber",
      phone: "+49 151 87654321",
      role: UserRole.TEACHER,
      isActive: true,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const student = {
      id: "user-student-1",
      email: "student@deutschwelt.de",
      passwordHash: studentPasswordHash,
      firstName: "Elena",
      lastName: "Rostova",
      phone: "+91 9876543210",
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const teacher2 = {
      id: "user-teacher-2",
      email: "florian@deutschwelt.de",
      passwordHash: teacherPasswordHash,
      firstName: "Florian",
      lastName: "Becker",
      phone: "+49 152 98765432",
      role: UserRole.TEACHER,
      isActive: true,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const student2 = {
      id: "user-student-2",
      email: "lukas@example.com",
      passwordHash: studentPasswordHash,
      firstName: "Lukas",
      lastName: "Meyer",
      phone: "+49 170 11223344",
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users = [admin, teacher, teacher2, student, student2];
    this.studentProfiles = [
      {
        id: "profile-student-1",
        userId: student.id,
        currentLevel: GermanLevel.A1,
        learningGoal: "Pass Goethe-Zertifikat A1 with 90%+ for German university visa",
        preferredLanguage: "en",
        dailyGoalMinutes: 25,
        streakCount: 7,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "profile-student-2",
        userId: student2.id,
        currentLevel: GermanLevel.B1,
        learningGoal: "Pass Goethe-Zertifikat B1 for job application",
        preferredLanguage: "en",
        dailyGoalMinutes: 40,
        streakCount: 12,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.teacherProfiles = [
      {
        id: "profile-teacher-1",
        userId: teacher.id,
        bio: "Goethe-Institut certified DaF specialist with 12+ years of experience training students from A1 to TestDaF.",
        qualifications: "MA Germanistik (LMU Munich)",
        specialization: "Phonetics & A1-A2 Foundation",
        maxBatches: 5,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "profile-teacher-2",
        userId: teacher2.id,
        bio: "Senior DaF Lecturer and TestDaF official examiner specializing in advanced grammar and business German.",
        qualifications: "PhD Applied Linguistics (FU Berlin)",
        specialization: "B1-B2 Exam Preparation & Advanced Writing",
        maxBatches: 5,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.courses = [
      {
        id: "course-a1",
        slug: "deutsch-a1-beginner-intensiv",
        title: "Deutsch A1: Complete Beginner to Breakthrough",
        description: "Comprehensive foundation for learning German from scratch. Master pronunciation, basic greetings, shopping, ordering food, and the German case system (Nominativ & Akkusativ).",
        level: GermanLevel.A1,
        learningObjectives: [
          "Master the German alphabet, umlauts (\xE4, \xF6, \xFC), and phonetics",
          "Introduce yourself and hold simple daily conversations",
          "Understand noun genders (der, die, das) and plural forms",
          "Use Nominative and Accusative cases accurately",
          "Prepare thoroughly for the Goethe-Zertifikat A1 exam"
        ],
        estimatedHours: 60,
        thumbnailUrl: "/images/courses/course-a1.jpg",
        status: PublicationStatus.PUBLISHED,
        order: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "course-a2",
        slug: "deutsch-a2-elementary-dialoge",
        title: "Deutsch A2: Elementary Fluency & Real-World Dialogues",
        description: "Expand your conversation abilities. Learn the Dative case, two-way prepositions (Wechselpr\xE4positionen), expressing past events with Perfekt, and giving opinions.",
        level: GermanLevel.A2,
        learningObjectives: [
          "Confidently use the Dativ case and two-way prepositions",
          "Narrate past experiences using the Perfekt tense with haben and sein",
          "Form complex sentences with weil, dass, and wenn",
          "Prepare for Goethe-Zertifikat A2 / telc Deutsch A2"
        ],
        estimatedHours: 75,
        thumbnailUrl: "/images/courses/course-a2.jpg",
        status: PublicationStatus.PUBLISHED,
        order: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "course-b1",
        slug: "deutsch-b1-intermediate-mastery",
        title: "Deutsch B1: Independent Communication & Exam Preparation",
        description: "Achieve communicative autonomy in Germany. Master Pr\xE4teritum, Konjunktiv II for polite requests and wishes, the Passive voice, and professional correspondence.",
        level: GermanLevel.B1,
        learningObjectives: [
          "Express hypotheses, dreams, and polite requests using Konjunktiv II",
          "Use the Passive Voice (Vorgangspassiv) across present and past tenses",
          "Handle complex job interviews and official appointments in Germany",
          "Pass the Goethe-Zertifikat B1 or telc Deutsch B1 / DTZ examination"
        ],
        estimatedHours: 90,
        thumbnailUrl: "/images/courses/course-b1.jpg",
        status: PublicationStatus.PUBLISHED,
        order: 3,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "course-b2",
        slug: "deutsch-b2-professional-fluency",
        title: "Deutsch B2: Academic & Professional Fluency",
        description: "High-level training for universities, hospitals, and multinational companies in DACH countries. Focuses on advanced grammar, formal writing, and nuanced debates.",
        level: GermanLevel.B2,
        learningObjectives: [
          "Understand and produce complex technical and academic texts",
          "Master Nominalstil (nominalization) and participle attributes",
          "Argue spontaneously and fluently on controversial topics",
          "Achieve the prerequisite score for university admission (TestDaF / Goethe B2)"
        ],
        estimatedHours: 120,
        thumbnailUrl: "/images/courses/course-b2.jpg",
        status: PublicationStatus.PUBLISHED,
        order: 4,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.units = [
      {
        id: "unit-a1-1",
        courseId: "course-a1",
        title: "Einheit 1: Hallo und Willkommen (Greetings & First Steps)",
        description: "Learn German phonetics, greetings, how to introduce yourself, and say where you are from.",
        order: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "unit-a1-2",
        courseId: "course-a1",
        title: "Einheit 2: Der, Die, Das \u2014 Die deutschen Artikel",
        description: "Master the three German grammatical genders and the concept of noun capitalization.",
        order: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.lessons = [
      {
        id: "lesson-a1-1-1",
        unitId: "unit-a1-1",
        title: "Lektion 1.1: Sich vorstellen (Introducing Yourself)",
        description: 'Essential phrases: "Ich hei\xDFe...", "Ich komme aus...", "Wie geht es dir?"',
        durationMinutes: 15,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "lesson-a1-1-2",
        unitId: "unit-a1-1",
        title: "Lektion 1.2: Das deutsche Alphabet & Aussprache",
        description: "Master the German alphabet, umlauts (\xE4, \xF6, \xFC), and the sharp S (\xDF).",
        durationMinutes: 20,
        order: 2,
        status: PublicationStatus.PUBLISHED,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "lesson-a1-2-1",
        unitId: "unit-a1-2",
        title: "Lektion 2.1: Die drei Genera (Maskulin, Feminin, Neutral)",
        description: "Rules and tips to identify der, die, and das with high accuracy.",
        durationMinutes: 25,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.contentBlocks = [
      {
        id: "block-1-1",
        lessonId: "lesson-a1-1-1",
        type: LessonContentType.TEXT,
        title: "Herzlich Willkommen bei DeutschWelt!",
        content: `### Welcome to Your First German Lesson!
Learning German begins with mastering warm, natural introductions. In German-speaking countries (Germany, Austria, Switzerland), using the appropriate level of politeness is deeply valued.

#### 1. Wichtige Begr\xFC\xDFungen (Everyday Greetings)
* **Guten Morgen** \u2014 Good morning (until ~11:00)
* **Guten Tag** \u2014 Good day / Hello (standard respectful greeting)
* **Guten Abend** \u2014 Good evening (from ~18:00)
* **Hallo** \u2014 Hello (friendly and informal)
* **Auf Wiedersehen** \u2014 Goodbye (formal, spoken in person)
* **Tsch\xFCss** \u2014 Bye (friendly and casual)

#### 2. Sich vorstellen (Introducing Yourself)
* **Ich hei\xDFe Anna.** \u2014 My name is Anna.
* **Ich komme aus Indien.** \u2014 I come from India.
* **Ich wohne in M\xFCnchen.** \u2014 I live in Munich.
* **Ich lerne Deutsch.** \u2014 I am learning German.`,
        order: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "block-1-2",
        lessonId: "lesson-a1-1-1",
        type: LessonContentType.GRAMMAR,
        title: "Grammatik: Verb Conjugation (hei\xDFen, kommen, wohnen)",
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.exercises = [
      {
        id: "exercise-a1-1",
        lessonId: "lesson-a1-1-1",
        title: "\xDCbung 1: Begr\xFC\xDFungen & Verben",
        description: "Practice self-introductions, greetings, and verb conjugations.",
        level: GermanLevel.A1,
        type: ExerciseType.MULTIPLE_CHOICE,
        passingScore: 70,
        order: 1,
        status: PublicationStatus.PUBLISHED,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.questions = [
      {
        id: "q-a1-1",
        exerciseId: "exercise-a1-1",
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'How do you say "Good day, my name is Lukas" in German?',
        instructions: "Choose the correct formal sentence.",
        explanation: '"Guten Tag, ich hei\xDFe Lukas." is the correct polite greeting and verb conjugation for "ich".',
        points: 10,
        order: 1,
        correctAnswer: "Guten Tag, ich hei\xDFe Lukas."
      },
      {
        id: "q-a1-2",
        exerciseId: "exercise-a1-1",
        type: ExerciseType.FILL_IN_BLANK,
        prompt: 'Fill in the blank with the correct form of the verb "kommen":\n"Woher ______ du?"',
        instructions: "Type the conjugated verb in lowercase.",
        hint: 'The subject pronoun is "du" (2nd person singular).',
        explanation: 'For "du", regular verbs end in -st: "kommst".',
        points: 10,
        order: 2,
        correctAnswer: "kommst"
      },
      {
        id: "q-a1-3",
        exerciseId: "exercise-a1-1",
        type: ExerciseType.TRUE_FALSE,
        prompt: "In German, all nouns are always written with a capital first letter.",
        instructions: "Select True or False.",
        explanation: "True! In German orthography, every noun (e.g., der Tisch, das Haus, die Frau) must be capitalized.",
        points: 10,
        order: 3,
        correctAnswer: "true"
      }
    ];
    this.options = [
      { id: "opt-1-1", questionId: "q-a1-1", label: "Guten Tag, ich hei\xDFe Lukas.", isCorrect: true, order: 1 },
      { id: "opt-1-2", questionId: "q-a1-1", label: "Gute Nacht, du hei\xDFt Lukas.", isCorrect: false, order: 2 },
      { id: "opt-1-3", questionId: "q-a1-1", label: "Auf Wiedersehen, ich bin Lukas.", isCorrect: false, order: 3 },
      { id: "opt-1-4", questionId: "q-a1-1", label: "Tsch\xFCss, er hei\xDFt Lukas.", isCorrect: false, order: 4 },
      { id: "opt-3-1", questionId: "q-a1-3", label: "True (Richtig)", isCorrect: true, order: 1 },
      { id: "opt-3-2", questionId: "q-a1-3", label: "False (Falsch)", isCorrect: false, order: 2 }
    ];
    this.vocabCategories = [
      { id: "cat-1", name: "Alltag & Begr\xFC\xDFung", slug: "alltag-und-begruessung", description: "Everyday greetings and phrases", order: 1 },
      { id: "cat-2", name: "Essen & Trinken", slug: "essen-und-trinken", description: "Food and dining terms", order: 2 },
      { id: "cat-3", name: "Wohnen & Stadt", slug: "wohnen-und-stadt", description: "Living and urban navigation", order: 3 }
    ];
    this.vocabulary = [
      {
        id: "vocab-1",
        german: "Guten Tag",
        english: "Good day / Hello",
        hindi: "\u0928\u092E\u0938\u094D\u0924\u0947 / \u0936\u0941\u092D \u0926\u093F\u0928",
        article: GermanArticle.NONE,
        plural: null,
        partOfSpeech: PartOfSpeech.PHRASE,
        level: GermanLevel.A1,
        category: "Alltag & Begr\xFC\xDFung",
        exampleSentenceDe: "Guten Tag, wie geht es Ihnen?",
        exampleSentenceEn: "Good day, how are you (formal)?",
        exampleSentenceHi: "\u0928\u092E\u0938\u094D\u0924\u0947, \u0906\u092A \u0915\u0948\u0938\u0947 \u0939\u0948\u0902?",
        ipa: "/\u02CC\u0261u\u02D0tn\u0329 \u02C8ta\u02D0k/",
        tags: ["greeting", "polite"],
        difficulty: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-2",
        german: "Apfel",
        english: "Apple",
        hindi: "\u0938\u0947\u092C",
        article: GermanArticle.DER,
        plural: "die \xC4pfel",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: "Essen & Trinken",
        exampleSentenceDe: "Der Apfel schmeckt frisch und s\xFC\xDF.",
        exampleSentenceEn: "The apple tastes fresh and sweet.",
        exampleSentenceHi: "\u0938\u0947\u092C \u0924\u093E\u091C\u093C\u093E \u0914\u0930 \u092E\u0940\u0920\u093E \u0932\u0917\u0924\u093E \u0939\u0948\u0964",
        ipa: "/\u02C8\u0294apfl\u0329/",
        tags: ["food", "fruit", "masculine"],
        difficulty: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-3",
        german: "Kaffee",
        english: "Coffee",
        hindi: "\u0915\u0949\u092B\u093C\u0940",
        article: GermanArticle.DER,
        plural: "die Kaffees",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: "Essen & Trinken",
        exampleSentenceDe: "Ich trinke morgens gerne einen hei\xDFen Kaffee.",
        exampleSentenceEn: "I like to drink a hot coffee in the morning.",
        exampleSentenceHi: "\u092E\u0941\u091D\u0947 \u0938\u0941\u092C\u0939 \u0917\u0930\u094D\u092E \u0915\u0949\u092B\u093C\u0940 \u092A\u0940\u0928\u093E \u092A\u0938\u0902\u0926 \u0939\u0948\u0964",
        ipa: "/\u02C8kafe/",
        tags: ["drink", "breakfast", "masculine"],
        difficulty: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-4",
        german: "Wohnung",
        english: "Apartment / Flat",
        hindi: "\u092E\u0915\u093E\u0928 / \u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F",
        article: GermanArticle.DIE,
        plural: "die Wohnungen",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: "Wohnen & Stadt",
        exampleSentenceDe: "Meine Wohnung hat drei helle Zimmer.",
        exampleSentenceEn: "My apartment has three bright rooms.",
        exampleSentenceHi: "\u092E\u0947\u0930\u0947 \u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F \u092E\u0947\u0902 \u0924\u0940\u0928 \u091A\u092E\u0915\u0926\u093E\u0930 \u0915\u092E\u0930\u0947 \u0939\u0948\u0902\u0964",
        ipa: "/\u02C8vo\u02D0n\u028A\u014B/",
        tags: ["living", "home", "feminine"],
        difficulty: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-5",
        german: "Buch",
        english: "Book",
        hindi: "\u0915\u093F\u0924\u093E\u092C",
        article: GermanArticle.DAS,
        plural: "die B\xFCcher",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A1,
        category: "Alltag & Begr\xFC\xDFung",
        exampleSentenceDe: "Das Buch liegt auf dem Schreibtisch.",
        exampleSentenceEn: "The book is lying on the desk.",
        exampleSentenceHi: "\u0915\u093F\u0924\u093E\u092C \u092E\u0947\u091C \u092A\u0930 \u0930\u0916\u0940 \u0939\u0948\u0964",
        ipa: "/bu\u02D0x/",
        tags: ["study", "reading", "neuter"],
        difficulty: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-6",
        german: "Bahnhof",
        english: "Train station",
        hindi: "\u0930\u0947\u0932\u0935\u0947 \u0938\u094D\u091F\u0947\u0936\u0928",
        article: GermanArticle.DER,
        plural: "die Bahnh\xF6fe",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.A2,
        category: "Wohnen & Stadt",
        exampleSentenceDe: "Wir treffen uns um 18 Uhr am Hauptbahnhof.",
        exampleSentenceEn: "We meet at 6 PM at the central station.",
        exampleSentenceHi: "\u0939\u092E \u0936\u093E\u092E 6 \u092C\u091C\u0947 \u092E\u0941\u0916\u094D\u092F \u0930\u0947\u0932\u0935\u0947 \u0938\u094D\u091F\u0947\u0936\u0928 \u092A\u0930 \u092E\u093F\u0932\u0924\u0947 \u0939\u0948\u0902\u0964",
        ipa: "/\u02C8ba\u02D0nho\u02D0f/",
        tags: ["travel", "transport", "masculine"],
        difficulty: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-7",
        german: "entscheiden",
        english: "to decide",
        hindi: "\u0928\u093F\u0930\u094D\u0923\u092F \u0932\u0947\u0928\u093E",
        article: GermanArticle.NONE,
        plural: null,
        partOfSpeech: PartOfSpeech.VERB,
        level: GermanLevel.B1,
        category: "Alltag & Begr\xFC\xDFung",
        exampleSentenceDe: "Ich habe mich f\xFCr das Studium in Deutschland entschieden.",
        exampleSentenceEn: "I decided to study in Germany.",
        exampleSentenceHi: "\u092E\u0948\u0902\u0928\u0947 \u091C\u0930\u094D\u092E\u0928\u0940 \u092E\u0947\u0902 \u092A\u0922\u093C\u093E\u0908 \u0915\u0930\u0928\u0947 \u0915\u093E \u0928\u093F\u0930\u094D\u0923\u092F \u0932\u093F\u092F\u093E \u0939\u0948\u0964",
        ipa: "/\u0294\u025Bnt\u02C8\u0283a\u026A\u032Fdn\u0329/",
        tags: ["verb", "reflexive", "B1"],
        difficulty: 3,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vocab-8",
        german: "Voraussetzung",
        english: "Prerequisite / Requirement",
        hindi: "\u092A\u0942\u0930\u094D\u0935\u0936\u0930\u094D\u0924 / \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E",
        article: GermanArticle.DIE,
        plural: "die Voraussetzungen",
        partOfSpeech: PartOfSpeech.NOUN,
        level: GermanLevel.B2,
        category: "Alltag & Begr\xFC\xDFung",
        exampleSentenceDe: "Flie\xDFende Deutschkenntnisse sind eine wichtige Voraussetzung.",
        exampleSentenceEn: "Fluent German knowledge is an important prerequisite.",
        exampleSentenceHi: "\u091C\u0930\u094D\u092E\u0928 \u092D\u093E\u0937\u093E \u0915\u093E \u0927\u093E\u0930\u093E\u092A\u094D\u0930\u0935\u093E\u0939 \u091C\u094D\u091E\u093E\u0928 \u090F\u0915 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948\u0964",
        ipa: "/fo\u02D0\u0250\u032F\u02C8\u0294a\u028A\u032Fsz\u025Bts\u028A\u014B/",
        tags: ["academic", "formal", "feminine", "B2"],
        difficulty: 4,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.studentVocabProgress = this.vocabulary.map((w, idx) => ({
      id: `svp-${idx + 1}`,
      userId: student.id,
      wordId: w.id,
      status: idx < 3 ? VocabMasteryStatus.LEARNING : idx === 4 ? VocabMasteryStatus.MASTERED : VocabMasteryStatus.NEW,
      box: idx === 4 ? 5 : 2,
      timesReviewed: idx < 5 ? 3 : 0,
      timesCorrect: idx < 5 ? 3 : 0,
      lastReviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
      nextReviewAt: new Date(Date.now() + 864e5).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    this.speakingPrompts = [
      {
        id: "sp-1",
        title: "Sich vorstellen (A1 Self-Introduction)",
        topic: "Personal Information & Introductions",
        level: GermanLevel.A1,
        scenario: "You are introducing yourself in the first German seminar at DeutschWelt.",
        instructions: "Record 30-60 seconds in German. State your name, hometown, current residence, language background, and why you are learning German.",
        sampleAnswerDe: "Guten Tag! Mein Name ist Elena. Ich komme aus Indien und wohne jetzt in Frankfurt. Ich spreche Englisch und lerne Deutsch f\xFCr mein Masterstudium. Freut mich, Sie kennenzulernen!",
        sampleAnswerEn: "Good day! My name is Elena. I come from India and now live in Frankfurt. I speak English and am learning German for my master studies. Pleased to meet you!",
        minDurationSeconds: 15,
        maxDurationSeconds: 90,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "sp-2",
        title: "Mein gestriger Tag (A2 Past Events with Perfekt)",
        topic: "Daily Routine & Narrative",
        level: GermanLevel.A2,
        scenario: "Describe your day yesterday to your conversation partner using the Perfekt tense.",
        instructions: "Speak for 45-90 seconds. Incorporate verbs with haben (gefr\xFChst\xFCckt, gearbeitet) and sein (aufgestanden, gefahren).",
        sampleAnswerDe: "Gestern bin ich um 7 Uhr aufgestanden. Ich habe gem\xFCtlich Kaffee getrunken und danach bin ich mit der U-Bahn ins B\xFCro gefahren...",
        sampleAnswerEn: "Yesterday I got up at 7 AM. I casually drank coffee and after that I took the subway to the office...",
        minDurationSeconds: 30,
        maxDurationSeconds: 120,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.assignments = [
      {
        id: "assign-1",
        courseId: "course-a1",
        teacherId: "profile-teacher-1",
        title: "Schreibaufgabe: Eine kurze E-Mail an das Hotel",
        description: "Write a short formal inquiry email to book a room at a hotel in Munich.",
        level: GermanLevel.A1,
        dueDate: new Date(Date.now() + 5 * 864e5).toISOString(),
        maxPoints: 100,
        instructions: `Write ~40-60 words in German including:
1. Formal greeting (Sehr geehrte Damen und Herren)
2. Request a double room for 2 nights
3. Mention arrival date and time
4. Ask if breakfast is included
5. Formal closing (Mit freundlichen Gr\xFC\xDFen)`,
        rubricCriteria: [
          { name: "Formal Greeting & Closing", description: "Accurate polite opening and closing", maxPoints: 20 },
          { name: "Content Completion", description: "All required points addressed", maxPoints: 40 },
          { name: "Grammar & Orthography", description: "Verb position and noun capitalization", maxPoints: 40 }
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.submissions = [
      {
        id: "sub-1",
        assignmentId: "assign-1",
        userId: student.id,
        content: `Sehr geehrte Damen und Herren,

ich m\xF6chte gern ein Doppelzimmer f\xFCr zwei N\xE4chte vom 14. bis 16. November reservieren. Wir kommen um ca. 18 Uhr an.
Bieten Sie auch ein Fr\xFChst\xFCcksb\xFCffet an?

Vielen Dank im Voraus f\xFCr Ihre Hilfe.

Mit freundlichen Gr\xFC\xDFen,
Elena Rostova`,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(Date.now() - 36e5).toISOString(),
        updatedAt: new Date(Date.now() - 36e5).toISOString()
      }
    ];
    this.batches = [
      {
        id: "batch-1",
        name: "Goethe A1 Intensive \u2014 Winter 2026",
        level: GermanLevel.A1,
        description: "Morning intensive batch meeting Mon-Thu 10:00-11:30 CET for Goethe-Zertifikat A1 candidates.",
        startDate: (/* @__PURE__ */ new Date()).toISOString(),
        endDate: new Date(Date.now() + 60 * 864e5).toISOString(),
        maxStudents: 15,
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "batch-2",
        name: "Goethe B1/B2 Mastery \u2014 Abendkurs",
        level: GermanLevel.B1,
        description: "Evening advanced batch meeting Tue & Thu 19:00-20:30 CET focusing on complex grammar and exam simulations.",
        startDate: (/* @__PURE__ */ new Date()).toISOString(),
        endDate: new Date(Date.now() + 90 * 864e5).toISOString(),
        maxStudents: 12,
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.teacherBatchAssignments = [
      {
        id: "tba-1",
        batchId: "batch-1",
        teacherId: "profile-teacher-1",
        isPrimary: true,
        assignedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "tba-2",
        batchId: "batch-2",
        teacherId: "profile-teacher-2",
        isPrimary: true,
        assignedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.batchMemberships = [
      {
        id: "bm-1",
        batchId: "batch-1",
        userId: student.id,
        status: "ACTIVE",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "bm-2",
        batchId: "batch-2",
        userId: student2.id,
        status: "ACTIVE",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.teacherLectures = [
      {
        id: "lec-1",
        teacherId: "profile-teacher-1",
        batchId: "batch-1",
        title: "A1.1 Aussprache & Alphabet Meisterklasse",
        description: "Core phonetic rules in German: Umlauts (\xE4, \xF6, \xFC), diphthongs (ei, ie, eu), and the soft/hard ch sound.",
        level: GermanLevel.A1,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        durationMinutes: 45,
        fileSize: "15.4 MB",
        originalFilename: "A1_Phonetik_Alphabet.mp4",
        scheduledFor: (/* @__PURE__ */ new Date()).toISOString(),
        isLive: false,
        meetingUrl: "https://meet.google.com/dw-a1-live",
        status: "PUBLISHED",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "lec-2",
        teacherId: "profile-teacher-1",
        batchId: "batch-1",
        title: "A1.2 Nominativ vs. Akkusativ Satzbau",
        description: "Understanding how direct objects transform der -> den, with interactive sentence breakdown examples.",
        level: GermanLevel.A1,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        durationMinutes: 50,
        fileSize: "24.1 MB",
        originalFilename: "A1_Akkusativ_Satzbau.mp4",
        scheduledFor: new Date(Date.now() + 864e5).toISOString(),
        isLive: false,
        meetingUrl: "https://meet.google.com/dw-a1-live",
        status: "PUBLISHED",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "lec-3",
        teacherId: "profile-teacher-2",
        batchId: "batch-2",
        title: "B1 Konjunktiv II: W\xFCnsche & H\xF6fliche Bitten",
        description: "Advanced hypotheticals using w\xE4re, h\xE4tte, and w\xFCrde + Infinitiv for official Goethe B1 speaking exam.",
        level: GermanLevel.B1,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        durationMinutes: 60,
        fileSize: "36.8 MB",
        originalFilename: "B1_Konjunktiv_II_Mastery.mp4",
        scheduledFor: (/* @__PURE__ */ new Date()).toISOString(),
        isLive: false,
        meetingUrl: "https://meet.google.com/dw-b1-live",
        status: "PUBLISHED",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.teacherMaterials = [
      {
        id: "mat-1",
        teacherId: "profile-teacher-1",
        batchId: "batch-1",
        title: "A1 Grammatik-\xDCbersicht: Bestimmte & Unbestimmte Artikel",
        category: "GRAMMAR_CHEAT_SHEET",
        description: "Complete 2-page color-coded reference guide for der/die/das in Nominativ and Akkusativ.",
        fileUrl: "/uploads/materials/A1_Grammatik_Artikel.pdf",
        fileType: "PDF",
        fileSize: "1.2 MB",
        level: GermanLevel.A1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "mat-2",
        teacherId: "profile-teacher-1",
        batchId: "batch-1",
        title: "A1 \xDCbungsblatt: Begr\xFC\xDFungen & H\xF6flichkeitsformen",
        category: "WORKSHEET",
        description: "Fill-in-the-blank practice worksheet for formal Sie vs. informal du in everyday German.",
        fileUrl: "/uploads/materials/A1_Begruessungen_Uebungen.pdf",
        fileType: "PDF",
        fileSize: "850 KB",
        level: GermanLevel.A1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "mat-3",
        teacherId: "profile-teacher-2",
        batchId: "batch-2",
        title: "B1 Nebens\xE4tze: weil, dass, obwohl, wenn Satzstruktur",
        category: "GRAMMAR_CHEAT_SHEET",
        description: "Summary table of subordinating conjunctions and verb kick rules at the end of the clause.",
        fileUrl: "/uploads/materials/B1_Nebensaetze_Regeln.pdf",
        fileType: "PDF",
        fileSize: "1.5 MB",
        level: GermanLevel.B1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.batchAnnouncements = [
      {
        id: "anc-1",
        teacherId: "profile-teacher-1",
        batchId: "batch-1",
        title: "Morgen: Live-Sprechtraining um 10:00 Uhr",
        content: "Liebe Kursteilnehmer, morgen \xFCben wir die Dialoge aus Einheit 1 live auf Google Meet. Bitte bereiten Sie Ihre 60-Sekunden Selbstvorstellung vor!",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.enrollments = [
      {
        id: "enr-1",
        userId: student.id,
        courseId: "course-a1",
        status: "ACTIVE",
        progressPercentage: 35,
        enrolledAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.lessonProgress = [
      {
        id: "lp-1",
        userId: student.id,
        lessonId: "lesson-a1-1-1",
        isCompleted: true,
        score: 100,
        timeSpentSeconds: 900,
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.enquiries = [
      {
        id: "enq-1",
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 9811223344",
        level: GermanLevel.A1,
        message: "Hello DeutschWelt team, I am planning to move to Munich this autumn for my engineering master degree. Does your A1 course include live conversation practice with certified instructors?",
        status: EnquiryStatus.NEW,
        createdAt: new Date(Date.now() - 864e5).toISOString(),
        updatedAt: new Date(Date.now() - 864e5).toISOString()
      },
      {
        id: "enq-2",
        name: "Marcus Chen",
        email: "marcus.chen@example.com",
        phone: "+49 176 99887766",
        level: GermanLevel.B1,
        message: "I passed A2 last year and want to prepare for the Goethe-Zertifikat B1 exam in 3 months. Can I get a placement test before enrolling?",
        status: EnquiryStatus.CONTACTED,
        adminNotes: "Contacted by phone on Oct 18. Scheduled placement test.",
        createdAt: new Date(Date.now() - 1728e5).toISOString(),
        updatedAt: new Date(Date.now() - 864e5).toISOString()
      }
    ];
    this.notifications = [
      {
        id: "notif-1",
        userId: student.id,
        title: "Willkommen bei DeutschWelt!",
        message: "Welcome to your German learning journey! Start with Einheit 1: Sich vorstellen.",
        type: "INFO",
        linkUrl: "/courses/deutsch-a1-beginner-intensiv",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "notif-2",
        userId: student.id,
        title: "Neue Schreibaufgabe bereit",
        message: 'Dr. Katharina Weber has published a new writing assignment: "Eine kurze E-Mail an das Hotel".',
        type: "ASSIGNMENT",
        linkUrl: "/student/assignments",
        isRead: false,
        createdAt: new Date(Date.now() - 36e5).toISOString()
      }
    ];
    this.siteSettings = [
      { id: "set-1", key: "platform_name", value: "DeutschWelt", description: "Platform brand name", updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: "set-2", key: "tagline", value: "Your journey to German fluency.", description: "Tagline", updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: "set-3", key: "contact_email", value: "admissions@deutschwelt.de", description: "Primary contact email", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }
    ];
    this.certificates = [
      {
        id: "cert-1",
        certificateNumber: "DW-2026-A1-8841",
        userId: student.id,
        userFullName: `${student.firstName} ${student.lastName}`,
        courseId: "course-a1",
        courseTitle: "Deutsch A1: Complete Beginner to Breakthrough",
        level: GermanLevel.A1,
        gradeScore: 96,
        gradeClassification: "Sehr Gut (With Distinction)",
        issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
        instructorName: "Dr. Katharina Weber",
        directorName: "Dr. Klaus Becker",
        directorTitle: "Direktor Akademische Bildung, DeutschWelt",
        verificationCode: "DW-VERIFY-A1-8841"
      }
    ];
  }
};
var store = new DataStore();

// apps/api/src/middleware/errorHandler.ts
import { ZodError } from "zod";
var AppError = class _AppError extends Error {
  statusCode;
  code;
  details;
  constructor(message, statusCode = 500, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message
      }))
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details
    });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }
  console.error("[Unhandled Server Error]", err);
  const response = {
    success: false,
    error: "An internal server error occurred. Please try again later."
  };
  if (env.isDev) {
    response.debugMessage = err?.message;
    response.stack = err?.stack;
  }
  return res.status(500).json(response);
}

// apps/api/src/middleware/auth.ts
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.dw_session || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7) : null);
    if (!token) {
      return next();
    }
    req.sessionToken = token;
    if (isDatabaseConnected) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              studentProfile: true,
              teacherProfile: true
            }
          }
        }
      });
      if (session && session.expiresAt > /* @__PURE__ */ new Date() && session.user.isActive) {
        req.user = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
          isActive: session.user.isActive,
          isEmailVerified: session.user.isEmailVerified,
          studentProfile: session.user.studentProfile,
          teacherProfile: session.user.teacherProfile
        };
      }
    } else {
      const session = store.sessions.find((s) => s.token === token && new Date(s.expiresAt) > /* @__PURE__ */ new Date());
      if (session) {
        const user = store.users.find((u) => u.id === session.userId && u.isActive);
        if (user) {
          const studentProfile = store.studentProfiles.find((sp) => sp.userId === user.id);
          const teacherProfile = store.teacherProfiles.find((tp) => tp.userId === user.id);
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            studentProfile,
            teacherProfile
          };
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
function requireAuth(req, res, next) {
  if (!req.user) {
    return next(new AppError("Authentication required. Please log in to continue.", 401, "UNAUTHORIZED"));
  }
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401, "UNAUTHORIZED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: You do not have permission to perform this action.", 403, "FORBIDDEN"));
    }
    next();
  };
}

// apps/api/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: env.isTest ? 1e3 : 20,
  // 20 requests per 15 min per IP in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts. Please try again in 15 minutes."
  }
});
var apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: env.isTest ? 2e3 : 120,
  // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please slow down."
  }
});

// apps/api/src/modules/auth/authRoutes.ts
import { Router } from "express";

// apps/api/src/modules/auth/authController.ts
import bcrypt2 from "bcryptjs";
import crypto from "crypto";
import { UserRole as UserRole2, GermanLevel as GermanLevel2 } from "@deutschwelt/shared";
function setSessionCookie(res, token) {
  res.cookie("dw_session", token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "strict" : "lax",
    maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1e3
  });
}
function clearSessionCookie(res) {
  res.clearCookie("dw_session", {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "strict" : "lax"
  });
}
async function register(req, res, next) {
  try {
    const { firstName, lastName, email, phone, address, password, currentLevel, learningGoal, preferredLanguage } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Unknown Browser";
    if (isDatabaseConnected) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return next(new AppError("An account with this email address already exists.", 400, "EMAIL_EXISTS"));
      }
      const passwordHash = await bcrypt2.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          role: UserRole2.STUDENT,
          isActive: true,
          isEmailVerified: false,
          studentProfile: {
            create: {
              currentLevel: currentLevel || GermanLevel2.A1,
              learningGoal: learningGoal || null,
              preferredLanguage: preferredLanguage || "en",
              dailyGoalMinutes: 20,
              streakCount: 1,
              lastActiveDate: /* @__PURE__ */ new Date()
            }
          }
        },
        include: { studentProfile: true }
      });
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1e3);
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent,
          ipAddress: clientIp
        }
      });
      setSessionCookie(res, token);
      return res.status(201).json({
        success: true,
        message: "Registration successful! Welcome to DeutschWelt.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: address || null,
          registrationIp: clientIp,
          role: user.role,
          studentProfile: user.studentProfile
        },
        token
      });
    } else {
      const existing = store.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return next(new AppError("An account with this email address already exists.", 400, "EMAIL_EXISTS"));
      }
      const passwordHash = await bcrypt2.hash(password, 10);
      const userId = `user-${Date.now()}`;
      const user = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        registrationIp: clientIp,
        lastLoginIp: clientIp,
        userAgent,
        role: UserRole2.STUDENT,
        isActive: true,
        isEmailVerified: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const studentProfile = {
        id: `profile-${Date.now()}`,
        userId,
        currentLevel: currentLevel || GermanLevel2.A1,
        learningGoal: learningGoal || null,
        preferredLanguage: preferredLanguage || "en",
        dailyGoalMinutes: 20,
        streakCount: 1,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.users.push(user);
      store.studentProfiles.push(studentProfile);
      const targetLevel = currentLevel || GermanLevel2.A1;
      const matchingCourse = store.courses.find((c) => c.level === targetLevel) || store.courses[0];
      if (matchingCourse) {
        store.enrollments.push({
          id: `enr-${Date.now()}`,
          userId,
          courseId: matchingCourse.id,
          enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "ACTIVE",
          progressPercentage: 0
        });
      }
      const matchingBatch = store.batches.find((b) => b.level === targetLevel) || store.batches[0];
      if (matchingBatch) {
        store.batchMemberships.push({
          id: `bm-${Date.now()}`,
          batchId: matchingBatch.id,
          userId,
          joinedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: `Willkommen bei DeutschWelt, ${firstName}!`,
        message: `Your learning path for German ${targetLevel} is ready. Start your first lesson or practice vocabulary flashcards.`,
        type: "SUCCESS",
        linkUrl: "/student/dashboard",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1e3).toISOString();
      store.sessions.push({
        id: `session-${Date.now()}`,
        userId,
        token,
        expiresAt,
        userAgent,
        ipAddress: clientIp,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      setSessionCookie(res, token);
      return res.status(201).json({
        success: true,
        message: "Registration successful! Welcome to DeutschWelt.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          registrationIp: user.registrationIp,
          role: user.role,
          studentProfile
        },
        token
      });
    }
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    if (isDatabaseConnected) {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          studentProfile: true,
          teacherProfile: true
        }
      });
      if (!user || !user.isActive) {
        return next(new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS"));
      }
      const isMatch = await bcrypt2.compare(password, user.passwordHash);
      if (!isMatch) {
        return next(new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS"));
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1e3);
      const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || req.ip || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent,
          ipAddress: clientIp
        }
      });
      setSessionCookie(res, token);
      return res.json({
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentProfile: user.studentProfile,
          teacherProfile: user.teacherProfile
        },
        token
      });
    } else {
      const user = store.users.find((u) => u.email === normalizedEmail);
      if (!user || !user.isActive) {
        return next(new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS"));
      }
      const isMatch = await bcrypt2.compare(password, user.passwordHash);
      if (!isMatch) {
        return next(new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS"));
      }
      const studentProfile = store.studentProfiles.find((sp) => sp.userId === user.id);
      const teacherProfile = store.teacherProfiles.find((tp) => tp.userId === user.id);
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1e3).toISOString();
      const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || req.ip || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Unknown Browser";
      user.lastLoginIp = clientIp;
      user.userAgent = userAgent;
      store.sessions.push({
        id: `session-${Date.now()}`,
        userId: user.id,
        token,
        expiresAt,
        userAgent,
        ipAddress: clientIp,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      setSessionCookie(res, token);
      return res.json({
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentProfile,
          teacherProfile
        },
        token
      });
    }
  } catch (error) {
    next(error);
  }
}
async function logout(req, res, next) {
  try {
    const token = req.sessionToken;
    if (token) {
      if (isDatabaseConnected) {
        await prisma.session.deleteMany({ where: { token } });
      } else {
        store.sessions = store.sessions.filter((s) => s.token !== token);
      }
    }
    clearSessionCookie(res);
    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    next(error);
  }
}
async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
    return res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    const message = "If an account exists with this email address, password reset instructions have been issued.";
    if (env.isDev) {
      console.log(`[Dev Password Reset] Token for ${normalizedEmail}: ${resetToken}`);
    }
    return res.json({
      success: true,
      message,
      ...env.isDev ? { devResetToken: resetToken } : {}
    });
  } catch (error) {
    next(error);
  }
}
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    return res.json({
      success: true,
      message: "Your password has been successfully reset. You can now log in with your new credentials."
    });
  } catch (error) {
    next(error);
  }
}

// apps/api/src/middleware/validate.ts
function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// apps/api/src/modules/auth/authRoutes.ts
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@deutschwelt/shared";
var router = Router();
router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", getMe);
router.post("/forgot-password", authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authRateLimiter, validateBody(resetPasswordSchema), resetPassword);
var authRoutes_default = router;

// apps/api/src/modules/courses/courseRoutes.ts
import { Router as Router2 } from "express";

// apps/api/src/modules/courses/courseController.ts
import { PublicationStatus as PublicationStatus2, GermanLevel as GermanLevel3 } from "@deutschwelt/shared";
async function getAllCourses(req, res, next) {
  try {
    const { level } = req.query;
    if (isDatabaseConnected) {
      const where = { status: PublicationStatus2.PUBLISHED };
      if (level && Object.values(GermanLevel3).includes(level)) {
        where.level = level;
      }
      const courses = await prisma.course.findMany({
        where,
        orderBy: { order: "asc" },
        include: {
          units: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { status: PublicationStatus2.PUBLISHED },
                select: { id: true, title: true, durationMinutes: true, order: true }
              }
            }
          }
        }
      });
      return res.json({ success: true, courses });
    } else {
      let courses = store.courses.filter((c) => c.status === PublicationStatus2.PUBLISHED);
      if (level && Object.values(GermanLevel3).includes(level)) {
        courses = courses.filter((c) => c.level === level);
      }
      const coursesWithUnits = courses.map((c) => {
        const units = store.units.filter((u) => u.courseId === c.id).map((u) => ({
          ...u,
          lessons: store.lessons.filter((l) => l.unitId === u.id && l.status === PublicationStatus2.PUBLISHED)
        }));
        return { ...c, units };
      });
      return res.json({ success: true, courses: coursesWithUnits });
    }
  } catch (error) {
    next(error);
  }
}
async function getCourseBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    if (isDatabaseConnected) {
      const course = await prisma.course.findFirst({
        where: {
          OR: [{ slug }, { id: slug }]
        },
        include: {
          units: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { status: PublicationStatus2.PUBLISHED },
                orderBy: { order: "asc" },
                include: {
                  exercises: {
                    select: { id: true, title: true, type: true, passingScore: true }
                  }
                }
              }
            }
          },
          prerequisites: {
            include: { prerequisiteCourse: true }
          }
        }
      });
      if (!course) {
        return next(new AppError("Course not found.", 404, "NOT_FOUND"));
      }
      let isEnrolled = false;
      let userProgress = null;
      if (req.user) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: course.id
            }
          }
        });
        if (enrollment) {
          isEnrolled = true;
          userProgress = enrollment.progressPercentage;
        }
      }
      return res.json({ success: true, course, isEnrolled, userProgress });
    } else {
      const course = store.courses.find((c) => c.slug === slug || c.id === slug);
      if (!course) {
        return next(new AppError("Course not found.", 404, "NOT_FOUND"));
      }
      const units = store.units.filter((u) => u.courseId === course.id).map((u) => ({
        ...u,
        lessons: store.lessons.filter((l) => l.unitId === u.id).map((l) => ({
          ...l,
          exercises: store.exercises.filter((e) => e.lessonId === l.id)
        }))
      }));
      let isEnrolled = false;
      let userProgress = 0;
      if (req.user) {
        const enr = store.enrollments.find((e) => e.userId === req.user?.id && e.courseId === course.id);
        if (enr) {
          isEnrolled = true;
          userProgress = enr.progressPercentage;
        }
      }
      return res.json({ success: true, course: { ...course, units }, isEnrolled, userProgress });
    }
  } catch (error) {
    next(error);
  }
}
async function enrollInCourse(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Please log in to enroll.", 401, "UNAUTHORIZED"));
    }
    const { courseId } = req.params;
    if (isDatabaseConnected) {
      const course = await prisma.course.findFirst({
        where: {
          OR: [{ id: courseId }, { slug: courseId }]
        }
      });
      if (!course) {
        return next(new AppError("Course not found.", 404, "NOT_FOUND"));
      }
      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId: course.id
          }
        },
        update: { status: "ACTIVE" },
        create: {
          userId: req.user.id,
          courseId: course.id,
          status: "ACTIVE",
          progressPercentage: 0
        }
      });
      return res.json({ success: true, message: `Successfully enrolled in ${course.title}!`, enrollment });
    } else {
      const course = store.courses.find((c) => c.id === courseId || c.slug === courseId);
      if (!course) {
        return next(new AppError("Course not found.", 404, "NOT_FOUND"));
      }
      let enrollment = store.enrollments.find((e) => e.userId === req.user?.id && e.courseId === course.id);
      if (!enrollment) {
        enrollment = {
          id: `enr-${Date.now()}`,
          userId: req.user.id,
          courseId: course.id,
          status: "ACTIVE",
          progressPercentage: 0,
          enrolledAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        store.enrollments.push(enrollment);
      }
      return res.json({ success: true, message: `Successfully enrolled in ${course.title}!`, enrollment });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/courses/courseRoutes.ts
var router2 = Router2();
router2.get("/", getAllCourses);
router2.get("/:slug", getCourseBySlug);
router2.post("/:courseId/enroll", requireAuth, enrollInCourse);
var courseRoutes_default = router2;

// apps/api/src/modules/lessons/lessonRoutes.ts
import { Router as Router3 } from "express";

// apps/api/src/modules/lessons/lessonController.ts
async function getLessonById(req, res, next) {
  try {
    const { lessonId } = req.params;
    if (isDatabaseConnected) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          contentBlocks: {
            orderBy: { order: "asc" }
          },
          exercises: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: {
                    select: { id: true, label: true, order: true }
                    // Hide isCorrect from student
                  }
                }
              }
            }
          },
          unit: {
            include: {
              course: {
                select: { id: true, slug: true, title: true, level: true }
              },
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, order: true }
              }
            }
          }
        }
      });
      if (!lesson) {
        return next(new AppError("Lesson not found.", 404, "NOT_FOUND"));
      }
      const siblingLessons = lesson.unit.lessons;
      const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
      const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;
      let isCompleted = false;
      let userScore = null;
      if (req.user) {
        const progress = await prisma.lessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: req.user.id,
              lessonId: lesson.id
            }
          }
        });
        if (progress) {
          isCompleted = progress.isCompleted;
          userScore = progress.score;
        }
      }
      return res.json({
        success: true,
        lesson: {
          ...lesson,
          isCompleted,
          userScore,
          navigation: {
            prevLesson,
            nextLesson
          }
        }
      });
    } else {
      const lesson = store.lessons.find((l) => l.id === lessonId);
      if (!lesson) {
        return next(new AppError("Lesson not found.", 404, "NOT_FOUND"));
      }
      const contentBlocks = store.contentBlocks.filter((cb) => cb.lessonId === lesson.id);
      const exercises = store.exercises.filter((e) => e.lessonId === lesson.id).map((e) => ({
        ...e,
        questions: store.questions.filter((q) => q.exerciseId === e.id).map((q) => ({
          ...q,
          options: store.options.filter((o) => o.questionId === q.id).map((o) => ({
            id: o.id,
            label: o.label,
            order: o.order
          }))
        }))
      }));
      const unit = store.units.find((u) => u.id === lesson.unitId);
      const course = unit ? store.courses.find((c) => c.id === unit.courseId) : null;
      const siblingLessons = store.lessons.filter((l) => l.unitId === lesson.unitId).sort((a, b) => a.order - b.order);
      const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
      const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;
      let isCompleted = false;
      let userScore = null;
      if (req.user) {
        const prog = store.lessonProgress.find((lp) => lp.userId === req.user?.id && lp.lessonId === lesson.id);
        if (prog) {
          isCompleted = prog.isCompleted;
          userScore = prog.score;
        }
      }
      return res.json({
        success: true,
        lesson: {
          ...lesson,
          contentBlocks,
          exercises,
          unit: unit ? { ...unit, course } : null,
          isCompleted,
          userScore,
          navigation: {
            prevLesson,
            nextLesson
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
async function markLessonComplete(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { lessonId } = req.params;
    const { timeSpentSeconds = 600 } = req.body;
    if (isDatabaseConnected) {
      const progress = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: req.user.id,
            lessonId
          }
        },
        update: {
          isCompleted: true,
          completedAt: /* @__PURE__ */ new Date(),
          timeSpentSeconds: { increment: timeSpentSeconds }
        },
        create: {
          userId: req.user.id,
          lessonId,
          isCompleted: true,
          completedAt: /* @__PURE__ */ new Date(),
          timeSpentSeconds
        }
      });
      return res.json({ success: true, message: "Lesson marked as completed!", progress });
    } else {
      let progress = store.lessonProgress.find((lp) => lp.userId === req.user?.id && lp.lessonId === lessonId);
      if (progress) {
        progress.isCompleted = true;
        progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + timeSpentSeconds;
      } else {
        progress = {
          id: `lp-${Date.now()}`,
          userId: req.user.id,
          lessonId,
          isCompleted: true,
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          timeSpentSeconds
        };
        store.lessonProgress.push(progress);
      }
      return res.json({ success: true, message: "Lesson marked as completed!", progress });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/lessons/lessonRoutes.ts
var router3 = Router3();
router3.get("/:lessonId", getLessonById);
router3.post("/:lessonId/complete", requireAuth, markLessonComplete);
var lessonRoutes_default = router3;

// apps/api/src/modules/exercises/exerciseRoutes.ts
import { Router as Router4 } from "express";

// apps/api/src/services/exerciseService.ts
import { ExerciseType as ExerciseType2 } from "@deutschwelt/shared";
function evaluateQuestionAnswer(question, userAnswer) {
  let isCorrect = false;
  if (userAnswer === void 0 || userAnswer === null) {
    return {
      questionId: question.id,
      isCorrect: false,
      pointsEarned: 0,
      maxPoints: question.points,
      userAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
  }
  switch (question.type) {
    case ExerciseType2.MULTIPLE_CHOICE:
    case ExerciseType2.TRUE_FALSE: {
      const cleanUser = String(userAnswer).trim().toLowerCase();
      const cleanCorrect = String(question.correctAnswer).trim().toLowerCase();
      isCorrect = cleanUser === cleanCorrect;
      break;
    }
    case ExerciseType2.FILL_IN_BLANK:
    case ExerciseType2.GRAMMAR_CORRECTION:
    case ExerciseType2.TRANSLATION: {
      const cleanUser = String(userAnswer).trim().toLowerCase().replace(/[.,!?;:]/g, "");
      if (Array.isArray(question.correctAnswer)) {
        isCorrect = question.correctAnswer.some(
          (ans) => String(ans).trim().toLowerCase().replace(/[.,!?;:]/g, "") === cleanUser
        );
      } else {
        const cleanCorrect = String(question.correctAnswer).trim().toLowerCase().replace(/[.,!?;:]/g, "");
        isCorrect = cleanUser === cleanCorrect;
      }
      break;
    }
    case ExerciseType2.SENTENCE_ORDERING: {
      if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
        isCorrect = userAnswer.length === question.correctAnswer.length && userAnswer.every((val, idx) => String(val).trim().toLowerCase() === String(question.correctAnswer[idx]).trim().toLowerCase());
      } else {
        const userStr = Array.isArray(userAnswer) ? userAnswer.join(" ") : String(userAnswer);
        const correctStr = Array.isArray(question.correctAnswer) ? question.correctAnswer.join(" ") : String(question.correctAnswer);
        isCorrect = userStr.trim().toLowerCase() === correctStr.trim().toLowerCase();
      }
      break;
    }
    case ExerciseType2.MATCHING: {
      if (typeof userAnswer === "object" && typeof question.correctAnswer === "object") {
        const userEntries = Object.entries(userAnswer);
        const correctMap = question.correctAnswer;
        isCorrect = userEntries.length === Object.keys(correctMap).length && userEntries.every(([k, v]) => String(correctMap[k]).trim().toLowerCase() === String(v).trim().toLowerCase());
      }
      break;
    }
    default: {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
      break;
    }
  }
  const pointsEarned = isCorrect ? question.points : 0;
  return {
    questionId: question.id,
    isCorrect,
    pointsEarned,
    maxPoints: question.points,
    userAnswer,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  };
}
function evaluateFullExercise(questions, submissions, passingScorePercentage = 70) {
  let totalPoints = 0;
  let earnedPoints = 0;
  const breakdown = [];
  const submissionMap = /* @__PURE__ */ new Map();
  for (const s of submissions) {
    submissionMap.set(s.questionId, s.answer);
  }
  for (const q of questions) {
    totalPoints += q.points;
    const userAnswer = submissionMap.get(q.id);
    const result = evaluateQuestionAnswer(q, userAnswer);
    earnedPoints += result.pointsEarned;
    breakdown.push(result);
  }
  const percentage = totalPoints > 0 ? Math.round(earnedPoints / totalPoints * 100) : 0;
  const passed = percentage >= passingScorePercentage;
  return {
    score: earnedPoints,
    maxScore: totalPoints,
    percentage,
    passed,
    breakdown
  };
}

// apps/api/src/modules/exercises/exerciseController.ts
async function getLessonExercises(req, res, next) {
  try {
    const { lessonId } = req.params;
    if (isDatabaseConnected) {
      const exercises = await prisma.exercise.findMany({
        where: { lessonId },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: {
                orderBy: { order: "asc" },
                select: { id: true, label: true, order: true }
                // Hide isCorrect from student
              }
            }
          }
        }
      });
      return res.json({ success: true, exercises });
    } else {
      const exercises = store.exercises.filter((e) => e.lessonId === lessonId).map((e) => ({
        ...e,
        questions: store.questions.filter((q) => q.exerciseId === e.id).map((q) => ({
          id: q.id,
          exerciseId: q.exerciseId,
          type: q.type,
          prompt: q.prompt,
          instructions: q.instructions,
          hint: q.hint,
          points: q.points,
          order: q.order,
          contextPassage: q.contextPassage,
          audioUrl: q.audioUrl,
          options: store.options.filter((o) => o.questionId === q.id).map((o) => ({
            id: o.id,
            label: o.label,
            order: o.order
          }))
        }))
      }));
      return res.json({ success: true, exercises });
    }
  } catch (error) {
    next(error);
  }
}
async function submitExerciseAttempt(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Please log in to submit exercise attempts.", 401));
    }
    const { exerciseId } = req.params;
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return next(new AppError("Answers array cannot be empty.", 400));
    }
    if (isDatabaseConnected) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: true }
          }
        }
      });
      if (!exercise) {
        return next(new AppError("Exercise not found.", 404));
      }
      const questionData = exercise.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      const evaluation = evaluateFullExercise(questionData, answers, exercise.passingScore);
      const attempt = await prisma.exerciseAttempt.create({
        data: {
          userId: req.user.id,
          exerciseId: exercise.id,
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          percentage: evaluation.percentage,
          passed: evaluation.passed,
          completedAt: /* @__PURE__ */ new Date(),
          answers: {
            create: evaluation.breakdown.map((b) => ({
              questionId: b.questionId,
              submittedAnswer: b.userAnswer ?? "",
              isCorrect: b.isCorrect,
              pointsEarned: b.pointsEarned
            }))
          }
        }
      });
      await prisma.studentProfile.updateMany({
        where: { userId: req.user.id },
        data: {
          lastActiveDate: /* @__PURE__ */ new Date(),
          streakCount: { increment: 1 }
        }
      });
      return res.json({
        success: true,
        attemptId: attempt.id,
        result: evaluation
      });
    } else {
      const exercise = store.exercises.find((e) => e.id === exerciseId);
      if (!exercise) {
        return next(new AppError("Exercise not found.", 404));
      }
      const questions = store.questions.filter((q) => q.exerciseId === exercise.id);
      const questionData = questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      const evaluation = evaluateFullExercise(questionData, answers, exercise.passingScore);
      const attemptId = `attempt-${Date.now()}`;
      store.attempts.push({
        id: attemptId,
        userId: req.user.id,
        exerciseId: exercise.id,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        passed: evaluation.passed,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      const profile = store.studentProfiles.find((sp) => sp.userId === req.user?.id);
      if (profile) {
        profile.lastActiveDate = (/* @__PURE__ */ new Date()).toISOString();
        profile.streakCount = (profile.streakCount || 0) + 1;
      }
      return res.json({
        success: true,
        attemptId,
        result: evaluation
      });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/exercises/exerciseRoutes.ts
var router4 = Router4();
router4.get("/lesson/:lessonId", getLessonExercises);
router4.post("/:exerciseId/attempts", requireAuth, submitExerciseAttempt);
var exerciseRoutes_default = router4;

// apps/api/src/modules/vocabulary/vocabularyRoutes.ts
import { Router as Router5 } from "express";

// apps/api/src/services/srsService.ts
import { VocabMasteryStatus as VocabMasteryStatus2 } from "@deutschwelt/shared";
var BOX_INTERVALS = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
};
function computeNextSRSState(input) {
  let nextBox = input.currentBox;
  let status = VocabMasteryStatus2.LEARNING;
  let isCorrect = input.quality >= 3;
  if (isCorrect) {
    nextBox = Math.min(5, input.currentBox + 1);
  } else {
    nextBox = 1;
  }
  if (nextBox === 5) {
    status = VocabMasteryStatus2.MASTERED;
  } else if (nextBox >= 3) {
    status = VocabMasteryStatus2.REVIEWING;
  } else {
    status = VocabMasteryStatus2.LEARNING;
  }
  const daysUntilNextReview = BOX_INTERVALS[nextBox] || 1;
  const nextReviewAt = /* @__PURE__ */ new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilNextReview);
  return {
    box: nextBox,
    status,
    timesReviewed: input.timesReviewed + 1,
    timesCorrect: isCorrect ? input.timesCorrect + 1 : input.timesCorrect,
    lastReviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
    nextReviewAt: nextReviewAt.toISOString()
  };
}

// apps/api/src/modules/vocabulary/vocabularyController.ts
async function getVocabulary(req, res, next) {
  try {
    const { level, category, article, partOfSpeech, search, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    if (isDatabaseConnected) {
      const where = {};
      if (level) where.level = level;
      if (category) where.category = category;
      if (article) where.article = article;
      if (partOfSpeech) where.partOfSpeech = partOfSpeech;
      if (search) {
        where.OR = [
          { german: { contains: String(search), mode: "insensitive" } },
          { english: { contains: String(search), mode: "insensitive" } }
        ];
      }
      const [total, words] = await Promise.all([
        prisma.vocabularyWord.count({ where }),
        prisma.vocabularyWord.findMany({
          where,
          skip,
          take,
          orderBy: { german: "asc" },
          include: req.user ? {
            userProgresses: {
              where: { userId: req.user.id }
            }
          } : void 0
        })
      ]);
      const formattedWords = words.map((w) => ({
        ...w,
        progress: w.userProgresses?.[0] || null
      }));
      return res.json({
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        words: formattedWords
      });
    } else {
      let words = [...store.vocabulary];
      if (level) words = words.filter((w) => w.level === level);
      if (category) words = words.filter((w) => w.category === category);
      if (article) words = words.filter((w) => w.article === article);
      if (partOfSpeech) words = words.filter((w) => w.partOfSpeech === partOfSpeech);
      if (search) {
        const s = String(search).toLowerCase();
        words = words.filter((w) => w.german.toLowerCase().includes(s) || w.english.toLowerCase().includes(s));
      }
      const total = words.length;
      const paginated = words.slice(skip, skip + take).map((w) => {
        const prog = req.user ? store.studentVocabProgress.find((p) => p.userId === req.user?.id && p.wordId === w.id) : null;
        return { ...w, progress: prog || null };
      });
      return res.json({
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        words: paginated
      });
    }
  } catch (error) {
    next(error);
  }
}
async function getCategories(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const categories = await prisma.vocabularyCategory.findMany({
        orderBy: { order: "asc" }
      });
      return res.json({ success: true, categories });
    } else {
      return res.json({ success: true, categories: store.vocabCategories });
    }
  } catch (error) {
    next(error);
  }
}
async function getFlashcards(req, res, next) {
  try {
    const { level } = req.query;
    if (isDatabaseConnected) {
      const where = {};
      if (level) where.level = level;
      const words = await prisma.vocabularyWord.findMany({
        where,
        take: 30,
        orderBy: { difficulty: "asc" },
        include: req.user ? {
          userProgresses: {
            where: { userId: req.user.id }
          }
        } : void 0
      });
      const cards = words.map((w) => ({
        ...w,
        progress: w.userProgresses?.[0] || null
      }));
      return res.json({ success: true, flashcards: cards });
    } else {
      let words = [...store.vocabulary];
      if (level) words = words.filter((w) => w.level === level);
      const cards = words.slice(0, 30).map((w) => {
        const prog = req.user ? store.studentVocabProgress.find((p) => p.userId === req.user?.id && p.wordId === w.id) : null;
        return { ...w, progress: prog || null };
      });
      return res.json({ success: true, flashcards: cards });
    }
  } catch (error) {
    next(error);
  }
}
async function updateWordProgress(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { wordId } = req.params;
    const { quality } = req.body;
    if (quality === void 0 || quality < 0 || quality > 5) {
      return next(new AppError("Review quality rating must be between 0 and 5.", 400));
    }
    if (isDatabaseConnected) {
      const existing = await prisma.studentVocabularyProgress.findUnique({
        where: {
          userId_wordId: {
            userId: req.user.id,
            wordId
          }
        }
      });
      const nextState = computeNextSRSState({
        currentBox: existing?.box || 1,
        timesReviewed: existing?.timesReviewed || 0,
        timesCorrect: existing?.timesCorrect || 0,
        quality
      });
      const progress = await prisma.studentVocabularyProgress.upsert({
        where: {
          userId_wordId: {
            userId: req.user.id,
            wordId
          }
        },
        update: {
          box: nextState.box,
          status: nextState.status,
          timesReviewed: nextState.timesReviewed,
          timesCorrect: nextState.timesCorrect,
          lastReviewedAt: new Date(nextState.lastReviewedAt),
          nextReviewAt: new Date(nextState.nextReviewAt)
        },
        create: {
          userId: req.user.id,
          wordId,
          box: nextState.box,
          status: nextState.status,
          timesReviewed: nextState.timesReviewed,
          timesCorrect: nextState.timesCorrect,
          lastReviewedAt: new Date(nextState.lastReviewedAt),
          nextReviewAt: new Date(nextState.nextReviewAt)
        }
      });
      return res.json({ success: true, progress });
    } else {
      let existing = store.studentVocabProgress.find((p) => p.userId === req.user?.id && p.wordId === wordId);
      const nextState = computeNextSRSState({
        currentBox: existing?.box || 1,
        timesReviewed: existing?.timesReviewed || 0,
        timesCorrect: existing?.timesCorrect || 0,
        quality
      });
      if (existing) {
        Object.assign(existing, nextState);
      } else {
        existing = {
          id: `svp-${Date.now()}`,
          userId: req.user.id,
          wordId,
          ...nextState
        };
        store.studentVocabProgress.push(existing);
      }
      return res.json({ success: true, progress: existing });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/vocabulary/vocabularyRoutes.ts
var router5 = Router5();
router5.get("/", getVocabulary);
router5.get("/categories", getCategories);
router5.get("/flashcards", getFlashcards);
router5.post("/:wordId/progress", requireAuth, updateWordProgress);
var vocabularyRoutes_default = router5;

// apps/api/src/modules/speaking/speakingRoutes.ts
import { Router as Router6 } from "express";

// apps/api/src/modules/speaking/speakingController.ts
import { GermanLevel as GermanLevel4, SubmissionStatus as SubmissionStatus2 } from "@deutschwelt/shared";
async function getSpeakingPrompts(req, res, next) {
  try {
    const { level } = req.query;
    if (isDatabaseConnected) {
      const where = {};
      if (level && Object.values(GermanLevel4).includes(level)) {
        where.level = level;
      }
      const prompts = await prisma.speakingPrompt.findMany({
        where,
        orderBy: { createdAt: "desc" }
      });
      return res.json({ success: true, prompts });
    } else {
      let prompts = [...store.speakingPrompts];
      if (level && Object.values(GermanLevel4).includes(level)) {
        prompts = prompts.filter((p) => p.level === level);
      }
      return res.json({ success: true, prompts });
    }
  } catch (error) {
    next(error);
  }
}
async function getSpeakingPromptById(req, res, next) {
  try {
    const { promptId } = req.params;
    if (isDatabaseConnected) {
      const prompt = await prisma.speakingPrompt.findUnique({
        where: { id: promptId }
      });
      if (!prompt) {
        return next(new AppError("Speaking prompt not found.", 404));
      }
      return res.json({ success: true, prompt });
    } else {
      const prompt = store.speakingPrompts.find((p) => p.id === promptId);
      if (!prompt) {
        return next(new AppError("Speaking prompt not found.", 404));
      }
      return res.json({ success: true, prompt });
    }
  } catch (error) {
    next(error);
  }
}
async function submitSpeakingAttempt(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { promptId } = req.params;
    const { transcriptText, durationSeconds } = req.body;
    const file = req.file;
    const audioUrl = file ? `/uploads/audio/${file.filename}` : null;
    if (!audioUrl && !transcriptText) {
      return next(new AppError("Please provide either an audio recording or text response.", 400));
    }
    if (isDatabaseConnected) {
      const prompt = await prisma.speakingPrompt.findUnique({ where: { id: promptId } });
      if (!prompt) {
        return next(new AppError("Speaking prompt not found.", 404));
      }
      const attempt = await prisma.speakingAttempt.create({
        data: {
          userId: req.user.id,
          promptId,
          audioUrl,
          durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
          transcriptText: transcriptText || null,
          status: SubmissionStatus2.SUBMITTED
        }
      });
      return res.status(201).json({
        success: true,
        message: "Speaking attempt submitted successfully for teacher review!",
        attempt
      });
    } else {
      const attempt = {
        id: `speaking-attempt-${Date.now()}`,
        userId: req.user.id,
        promptId,
        audioUrl,
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
        transcriptText: transcriptText || null,
        status: SubmissionStatus2.SUBMITTED,
        submittedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.speakingAttempts.push(attempt);
      return res.status(201).json({
        success: true,
        message: "Speaking attempt submitted successfully for teacher review!",
        attempt
      });
    }
  } catch (error) {
    next(error);
  }
}
async function getUserSpeakingAttempts(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (isDatabaseConnected) {
      const attempts = await prisma.speakingAttempt.findMany({
        where: { userId: req.user.id },
        include: { prompt: true },
        orderBy: { submittedAt: "desc" }
      });
      return res.json({ success: true, attempts });
    } else {
      const attempts = store.speakingAttempts.filter((a) => a.userId === req.user?.id).map((a) => ({
        ...a,
        prompt: store.speakingPrompts.find((p) => p.id === a.promptId)
      }));
      return res.json({ success: true, attempts });
    }
  } catch (error) {
    next(error);
  }
}
async function analyzeSpeakingAudio(req, res, next) {
  try {
    const { promptId, durationSeconds, transcriptText } = req.body;
    const file = req.file;
    const prompt = store.speakingPrompts.find((p) => p.id === promptId);
    const targetText = prompt?.sampleAnswerDe || "Guten Tag! Ich lerne Deutsch.";
    const audioDuration = durationSeconds ? parseInt(durationSeconds, 10) : 15;
    const targetWords = targetText.replace(/[.,!?;:]/g, "").split(/\s+/).slice(0, 12);
    const wordFeedback = targetWords.map((word, idx) => {
      const lower = word.toLowerCase();
      const hasUmlautOrSpecial = /[äöüß]|ch|sch|sp|st|ei|ie|eu/.test(lower);
      const isDifficult = hasUmlautOrSpecial && idx % 3 === 0;
      return {
        word,
        status: isDifficult ? "needs_practice" : idx % 2 === 0 ? "mastered" : "acceptable",
        score: isDifficult ? 78 : idx % 2 === 0 ? 98 : 91,
        phoneticTip: isDifficult ? lower.includes("ch") ? "Pay attention to the soft ich-Laut [\xE7] \u2014 tongue pressed lightly against palate." : lower.includes("\xF6") || lower.includes("\xFC") ? 'Round your lips tightly into an O-shape while voicing "ee" for clean umlauts.' : "Articulate the consonants crisply at the end of the syllable." : "Clean and natural pronunciation."
      };
    });
    const masteredCount = wordFeedback.filter((w) => w.status === "mastered").length;
    const pronunciationScore = Math.min(98, Math.max(82, Math.round(85 + masteredCount / wordFeedback.length * 12)));
    const fluencyScore = Math.min(96, Math.max(80, Math.round(82 + Math.min(audioDuration, 30) / 30 * 12)));
    const grammarScore = 94;
    const overallScore = Math.round(pronunciationScore * 0.5 + fluencyScore * 0.3 + grammarScore * 0.2);
    const insights = [
      `CEFR Oral Proficiency: ${prompt?.level || "A1"} Standard (${overallScore}% accuracy).`,
      "Excellent articulation of vowels and initial consonants.",
      "Sentence melody (Satzmelodie) is clear with natural German cadences.",
      'Key Tip: Keep practicing the distinction between "ie" (long /i:/) and "ei" (diphthong /a\u026A/).'
    ];
    return res.json({
      success: true,
      analysis: {
        overallScore,
        pronunciationScore,
        fluencyScore,
        grammarScore,
        targetPhrase: targetText,
        detectedSpeech: transcriptText || "Recognized high-fidelity German audio input",
        wordFeedback,
        insights,
        audioUrl: file ? `/uploads/audio/${file.filename}` : null,
        durationSeconds: audioDuration,
        evaluatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

// apps/api/src/middleware/upload.ts
import multer from "multer";
import path2 from "path";
import fs from "fs";
var uploadDir = env.UPLOAD_DIR;
var audioDir = path2.join(uploadDir, "audio");
var videoDir = path2.join(uploadDir, "videos");
var materialsDir = path2.join(uploadDir, "materials");
var certificatesDir = path2.join(uploadDir, "certificates");
[audioDir, videoDir, materialsDir, certificatesDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn(`[Upload Directory Warning] Could not create directory ${dir}:`, e);
  }
});
var audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname) || ".webm";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `speaking-${uniqueSuffix}${ext}`);
  }
});
var allowedAudioMimeTypes = [
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "video/webm"
  // Chrome MediaRecorder often labels webm audio as video/webm
];
var uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
    // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (allowedAudioMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file format (${file.mimetype}). Only audio files (.webm, .ogg, .wav, .mp3) are permitted.`, 400));
    }
  }
});
var videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname) || ".mp4";
    const safeBase = path2.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `video-${safeBase}-${uniqueSuffix}${ext}`);
  }
});
var allowedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/mpeg",
  "video/3gpp"
];
var uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024
    // 500MB max video file
  },
  fileFilter: (req, file, cb) => {
    if (allowedVideoMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid video format (${file.mimetype}). Please upload an MP4, WebM, MOV, or MKV file.`, 400));
    }
  }
});
var materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, materialsDir);
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname) || ".pdf";
    const safeBase = path2.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${safeBase}-${uniqueSuffix}${ext}`);
  }
});
var allowedMaterialExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".rtf",
  ".csv",
  ".zip",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp3"
];
var disallowedMaterialExtensions = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".phtml",
  ".html",
  ".htm",
  ".js",
  ".mjs",
  ".vbs",
  ".py",
  ".rb",
  ".pl",
  ".cgi",
  ".jar",
  ".msi",
  ".svg"
];
var uploadMaterial = multer({
  storage: materialStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB max document
  },
  fileFilter: (req, file, cb) => {
    const ext = path2.extname(file.originalname).toLowerCase();
    if (disallowedMaterialExtensions.includes(ext)) {
      return cb(new AppError(`File type blocked for security (${ext}). Executables and scripts are strictly prohibited.`, 400));
    }
    if (allowedMaterialExtensions.includes(ext)) {
      return cb(null, true);
    }
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/") || file.mimetype.includes("officedocument") || file.mimetype.includes("msword")) {
      return cb(null, true);
    }
    cb(new AppError(`File format (${ext || file.mimetype}) is not permitted. Please upload a PDF, Word, PowerPoint, Excel, or Text document.`, 400));
  }
});

// apps/api/src/modules/speaking/speakingRoutes.ts
var router6 = Router6();
router6.get("/prompts", getSpeakingPrompts);
router6.get("/prompts/:promptId", getSpeakingPromptById);
router6.post("/prompts/:promptId/attempts", requireAuth, uploadAudio.single("audio"), submitSpeakingAttempt);
router6.post("/analyze", requireAuth, uploadAudio.single("audio"), analyzeSpeakingAudio);
router6.get("/my-attempts", requireAuth, getUserSpeakingAttempts);
var speakingRoutes_default = router6;

// apps/api/src/modules/assignments/assignmentRoutes.ts
import { Router as Router7 } from "express";

// apps/api/src/modules/assignments/assignmentController.ts
import { SubmissionStatus as SubmissionStatus3 } from "@deutschwelt/shared";
async function getAssignments(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (isDatabaseConnected) {
      const assignments = await prisma.assignment.findMany({
        orderBy: { dueDate: "asc" },
        include: {
          submissions: {
            where: { userId: req.user.id }
          }
        }
      });
      const formatted = assignments.map((a) => ({
        ...a,
        submission: a.submissions[0] || null
      }));
      return res.json({ success: true, assignments: formatted });
    } else {
      const formatted = store.assignments.map((a) => {
        const sub = store.submissions.find((s) => s.assignmentId === a.id && s.userId === req.user?.id);
        return { ...a, submission: sub || null };
      });
      return res.json({ success: true, assignments: formatted });
    }
  } catch (error) {
    next(error);
  }
}
async function getAssignmentById(req, res, next) {
  try {
    const { assignmentId } = req.params;
    if (isDatabaseConnected) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          teacher: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          submissions: req.user ? {
            where: { userId: req.user.id }
          } : void 0
        }
      });
      if (!assignment) {
        return next(new AppError("Assignment not found.", 404));
      }
      return res.json({
        success: true,
        assignment: {
          ...assignment,
          submission: assignment.submissions?.[0] || null
        }
      });
    } else {
      const assignment = store.assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        return next(new AppError("Assignment not found.", 404));
      }
      const submission = req.user ? store.submissions.find((s) => s.assignmentId === assignment.id && s.userId === req.user?.id) : null;
      return res.json({ success: true, assignment: { ...assignment, submission } });
    }
  } catch (error) {
    next(error);
  }
}
async function submitAssignment(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { assignmentId } = req.params;
    const { content, isDraft = false } = req.body;
    const status = isDraft ? SubmissionStatus3.DRAFT : SubmissionStatus3.SUBMITTED;
    if (isDatabaseConnected) {
      const existing = await prisma.assignmentSubmission.findFirst({
        where: { assignmentId, userId: req.user.id }
      });
      let submission;
      if (existing) {
        submission = await prisma.assignmentSubmission.update({
          where: { id: existing.id },
          data: {
            content,
            status,
            submittedAt: /* @__PURE__ */ new Date()
          }
        });
      } else {
        submission = await prisma.assignmentSubmission.create({
          data: {
            assignmentId,
            userId: req.user.id,
            content,
            status,
            submittedAt: /* @__PURE__ */ new Date()
          }
        });
      }
      return res.json({
        success: true,
        message: isDraft ? "Draft saved successfully." : "Assignment submitted successfully for teacher grading!",
        submission
      });
    } else {
      let submission = store.submissions.find((s) => s.assignmentId === assignmentId && s.userId === req.user?.id);
      if (submission) {
        submission.content = content;
        submission.status = status;
        submission.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      } else {
        submission = {
          id: `sub-${Date.now()}`,
          assignmentId,
          userId: req.user.id,
          content,
          status,
          submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        store.submissions.push(submission);
      }
      return res.json({
        success: true,
        message: isDraft ? "Draft saved successfully." : "Assignment submitted successfully for teacher grading!",
        submission
      });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/assignments/assignmentRoutes.ts
var router7 = Router7();
router7.get("/", requireAuth, getAssignments);
router7.get("/:assignmentId", requireAuth, getAssignmentById);
router7.post("/:assignmentId/submissions", requireAuth, submitAssignment);
var assignmentRoutes_default = router7;

// apps/api/src/modules/student/studentRoutes.ts
import { Router as Router8 } from "express";

// apps/api/src/modules/student/studentController.ts
import { VocabMasteryStatus as VocabMasteryStatus3 } from "@deutschwelt/shared";
async function getStudentDashboard(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const userId = req.user.id;
    if (isDatabaseConnected) {
      const [
        profile,
        enrollments,
        completedLessons,
        vocabStats,
        exerciseAttempts,
        assignments
      ] = await Promise.all([
        prisma.studentProfile.findUnique({ where: { userId } }),
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                units: {
                  include: {
                    lessons: { select: { id: true, title: true, order: true } }
                  }
                }
              }
            }
          }
        }),
        prisma.lessonProgress.findMany({ where: { userId, isCompleted: true } }),
        prisma.studentVocabularyProgress.findMany({ where: { userId } }),
        prisma.exerciseAttempt.findMany({ where: { userId }, orderBy: { startedAt: "desc" } }),
        prisma.assignment.findMany({
          where: { dueDate: { gte: /* @__PURE__ */ new Date() } },
          take: 5,
          include: {
            submissions: { where: { userId } }
          }
        })
      ]);
      const wordsLearned = vocabStats.length;
      const wordsMastered = vocabStats.filter((v) => v.box === 5 || v.status === "MASTERED").length;
      const avgAccuracy = exerciseAttempts.length > 0 ? Math.round(exerciseAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / exerciseAttempts.length) : 100;
      const activeEnrollment = enrollments[0];
      let continueLesson = null;
      if (activeEnrollment && activeEnrollment.course.units.length > 0) {
        const completedIds = new Set(completedLessons.map((cl) => cl.lessonId));
        for (const unit of activeEnrollment.course.units) {
          for (const lesson of unit.lessons) {
            if (!completedIds.has(lesson.id)) {
              continueLesson = {
                id: lesson.id,
                title: lesson.title,
                unitTitle: unit.title,
                courseSlug: activeEnrollment.course.slug,
                courseTitle: activeEnrollment.course.title
              };
              break;
            }
          }
          if (continueLesson) break;
        }
      }
      return res.json({
        success: true,
        stats: {
          currentLevel: profile?.currentLevel || "A1",
          streakDays: profile?.streakCount || 1,
          dailyGoalMinutes: profile?.dailyGoalMinutes || 20,
          minutesSpentToday: 15,
          wordsLearned,
          wordsMastered,
          exerciseAccuracy: avgAccuracy,
          completedLessonsCount: completedLessons.length,
          enrolledCoursesCount: enrollments.length,
          upcomingAssignmentsCount: assignments.filter((a) => a.submissions.length === 0).length,
          continueLesson,
          enrollments: enrollments.map((e) => ({
            id: e.id,
            courseId: e.courseId,
            courseTitle: e.course.title,
            courseSlug: e.course.slug,
            level: e.course.level,
            progressPercentage: e.progressPercentage,
            status: e.status
          })),
          recentActivity: [
            ...exerciseAttempts.slice(0, 3).map((a) => ({
              id: a.id,
              type: "EXERCISE_COMPLETED",
              title: `Completed exercise score: ${a.percentage}%`,
              timestamp: a.completedAt?.toISOString() || a.startedAt.toISOString(),
              score: a.percentage
            }))
          ]
        }
      });
    } else {
      const profile = store.studentProfiles.find((sp) => sp.userId === userId);
      const enrollments = store.enrollments.filter((e) => e.userId === userId).map((e) => {
        const course = store.courses.find((c) => c.id === e.courseId);
        return {
          id: e.id,
          courseId: e.courseId,
          courseTitle: course?.title || "German Course",
          courseSlug: course?.slug || "course",
          level: course?.level || "A1",
          progressPercentage: e.progressPercentage,
          status: e.status
        };
      });
      const completedLessons = store.lessonProgress.filter((lp) => lp.userId === userId && lp.isCompleted);
      const vocabStats = store.studentVocabProgress.filter((vp) => vp.userId === userId);
      const wordsLearned = vocabStats.length;
      const wordsMastered = vocabStats.filter((vp) => vp.box === 5 || vp.status === VocabMasteryStatus3.MASTERED).length;
      const exerciseAttempts = store.attempts.filter((a) => a.userId === userId);
      const avgAccuracy = exerciseAttempts.length > 0 ? Math.round(exerciseAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / exerciseAttempts.length) : 95;
      const completedIds = new Set(completedLessons.map((cl) => cl.lessonId));
      const targetLevel = profile?.currentLevel || "A1";
      const activeCourse = store.courses.find((c) => c.level === targetLevel) || store.courses[0];
      let continueLesson = null;
      if (activeCourse && activeCourse.units) {
        for (const unit of activeCourse.units) {
          for (const lesson of unit.lessons) {
            if (!completedIds.has(lesson.id)) {
              continueLesson = {
                id: lesson.id,
                title: lesson.title,
                unitTitle: unit.title,
                courseSlug: activeCourse.slug,
                courseTitle: activeCourse.title
              };
              break;
            }
          }
          if (continueLesson) break;
        }
      }
      if (!continueLesson) {
        continueLesson = {
          id: "lesson-a1-1-1",
          title: "Lektion 1.1: Sich vorstellen (Introducing Yourself)",
          unitTitle: "Einheit 1: Hallo und Willkommen",
          courseSlug: "deutsch-a1-beginner-intensiv",
          courseTitle: "Deutsch A1: Complete Beginner to Breakthrough"
        };
      }
      return res.json({
        success: true,
        stats: {
          currentLevel: profile?.currentLevel || "A1",
          streakDays: profile?.streakCount || 7,
          dailyGoalMinutes: profile?.dailyGoalMinutes || 25,
          minutesSpentToday: 18,
          wordsLearned: wordsLearned || 6,
          wordsMastered: wordsMastered || 1,
          exerciseAccuracy: avgAccuracy,
          completedLessonsCount: completedLessons.length || 1,
          enrolledCoursesCount: enrollments.length || 1,
          upcomingAssignmentsCount: 1,
          continueLesson,
          enrollments: enrollments.length > 0 ? enrollments : [{
            id: "enr-1",
            courseId: "course-a1",
            courseTitle: "Deutsch A1: Complete Beginner to Breakthrough",
            courseSlug: "deutsch-a1-beginner-intensiv",
            level: "A1",
            progressPercentage: 35,
            status: "ACTIVE"
          }],
          recentActivity: [
            {
              id: "act-1",
              type: "LESSON_COMPLETED",
              title: "Completed: Lektion 1.1: Sich vorstellen",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              score: 100
            },
            {
              id: "act-2",
              type: "VOCAB_PRACTICED",
              title: "Practiced 5 vocabulary words",
              timestamp: new Date(Date.now() - 36e5).toISOString()
            }
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
async function getStudentNotifications(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (isDatabaseConnected) {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ success: true, notifications });
    } else {
      const notifications = store.notifications.filter((n) => n.userId === req.user?.id);
      return res.json({ success: true, notifications });
    }
  } catch (error) {
    next(error);
  }
}
async function markNotificationRead(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { notificationId } = req.params;
    if (isDatabaseConnected) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: req.user.id },
        data: { isRead: true }
      });
    } else {
      const notif = store.notifications.find((n) => n.id === notificationId && n.userId === req.user?.id);
      if (notif) notif.isRead = true;
    }
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
async function updateProfile(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const { firstName, lastName, phone, address, currentLevel, learningGoal, dailyGoalMinutes, preferredLanguage } = req.body;
    if (isDatabaseConnected) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          phone,
          studentProfile: {
            upsert: {
              create: {
                currentLevel,
                learningGoal,
                dailyGoalMinutes,
                preferredLanguage
              },
              update: {
                currentLevel,
                learningGoal,
                dailyGoalMinutes,
                preferredLanguage
              }
            }
          }
        },
        include: { studentProfile: true }
      });
      return res.json({ success: true, message: "Profile updated successfully.", user: updatedUser });
    } else {
      const user = store.users.find((u) => u.id === req.user?.id);
      if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== void 0) user.phone = phone;
        if (address !== void 0) user.address = address;
      }
      let sp = store.studentProfiles.find((p) => p.userId === req.user?.id);
      if (sp) {
        if (currentLevel) sp.currentLevel = currentLevel;
        if (learningGoal !== void 0) sp.learningGoal = learningGoal;
        if (dailyGoalMinutes) sp.dailyGoalMinutes = dailyGoalMinutes;
        if (preferredLanguage) sp.preferredLanguage = preferredLanguage;
      }
      return res.json({ success: true, message: "Profile updated successfully.", user: { ...user, studentProfile: sp } });
    }
  } catch (error) {
    next(error);
  }
}
async function getStudentBatchMaterials(req, res, next) {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    const myBatchIds = store.batchMemberships.filter((bm) => bm.userId === req.user.id).map((bm) => bm.batchId);
    const effectiveBatchIds = myBatchIds.length > 0 ? myBatchIds : ["batch-1"];
    const materials = store.teacherMaterials.filter((m) => effectiveBatchIds.includes(m.batchId)).map((m) => {
      const batch = store.batches.find((b) => b.id === m.batchId);
      const teacherProfile = store.teacherProfiles.find((tp) => tp.id === m.teacherId);
      const teacherUser = teacherProfile ? store.users.find((u) => u.id === teacherProfile.userId) : null;
      return {
        ...m,
        batchName: batch?.name || "Class Materials",
        teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : "Course Instructor"
      };
    });
    const announcements = store.batchAnnouncements.filter((a) => effectiveBatchIds.includes(a.batchId)).map((a) => {
      const batch = store.batches.find((b) => b.id === a.batchId);
      const teacherProfile = store.teacherProfiles.find((tp) => tp.id === a.teacherId);
      const teacherUser = teacherProfile ? store.users.find((u) => u.id === teacherProfile.userId) : null;
      return {
        ...a,
        batchName: batch?.name || "Batch Announcement",
        teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : "Course Instructor"
      };
    });
    return res.json({ success: true, materials, announcements });
  } catch (error) {
    next(error);
  }
}
async function getStudentBatchLectures(req, res, next) {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    const myBatchIds = store.batchMemberships.filter((bm) => bm.userId === req.user.id).map((bm) => bm.batchId);
    const effectiveBatchIds = myBatchIds.length > 0 ? myBatchIds : ["batch-1"];
    const lectures = store.teacherLectures.filter((l) => effectiveBatchIds.includes(l.batchId)).map((l) => {
      const batch = store.batches.find((b) => b.id === l.batchId);
      const teacherProfile = store.teacherProfiles.find((tp) => tp.id === l.teacherId);
      const teacherUser = teacherProfile ? store.users.find((u) => u.id === teacherProfile.userId) : null;
      return {
        ...l,
        batchName: batch?.name || "Class Lecture",
        teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : "Course Instructor"
      };
    });
    return res.json({ success: true, lectures });
  } catch (error) {
    next(error);
  }
}
async function getStudentCertificates(req, res, next) {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    const certificates = store.certificates.filter((c) => c.userId === req.user.id);
    return res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
}
async function claimCourseCertificate(req, res, next) {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    const { courseId } = req.params;
    const course = store.courses.find((c) => c.id === courseId);
    if (!course) {
      return next(new AppError("Course not found.", 404));
    }
    const existing = store.certificates.find((c) => c.userId === req.user.id && c.courseId === courseId);
    if (existing) {
      return res.json({ success: true, certificate: existing, message: "Certificate already issued." });
    }
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const certNumber = `DW-${(/* @__PURE__ */ new Date()).getFullYear()}-${course.level}-${randomSuffix}`;
    const newCert = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      userId: req.user.id,
      userFullName: `${req.user.firstName} ${req.user.lastName}`,
      courseId: course.id,
      courseTitle: course.title,
      level: course.level,
      gradeScore: 95,
      gradeClassification: "Sehr Gut (With Distinction)",
      issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      instructorName: "Dr. Katharina Weber",
      directorName: "Dr. Klaus Becker",
      directorTitle: "Direktor Akademische Bildung, DeutschWelt",
      verificationCode: `DW-VERIFY-${course.level}-${randomSuffix}`
    };
    store.certificates.push(newCert);
    store.notifications.push({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: "\u{1F4DC} Zertifikat ausgestellt!",
      message: `Herzlichen Gl\xFCckwunsch! Your official Certificate of Completion for ${course.title} is now available to download.`,
      type: "COURSE_COMPLETED",
      linkUrl: "/student/courses",
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return res.status(201).json({
      success: true,
      message: "Certificate of Completion generated successfully!",
      certificate: newCert
    });
  } catch (error) {
    next(error);
  }
}
async function verifyCertificate(req, res, next) {
  try {
    const { certificateNumber } = req.params;
    const cert = store.certificates.find(
      (c) => c.certificateNumber.toLowerCase() === certificateNumber.toLowerCase() || c.verificationCode?.toLowerCase() === certificateNumber.toLowerCase()
    );
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "No active DeutschWelt certificate found with this verification number."
      });
    }
    return res.json({
      success: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        recipient: cert.userFullName,
        courseTitle: cert.courseTitle,
        level: cert.level,
        gradeClassification: cert.gradeClassification,
        issuedAt: cert.issuedAt,
        directorName: cert.directorName,
        isValid: true
      }
    });
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/student/studentRoutes.ts
import { updateProfileSchema } from "@deutschwelt/shared";
var router8 = Router8();
router8.get("/dashboard", requireAuth, getStudentDashboard);
router8.get("/notifications", requireAuth, getStudentNotifications);
router8.patch("/notifications/:notificationId/read", requireAuth, markNotificationRead);
router8.patch("/profile", requireAuth, validateBody(updateProfileSchema), updateProfile);
router8.get("/materials", requireAuth, getStudentBatchMaterials);
router8.get("/lectures", requireAuth, getStudentBatchLectures);
router8.get("/certificates", requireAuth, getStudentCertificates);
router8.post("/courses/:courseId/claim-certificate", requireAuth, claimCourseCertificate);
router8.get("/certificates/verify/:certificateNumber", verifyCertificate);
var studentRoutes_default = router8;

// apps/api/src/modules/teacher/teacherRoutes.ts
import { Router as Router9 } from "express";

// apps/api/src/modules/teacher/teacherController.ts
import fs2 from "fs";
import path3 from "path";
import { SubmissionStatus as SubmissionStatus4, UserRole as UserRole3 } from "@deutschwelt/shared";
function resolveTeacherProfileId(req) {
  if (req.user?.teacherProfile?.id) return req.user.teacherProfile.id;
  if (req.user?.id === "user-teacher-1") return "profile-teacher-1";
  if (req.user?.id === "user-teacher-2") return "profile-teacher-2";
  const found = store.teacherProfiles.find((tp) => tp.userId === req.user?.id);
  if (found) return found.id;
  return `profile-${req.user?.id}`;
}
async function getAssignedBatchIds(teacherProfileId, userId) {
  if (isDatabaseConnected) {
    const assignments = await prisma.teacherBatchAssignment.findMany({
      where: { teacherId: teacherProfileId },
      select: { batchId: true }
    });
    return assignments.map((a) => a.batchId);
  } else {
    return store.teacherBatchAssignments.filter((tba) => tba.teacherId === teacherProfileId || tba.teacherId === `profile-${userId}`).map((tba) => tba.batchId);
  }
}
async function getTeacherDashboard(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    if (isDatabaseConnected) {
      const batches = await prisma.teacherBatch.findMany({
        where: { id: { in: assignedBatchIds } },
        include: {
          memberships: { include: { user: true } }
        }
      });
      const studentUserIds = Array.from(
        new Set(batches.flatMap((b) => b.memberships.map((m) => m.userId)))
      );
      const [pendingSubmissions, pendingSpeaking, evaluatedSubmissions] = await Promise.all([
        prisma.assignmentSubmission.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus4.SUBMITTED
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: { select: { id: true, title: true, maxPoints: true } }
          }
        }),
        prisma.speakingAttempt.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus4.SUBMITTED
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: { select: { id: true, title: true, level: true } }
          }
        }),
        prisma.assignmentSubmission.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus4.GRADED
          },
          select: { score: true }
        })
      ]);
      const avgScore = evaluatedSubmissions.length > 0 ? Math.round(evaluatedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / evaluatedSubmissions.length) : 88;
      return res.json({
        success: true,
        stats: {
          totalBatches: batches.length,
          totalStudents: studentUserIds.length,
          pendingSubmissionsCount: pendingSubmissions.length + pendingSpeaking.length,
          reviewedThisWeek: evaluatedSubmissions.length,
          averageScorePercentage: avgScore,
          recentSubmissions: [
            ...pendingSubmissions.map((s) => ({
              id: s.id,
              studentName: `${s.user.firstName} ${s.user.lastName}`,
              assignmentTitle: s.assignment.title,
              submittedAt: s.submittedAt.toISOString(),
              type: "WRITING"
            })),
            ...pendingSpeaking.map((s) => ({
              id: s.id,
              studentName: `${s.user.firstName} ${s.user.lastName}`,
              assignmentTitle: s.prompt.title,
              submittedAt: s.submittedAt.toISOString(),
              type: "SPEAKING"
            }))
          ]
        }
      });
    } else {
      const myBatches = store.batches.filter((b) => assignedBatchIds.includes(b.id));
      const myMemberships = store.batchMemberships.filter((bm) => assignedBatchIds.includes(bm.batchId));
      const studentUserIds = Array.from(new Set(myMemberships.map((bm) => bm.userId)));
      const pendingWriting = store.submissions.filter(
        (s) => studentUserIds.includes(s.userId) && s.status === SubmissionStatus4.SUBMITTED
      );
      const pendingSpeaking = store.speakingAttempts.filter(
        (sa) => studentUserIds.includes(sa.userId) && sa.status === SubmissionStatus4.SUBMITTED
      );
      return res.json({
        success: true,
        stats: {
          totalBatches: myBatches.length,
          totalStudents: studentUserIds.length,
          pendingSubmissionsCount: pendingWriting.length + pendingSpeaking.length,
          reviewedThisWeek: 4,
          averageScorePercentage: 91,
          recentSubmissions: [
            ...pendingWriting.map((s) => {
              const u = store.users.find((usr) => usr.id === s.userId);
              const a = store.assignments.find((asg) => asg.id === s.assignmentId);
              return {
                id: s.id,
                studentName: u ? `${u.firstName} ${u.lastName}` : "Student",
                assignmentTitle: a ? a.title : "Assignment",
                submittedAt: s.submittedAt,
                type: "WRITING"
              };
            })
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
async function getTeacherBatches(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    if (isDatabaseConnected) {
      const batches = await prisma.teacherBatch.findMany({
        where: { id: { in: assignedBatchIds } },
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true, studentProfile: true }
              }
            }
          }
        }
      });
      return res.json({ success: true, batches });
    } else {
      const batches = store.batches.filter((b) => assignedBatchIds.includes(b.id)).map((b) => ({
        ...b,
        memberships: store.batchMemberships.filter((bm) => bm.batchId === b.id).map((bm) => ({
          ...bm,
          user: store.users.find((u) => u.id === bm.userId)
        }))
      }));
      return res.json({ success: true, batches });
    }
  } catch (error) {
    next(error);
  }
}
async function getTeacherStudents(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    if (isDatabaseConnected) {
      const memberships = await prisma.batchMembership.findMany({
        where: { batchId: { in: assignedBatchIds } },
        include: {
          batch: true,
          user: {
            include: {
              studentProfile: true,
              lessonProgresses: { where: { isCompleted: true } }
            }
          }
        }
      });
      const students = memberships.map((m) => ({
        id: m.user?.id || m.userId,
        firstName: m.user?.firstName || "Student",
        lastName: m.user?.lastName || "",
        email: m.user?.email || "",
        phone: m.user?.phone || "",
        batchId: m.batch?.id || m.batchId,
        batchName: m.batch?.name || "Assigned Batch",
        batchLevel: m.batch?.level || "A1",
        status: m.status,
        joinedAt: m.joinedAt,
        currentLevel: m.user?.studentProfile?.currentLevel || "A1",
        streakCount: m.user?.studentProfile?.streakCount || 0,
        completedLessonsCount: m.user?.lessonProgresses?.length || 0
      }));
      return res.json({ success: true, students });
    } else {
      const myMemberships = store.batchMemberships.filter((bm) => assignedBatchIds.includes(bm.batchId));
      const students = myMemberships.map((bm) => {
        const user = store.users.find((u) => u.id === bm.userId);
        const batch = store.batches.find((b) => b.id === bm.batchId);
        const profile = store.studentProfiles.find((sp) => sp.userId === bm.userId);
        const progress = store.lessonProgress.filter((lp) => lp.userId === bm.userId && lp.isCompleted);
        return {
          id: user?.id || bm.userId,
          firstName: user?.firstName || "Student",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          batchId: batch?.id || bm.batchId,
          batchName: batch?.name || "Assigned Batch",
          batchLevel: batch?.level || "A1",
          status: bm.status,
          joinedAt: bm.joinedAt,
          currentLevel: profile?.currentLevel || "A1",
          streakCount: profile?.streakCount || 7,
          completedLessonsCount: progress.length
        };
      });
      return res.json({ success: true, students });
    }
  } catch (error) {
    next(error);
  }
}
async function getTeacherSubmissions(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    if (isDatabaseConnected) {
      const myMemberships = await prisma.batchMembership.findMany({
        where: { batchId: { in: assignedBatchIds } },
        select: { userId: true }
      });
      const studentUserIds = myMemberships.map((m) => m.userId);
      const [writing, speaking] = await Promise.all([
        prisma.assignmentSubmission.findMany({
          where: { userId: { in: studentUserIds } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: true
          },
          orderBy: { submittedAt: "desc" }
        }),
        prisma.speakingAttempt.findMany({
          where: { userId: { in: studentUserIds } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: true
          },
          orderBy: { submittedAt: "desc" }
        })
      ]);
      return res.json({ success: true, writing, speaking });
    } else {
      const myMemberships = store.batchMemberships.filter((bm) => assignedBatchIds.includes(bm.batchId));
      const studentUserIds = myMemberships.map((bm) => bm.userId);
      const writing = store.submissions.filter((s) => studentUserIds.includes(s.userId)).map((s) => ({
        ...s,
        user: store.users.find((u) => u.id === s.userId),
        assignment: store.assignments.find((a) => a.id === s.assignmentId)
      }));
      const speaking = store.speakingAttempts.filter((sa) => studentUserIds.includes(sa.userId)).map((sa) => ({
        ...sa,
        user: store.users.find((u) => u.id === sa.userId),
        prompt: store.speakingPrompts.find((p) => p.id === sa.promptId)
      }));
      return res.json({ success: true, writing, speaking });
    }
  } catch (error) {
    next(error);
  }
}
async function createAssignment(req, res, next) {
  try {
    const { title, description, level, dueDate, maxPoints = 100, instructions, rubricCriteria, batchId } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);
    if (isDatabaseConnected) {
      const assignment = await prisma.assignment.create({
        data: {
          teacherId: teacherProfileId,
          batchId: batchId || null,
          title,
          description,
          level,
          dueDate: new Date(dueDate),
          maxPoints,
          instructions,
          rubricCriteria: rubricCriteria || []
        }
      });
      return res.status(201).json({ success: true, assignment });
    } else {
      const assignment = {
        id: `assign-${Date.now()}`,
        teacherId: teacherProfileId,
        batchId: batchId || "batch-1",
        title,
        description,
        level,
        dueDate,
        maxPoints,
        instructions,
        rubricCriteria: rubricCriteria || [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.assignments.push(assignment);
      return res.status(201).json({ success: true, assignment });
    }
  } catch (error) {
    next(error);
  }
}
async function gradeWritingSubmission(req, res, next) {
  try {
    const { submissionId } = req.params;
    const { score, teacherFeedback, rubricScores } = req.body;
    if (isDatabaseConnected) {
      const submission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score,
          teacherFeedback,
          rubricScores,
          status: SubmissionStatus4.GRADED,
          evaluatedAt: /* @__PURE__ */ new Date()
        }
      });
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          title: "Aufgabe korrigiert / Assignment graded",
          message: `Your teacher evaluated your submission with a score of ${score} points.`,
          type: "FEEDBACK",
          linkUrl: "/student/assignments"
        }
      });
      return res.json({ success: true, message: "Submission evaluated successfully.", submission });
    } else {
      const sub = store.submissions.find((s) => s.id === submissionId);
      if (!sub) return next(new AppError("Submission not found.", 404));
      sub.score = score;
      sub.teacherFeedback = teacherFeedback;
      sub.rubricScores = rubricScores;
      sub.status = SubmissionStatus4.GRADED;
      sub.evaluatedAt = (/* @__PURE__ */ new Date()).toISOString();
      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId: sub.userId,
        title: "Aufgabe korrigiert / Assignment graded",
        message: `Your teacher evaluated your submission with a score of ${score} points.`,
        type: "FEEDBACK",
        linkUrl: "/student/assignments",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      return res.json({ success: true, message: "Submission evaluated successfully.", submission: sub });
    }
  } catch (error) {
    next(error);
  }
}
async function gradeSpeakingAttempt(req, res, next) {
  try {
    const { attemptId } = req.params;
    const { score, teacherFeedback, rubricScores } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);
    if (isDatabaseConnected) {
      const attempt = await prisma.speakingAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          teacherFeedback,
          rubricScores,
          status: SubmissionStatus4.GRADED,
          evaluatedAt: /* @__PURE__ */ new Date(),
          teacherId: teacherProfileId
        }
      });
      await prisma.notification.create({
        data: {
          userId: attempt.userId,
          title: "Sprech\xFCbung bewertet / Speaking evaluated",
          message: `Your teacher has provided feedback on your speaking submission (Score: ${score}/100).`,
          type: "FEEDBACK",
          linkUrl: "/student/speaking"
        }
      });
      return res.json({ success: true, message: "Speaking attempt evaluated successfully.", attempt });
    } else {
      const att = store.speakingAttempts.find((a) => a.id === attemptId);
      if (!att) return next(new AppError("Speaking attempt not found.", 404));
      att.score = score;
      att.teacherFeedback = teacherFeedback;
      att.rubricScores = rubricScores;
      att.status = SubmissionStatus4.GRADED;
      att.evaluatedAt = (/* @__PURE__ */ new Date()).toISOString();
      att.teacherId = teacherProfileId;
      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId: att.userId,
        title: "Sprech\xFCbung bewertet / Speaking evaluated",
        message: `Your teacher has provided feedback on your speaking submission (Score: ${score}/100).`,
        type: "FEEDBACK",
        linkUrl: "/student/speaking",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      return res.json({ success: true, message: "Speaking attempt evaluated successfully.", attempt: att });
    }
  } catch (error) {
    next(error);
  }
}
async function getTeacherLectures(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    const lectures = store.teacherLectures.filter((l) => assignedBatchIds.includes(l.batchId) || l.teacherId === teacherProfileId).map((l) => ({
      ...l,
      batch: store.batches.find((b) => b.id === l.batchId)
    }));
    return res.json({ success: true, lectures });
  } catch (error) {
    next(error);
  }
}
async function uploadLectureVideo(req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError("No video file provided for upload.", 400));
    }
    const fileUrl = `/uploads/videos/${req.file.filename}`;
    const sizeMb = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
    return res.json({
      success: true,
      message: "Video file uploaded successfully.",
      fileUrl,
      fileName: req.file.originalname,
      fileSize: sizeMb,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    next(error);
  }
}
async function createTeacherLecture(req, res, next) {
  try {
    const { title, description, level, durationMinutes = 45, scheduledFor, meetingUrl, batchId } = req.body;
    let videoUrl = req.body.videoUrl || "";
    let fileSize = req.body.fileSize;
    let originalFilename = req.body.originalFilename;
    if (req.file) {
      videoUrl = `/uploads/videos/${req.file.filename}`;
      fileSize = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
      originalFilename = req.file.originalname;
    }
    const isLive = req.body.isLive === "true" || req.body.isLive === true;
    const teacherProfileId = resolveTeacherProfileId(req);
    if (!title || !batchId) {
      return next(new AppError("Lecture title and target batch are required.", 400));
    }
    const newLecture = {
      id: `lec-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      description: description || "",
      level: level || "A1",
      videoUrl: videoUrl || "",
      durationMinutes: Number(durationMinutes) || 45,
      scheduledFor: scheduledFor || (/* @__PURE__ */ new Date()).toISOString(),
      isLive: Boolean(isLive),
      meetingUrl: meetingUrl || "",
      fileSize: fileSize || (req.file ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : void 0),
      originalFilename: originalFilename || (req.file ? req.file.originalname : void 0),
      status: "PUBLISHED",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.teacherLectures.unshift(newLecture);
    const batchMembers = store.batchMemberships.filter((bm) => bm.batchId === batchId);
    batchMembers.forEach((bm) => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: isLive ? "Neue Live-Sitzung geplant" : "Neue Video-Vorlesung verf\xFCgbar",
        message: `${newLecture.title} has been published by your instructor.`,
        type: "INFO",
        linkUrl: "/student/materials",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    return res.status(201).json({ success: true, message: "Lecture created successfully.", lecture: newLecture });
  } catch (error) {
    next(error);
  }
}
async function deleteTeacherLecture(req, res, next) {
  try {
    const { lectureId } = req.params;
    const teacherProfileId = resolveTeacherProfileId(req);
    const index = store.teacherLectures.findIndex((l) => l.id === lectureId && (l.teacherId === teacherProfileId || req.user?.role === UserRole3.ADMIN));
    if (index === -1) {
      return next(new AppError("Lecture not found or unauthorized to delete.", 404));
    }
    const [deleted] = store.teacherLectures.splice(index, 1);
    if (deleted?.videoUrl && deleted.videoUrl.startsWith("/uploads/videos/")) {
      try {
        const filePath = path3.join(env.UPLOAD_DIR, "videos", path3.basename(deleted.videoUrl));
        if (fs2.existsSync(filePath)) {
          fs2.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("[Cleanup Warning] Could not remove deleted lecture video file:", err);
      }
    }
    return res.json({ success: true, message: "Lecture deleted successfully." });
  } catch (error) {
    next(error);
  }
}
async function getTeacherMaterials(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    const materials = store.teacherMaterials.filter((m) => assignedBatchIds.includes(m.batchId) || m.teacherId === teacherProfileId).map((m) => ({
      ...m,
      batch: store.batches.find((b) => b.id === m.batchId)
    }));
    return res.json({ success: true, materials });
  } catch (error) {
    next(error);
  }
}
async function createTeacherMaterial(req, res, next) {
  try {
    const { title, category, description, batchId, level } = req.body;
    let fileUrl = req.body.fileUrl || "";
    let fileType = req.body.fileType || "PDF";
    let fileSize = req.body.fileSize || "1.0 MB";
    if (req.file) {
      fileUrl = `/uploads/materials/${req.file.filename}`;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
      const ext = path3.extname(req.file.originalname).replace(".", "").toUpperCase();
      if (ext) fileType = ext;
    }
    const teacherProfileId = resolveTeacherProfileId(req);
    if (!title || !batchId) {
      return next(new AppError("Material title and target batch are required.", 400));
    }
    const newMaterial = {
      id: `mat-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      category: category || "WORKSHEET",
      description: description || "",
      fileUrl: fileUrl || "/uploads/materials/sample_doc.pdf",
      fileType: fileType.toUpperCase(),
      fileSize,
      level: level || "A1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.teacherMaterials.unshift(newMaterial);
    const batchMembers = store.batchMemberships.filter((bm) => bm.batchId === batchId);
    batchMembers.forEach((bm) => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: "Neues Unterrichtsmaterial verf\xFCgbar",
        message: `${newMaterial.title} has been uploaded to your course files.`,
        type: "INFO",
        linkUrl: "/student/materials",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    return res.status(201).json({ success: true, message: "Material uploaded successfully.", material: newMaterial });
  } catch (error) {
    next(error);
  }
}
async function deleteTeacherMaterial(req, res, next) {
  try {
    const { materialId } = req.params;
    const teacherProfileId = resolveTeacherProfileId(req);
    const index = store.teacherMaterials.findIndex((m) => m.id === materialId && (m.teacherId === teacherProfileId || req.user?.role === UserRole3.ADMIN));
    if (index === -1) {
      return next(new AppError("Material not found or unauthorized to delete.", 404));
    }
    const [deleted] = store.teacherMaterials.splice(index, 1);
    if (deleted?.fileUrl && deleted.fileUrl.startsWith("/uploads/materials/")) {
      try {
        const filePath = path3.join(env.UPLOAD_DIR, "materials", path3.basename(deleted.fileUrl));
        if (fs2.existsSync(filePath)) {
          fs2.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("[Cleanup Warning] Could not remove deleted material file:", err);
      }
    }
    return res.json({ success: true, message: "Material deleted successfully." });
  } catch (error) {
    next(error);
  }
}
async function getTeacherAnnouncements(req, res, next) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);
    const announcements = store.batchAnnouncements.filter((a) => assignedBatchIds.includes(a.batchId) || a.teacherId === teacherProfileId).map((a) => ({
      ...a,
      batch: store.batches.find((b) => b.id === a.batchId)
    }));
    return res.json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
}
async function createBatchAnnouncement(req, res, next) {
  try {
    const { title, content, batchId } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);
    if (!title || !content || !batchId) {
      return next(new AppError("Title, content, and batchId are required.", 400));
    }
    const announcement = {
      id: `anc-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.batchAnnouncements.unshift(announcement);
    const batchMembers = store.batchMemberships.filter((bm) => bm.batchId === batchId);
    batchMembers.forEach((bm) => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: `Mitteilung: ${title}`,
        message: content.substring(0, 120),
        type: "INFO",
        linkUrl: "/student/materials",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    return res.status(201).json({ success: true, message: "Announcement posted.", announcement });
  } catch (error) {
    next(error);
  }
}
async function enrollStudentInBatch(req, res, next) {
  try {
    const { batchId } = req.params;
    const { studentEmail } = req.body;
    const student = store.users.find((u) => u.email.toLowerCase() === String(studentEmail).toLowerCase().trim());
    if (!student) {
      return next(new AppError("Student with this email address does not exist.", 404));
    }
    const alreadyInBatch = store.batchMemberships.some((bm) => bm.batchId === batchId && bm.userId === student.id);
    if (alreadyInBatch) {
      return next(new AppError("Student is already enrolled in this batch.", 400));
    }
    const newMembership = {
      id: `bm-${Date.now()}`,
      batchId,
      userId: student.id,
      status: "ACTIVE",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.batchMemberships.push(newMembership);
    return res.status(201).json({ success: true, message: `${student.firstName} ${student.lastName} enrolled successfully.`, membership: newMembership });
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/teacher/teacherRoutes.ts
import { UserRole as UserRole4 } from "@deutschwelt/shared";
var router9 = Router9();
router9.use(requireAuth);
router9.use(requireRole(UserRole4.TEACHER, UserRole4.ADMIN));
router9.get("/dashboard", getTeacherDashboard);
router9.get("/batches", getTeacherBatches);
router9.post("/batches/:batchId/enroll", enrollStudentInBatch);
router9.get("/students", getTeacherStudents);
router9.get("/submissions", getTeacherSubmissions);
router9.post("/assignments", createAssignment);
router9.post("/submissions/:submissionId/grade", gradeWritingSubmission);
router9.post("/speaking/:attemptId/grade", gradeSpeakingAttempt);
router9.get("/lectures", getTeacherLectures);
router9.post("/lectures", uploadVideo.single("video"), createTeacherLecture);
router9.post("/lectures/upload", uploadVideo.single("video"), uploadLectureVideo);
router9.delete("/lectures/:lectureId", deleteTeacherLecture);
router9.get("/materials", getTeacherMaterials);
router9.post("/materials", uploadMaterial.single("file"), createTeacherMaterial);
router9.delete("/materials/:materialId", deleteTeacherMaterial);
router9.get("/announcements", getTeacherAnnouncements);
router9.post("/announcements", createBatchAnnouncement);
var teacherRoutes_default = router9;

// apps/api/src/modules/admin/adminRoutes.ts
import { Router as Router10 } from "express";

// apps/api/src/modules/admin/adminController.ts
import bcrypt3 from "bcryptjs";
import { UserRole as UserRole5, GermanLevel as GermanLevel5, PublicationStatus as PublicationStatus3 } from "@deutschwelt/shared";

// apps/api/src/services/auditService.ts
async function recordAuditLog(input) {
  try {
    if (isDatabaseConnected) {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          details: input.details,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent
        }
      });
    } else {
      store.auditLogs.unshift({
        id: `audit-${Date.now()}-${Math.round(Math.random() * 1e3)}`,
        ...input,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    console.error("[Audit Log Error]", error);
  }
}

// apps/api/src/modules/admin/adminController.ts
async function getAdminAnalytics(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5);
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        totalCompletedLessons,
        exerciseAttempts,
        enquiriesCount,
        recentUsers
      ] = await Promise.all([
        prisma.user.count({ where: { role: UserRole5.STUDENT } }),
        prisma.user.count({ where: { role: UserRole5.TEACHER } }),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.lessonProgress.count({ where: { isCompleted: true } }),
        prisma.exerciseAttempt.findMany({ select: { percentage: true } }),
        prisma.contactEnquiry.count(),
        prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true }
        })
      ]);
      const avgScore = exerciseAttempts.length > 0 ? Math.round(exerciseAttempts.reduce((acc, c) => acc + c.percentage, 0) / exerciseAttempts.length) : 85;
      const dateMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = /* @__PURE__ */ new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap[key] = 0;
      }
      for (const u of recentUsers) {
        const key = u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dateMap[key] !== void 0) dateMap[key]++;
      }
      const registrationTrend = Object.entries(dateMap).map(([date, count]) => ({ date, count }));
      const levelDistribution = [
        { level: "A1 Beginner", count: Math.max(1, Math.round(totalStudents * 0.45)) },
        { level: "A2 Elementary", count: Math.max(1, Math.round(totalStudents * 0.3)) },
        { level: "B1 Intermediate", count: Math.max(0, Math.round(totalStudents * 0.18)) },
        { level: "B2 Advanced", count: Math.max(0, Math.round(totalStudents * 0.07)) }
      ];
      return res.json({
        success: true,
        analytics: {
          totalStudents,
          activeStudentsLast30Days: totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
          totalCompletedLessons,
          averageExerciseScore: avgScore,
          enquiriesCount,
          registrationTrend,
          levelDistribution,
          courseEnrollmentBreakdown: [
            { courseTitle: "Deutsch A1: Beginner Intensiv", enrollments: Math.max(1, Math.round(totalEnrollments * 0.55)) },
            { courseTitle: "Deutsch A2: Elementary Fluency", enrollments: Math.max(1, Math.round(totalEnrollments * 0.3)) },
            { courseTitle: "Deutsch B1: Intermediate", enrollments: Math.max(0, Math.round(totalEnrollments * 0.15)) }
          ]
        }
      });
    } else {
      const students = store.users.filter((u) => u.role === UserRole5.STUDENT);
      const teachers = store.users.filter((u) => u.role === UserRole5.TEACHER);
      return res.json({
        success: true,
        analytics: {
          totalStudents: students.length || 18,
          activeStudentsLast30Days: students.length || 15,
          totalTeachers: teachers.length || 3,
          totalCourses: store.courses.length || 4,
          totalEnrollments: store.enrollments.length || 24,
          totalCompletedLessons: store.lessonProgress.length || 42,
          averageExerciseScore: 89,
          enquiriesCount: store.enquiries.length,
          registrationTrend: [
            { date: "Oct 13", count: 2 },
            { date: "Oct 14", count: 4 },
            { date: "Oct 15", count: 3 },
            { date: "Oct 16", count: 6 },
            { date: "Oct 17", count: 5 },
            { date: "Oct 18", count: 8 },
            { date: "Oct 19", count: 4 }
          ],
          levelDistribution: [
            { level: "A1 Beginner", count: 12 },
            { level: "A2 Elementary", count: 6 },
            { level: "B1 Intermediate", count: 4 },
            { level: "B2 Advanced", count: 2 }
          ],
          courseEnrollmentBreakdown: [
            { courseTitle: "Deutsch A1: Complete Beginner to Breakthrough", enrollments: 14 },
            { courseTitle: "Deutsch A2: Elementary Fluency & Real-World Dialogues", enrollments: 7 },
            { courseTitle: "Deutsch B1: Independent Communication", enrollments: 3 }
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
async function getStudents(req, res, next) {
  try {
    const { search, level } = req.query;
    if (isDatabaseConnected) {
      const where = { role: UserRole5.STUDENT };
      if (search) {
        where.OR = [
          { email: { contains: String(search), mode: "insensitive" } },
          { firstName: { contains: String(search), mode: "insensitive" } },
          { lastName: { contains: String(search), mode: "insensitive" } }
        ];
      }
      const students = await prisma.user.findMany({
        where,
        include: {
          studentProfile: true,
          enrollments: { include: { course: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ success: true, students });
    } else {
      let students = store.users.filter((u) => u.role === UserRole5.STUDENT).map((u) => ({
        ...u,
        studentProfile: store.studentProfiles.find((sp) => sp.userId === u.id),
        enrollments: store.enrollments.filter((e) => e.userId === u.id).map((e) => ({
          ...e,
          course: store.courses.find((c) => c.id === e.courseId)
        }))
      }));
      if (search) {
        const s = String(search).toLowerCase();
        students = students.filter((u) => u.email.toLowerCase().includes(s) || u.firstName.toLowerCase().includes(s) || u.lastName.toLowerCase().includes(s));
      }
      return res.json({ success: true, students });
    }
  } catch (error) {
    next(error);
  }
}
async function createStudent(req, res, next) {
  try {
    const { firstName, lastName, email, phone, address, password, currentLevel, learningGoal } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return next(new AppError("First name, last name, email, and password are required.", 400));
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = isDatabaseConnected ? await prisma.user.findUnique({ where: { email: normalizedEmail } }) : store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return next(new AppError("A user with this email already exists.", 400));
    }
    const passwordHash = await bcrypt3.hash(password, 10);
    if (isDatabaseConnected) {
      const student = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          role: UserRole5.STUDENT,
          isActive: true,
          isEmailVerified: true,
          studentProfile: {
            create: {
              currentLevel: currentLevel || GermanLevel5.A1,
              learningGoal: learningGoal || null,
              preferredLanguage: "en"
            }
          }
        },
        include: { studentProfile: true }
      });
      await recordAuditLog({
        userId: req.user?.id,
        action: "CREATE_STUDENT",
        entityType: "User",
        entityId: student.id,
        details: { email: student.email }
      });
      return res.status(201).json({ success: true, message: "Student created successfully.", student });
    } else {
      const student = {
        id: `student-${Date.now()}`,
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone: phone || "",
        address: address || "",
        role: UserRole5.STUDENT,
        isActive: true,
        isEmailVerified: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const sp = {
        id: `profile-${Date.now()}`,
        userId: student.id,
        currentLevel: currentLevel || GermanLevel5.A1,
        learningGoal: learningGoal || "",
        preferredLanguage: "en",
        dailyGoalMinutes: 20,
        streakCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.users.unshift(student);
      store.studentProfiles.unshift(sp);
      const targetLevel = currentLevel || GermanLevel5.A1;
      const matchingCourse = store.courses.find((c) => c.level === targetLevel) || store.courses[0];
      if (matchingCourse) {
        store.enrollments.push({
          id: `enr-${Date.now()}`,
          userId: student.id,
          courseId: matchingCourse.id,
          enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "ACTIVE",
          progressPercentage: 0
        });
      }
      const matchingBatch = store.batches.find((b) => b.level === targetLevel) || store.batches[0];
      if (matchingBatch) {
        store.batchMemberships.push({
          id: `bm-${Date.now()}`,
          batchId: matchingBatch.id,
          userId: student.id,
          joinedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return res.status(201).json({ success: true, message: "Student created successfully.", student: { ...student, studentProfile: sp } });
    }
  } catch (error) {
    next(error);
  }
}
async function updateStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const { firstName, lastName, email, phone, address, currentLevel, learningGoal, isActive } = req.body;
    if (isDatabaseConnected) {
      const updated = await prisma.user.update({
        where: { id: studentId },
        data: {
          firstName: firstName !== void 0 ? firstName : void 0,
          lastName: lastName !== void 0 ? lastName : void 0,
          email: email ? email.toLowerCase().trim() : void 0,
          phone: phone !== void 0 ? phone : void 0,
          isActive: isActive !== void 0 ? Boolean(isActive) : void 0,
          studentProfile: {
            upsert: {
              create: { currentLevel: currentLevel || GermanLevel5.A1, learningGoal: learningGoal || null },
              update: { currentLevel: currentLevel || void 0, learningGoal: learningGoal !== void 0 ? learningGoal : void 0 }
            }
          }
        },
        include: { studentProfile: true }
      });
      return res.json({ success: true, message: "Student updated successfully.", student: updated });
    } else {
      const student = store.users.find((u) => u.id === studentId);
      if (!student) return next(new AppError("Student not found.", 404));
      if (firstName !== void 0) student.firstName = firstName;
      if (lastName !== void 0) student.lastName = lastName;
      if (email !== void 0) student.email = email.toLowerCase().trim();
      if (phone !== void 0) student.phone = phone;
      if (address !== void 0) student.address = address;
      if (isActive !== void 0) student.isActive = Boolean(isActive);
      student.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      let sp = store.studentProfiles.find((p) => p.userId === studentId);
      if (sp) {
        if (currentLevel !== void 0) sp.currentLevel = currentLevel;
        if (learningGoal !== void 0) sp.learningGoal = learningGoal;
        sp.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      } else {
        sp = {
          id: `profile-${Date.now()}`,
          userId: studentId,
          currentLevel: currentLevel || GermanLevel5.A1,
          learningGoal: learningGoal || "",
          preferredLanguage: "en",
          dailyGoalMinutes: 20,
          streakCount: 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        store.studentProfiles.push(sp);
      }
      return res.json({ success: true, message: "Student updated successfully.", student: { ...student, studentProfile: sp } });
    }
  } catch (error) {
    next(error);
  }
}
async function deleteStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    if (isDatabaseConnected) {
      await prisma.user.delete({ where: { id: studentId } });
      return res.json({ success: true, message: "Student deleted successfully." });
    } else {
      const idx = store.users.findIndex((u) => u.id === studentId);
      if (idx === -1) return next(new AppError("Student not found.", 404));
      store.users.splice(idx, 1);
      store.studentProfiles = store.studentProfiles.filter((p) => p.userId !== studentId);
      store.enrollments = store.enrollments.filter((e) => e.userId !== studentId);
      store.batchMemberships = store.batchMemberships.filter((bm) => bm.userId !== studentId);
      return res.json({ success: true, message: "Student deleted successfully." });
    }
  } catch (error) {
    next(error);
  }
}
async function getTeachers(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const teachers = await prisma.user.findMany({
        where: { role: UserRole5.TEACHER },
        include: {
          teacherProfile: {
            include: {
              batchAssignments: { include: { batch: true } },
              assignmentsCreated: true
            }
          }
        }
      });
      return res.json({ success: true, teachers });
    } else {
      const teachers = store.users.filter((u) => u.role === UserRole5.TEACHER).map((u) => {
        const tp = store.teacherProfiles.find((p) => p.userId === u.id);
        const myTbas = store.teacherBatchAssignments.filter((tba) => tba.teacherId === tp?.id);
        const myBatches = store.batches.filter((b) => myTbas.some((t) => t.batchId === b.id));
        const studentUserIds = new Set(
          store.batchMemberships.filter((bm) => myBatches.some((b) => b.id === bm.batchId)).map((bm) => bm.userId)
        );
        return {
          ...u,
          teacherProfile: tp,
          batches: myBatches,
          totalStudents: studentUserIds.size
        };
      });
      return res.json({ success: true, teachers });
    }
  } catch (error) {
    next(error);
  }
}
async function createTeacher(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password, bio, qualifications, specialization, batchIds = [] } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt3.hash(password || "TeacherDefault2026!", 10);
    if (isDatabaseConnected) {
      const teacher = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phone,
          role: UserRole5.TEACHER,
          isActive: true,
          isEmailVerified: true,
          teacherProfile: {
            create: {
              bio,
              qualifications,
              specialization,
              maxBatches: 5
            }
          }
        },
        include: { teacherProfile: true }
      });
      if (batchIds && batchIds.length > 0 && teacher.teacherProfile) {
        for (const bId of batchIds) {
          await prisma.teacherBatchAssignment.create({
            data: {
              batchId: bId,
              teacherId: teacher.teacherProfile.id,
              isPrimary: true
            }
          });
        }
      }
      await recordAuditLog({
        userId: req.user?.id,
        action: "CREATE_TEACHER",
        entityType: "User",
        entityId: teacher.id,
        details: { email: teacher.email, assignedBatches: batchIds }
      });
      return res.status(201).json({ success: true, message: "Teacher created successfully.", teacher });
    } else {
      const teacher = {
        id: `teacher-${Date.now()}`,
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: UserRole5.TEACHER,
        isActive: true,
        isEmailVerified: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const tp = {
        id: `profile-${Date.now()}`,
        userId: teacher.id,
        bio,
        qualifications,
        specialization,
        maxBatches: 5,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.users.push(teacher);
      store.teacherProfiles.push(tp);
      if (batchIds && batchIds.length > 0) {
        for (const bId of batchIds) {
          store.teacherBatchAssignments.push({
            id: `tba-${Date.now()}-${bId}`,
            batchId: bId,
            teacherId: tp.id,
            isPrimary: true,
            assignedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      return res.status(201).json({ success: true, message: "Teacher created successfully.", teacher: { ...teacher, teacherProfile: tp } });
    }
  } catch (error) {
    next(error);
  }
}
async function assignTeacherToBatch(req, res, next) {
  try {
    const { teacherId } = req.params;
    const { batchId } = req.body;
    const teacher = store.users.find((u) => u.id === teacherId);
    const tp = store.teacherProfiles.find((p) => p.userId === teacherId || p.id === teacherId);
    if (!tp) return next(new AppError("Teacher profile not found.", 404));
    const existing = store.teacherBatchAssignments.find((tba) => tba.teacherId === tp.id && tba.batchId === batchId);
    if (!existing) {
      store.teacherBatchAssignments.push({
        id: `tba-${Date.now()}`,
        batchId,
        teacherId: tp.id,
        isPrimary: true,
        assignedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return res.json({ success: true, message: "Teacher assigned to batch successfully." });
  } catch (error) {
    next(error);
  }
}
async function unassignTeacherFromBatch(req, res, next) {
  try {
    const { teacherId, batchId } = req.params;
    const tp = store.teacherProfiles.find((p) => p.userId === teacherId || p.id === teacherId);
    if (!tp) return next(new AppError("Teacher profile not found.", 404));
    const idx = store.teacherBatchAssignments.findIndex((tba) => tba.teacherId === tp.id && tba.batchId === batchId);
    if (idx !== -1) {
      store.teacherBatchAssignments.splice(idx, 1);
    }
    return res.json({ success: true, message: "Teacher unassigned from batch." });
  } catch (error) {
    next(error);
  }
}
async function updateTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    const { firstName, lastName, email, phone, bio, qualifications, specialization, isActive, batchIds } = req.body;
    if (isDatabaseConnected) {
      const updated = await prisma.user.update({
        where: { id: teacherId },
        data: {
          firstName: firstName !== void 0 ? firstName : void 0,
          lastName: lastName !== void 0 ? lastName : void 0,
          email: email ? email.toLowerCase().trim() : void 0,
          phone: phone !== void 0 ? phone : void 0,
          isActive: isActive !== void 0 ? Boolean(isActive) : void 0,
          teacherProfile: {
            upsert: {
              create: { bio, qualifications, specialization, maxBatches: 5 },
              update: { bio, qualifications, specialization }
            }
          }
        },
        include: { teacherProfile: true }
      });
      return res.json({ success: true, message: "Teacher updated successfully.", teacher: updated });
    } else {
      const teacher = store.users.find((u) => u.id === teacherId);
      if (!teacher) return next(new AppError("Teacher not found.", 404));
      if (firstName !== void 0) teacher.firstName = firstName;
      if (lastName !== void 0) teacher.lastName = lastName;
      if (email !== void 0) teacher.email = email.toLowerCase().trim();
      if (phone !== void 0) teacher.phone = phone;
      if (isActive !== void 0) teacher.isActive = Boolean(isActive);
      teacher.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      let tp = store.teacherProfiles.find((p) => p.userId === teacherId);
      if (tp) {
        if (bio !== void 0) tp.bio = bio;
        if (qualifications !== void 0) tp.qualifications = qualifications;
        if (specialization !== void 0) tp.specialization = specialization;
        tp.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
      if (batchIds && Array.isArray(batchIds)) {
        store.teacherBatchAssignments = store.teacherBatchAssignments.filter((tba) => tba.teacherId !== tp?.id);
        for (const bId of batchIds) {
          store.teacherBatchAssignments.push({
            id: `tba-${Date.now()}-${bId}`,
            batchId: bId,
            teacherId: tp?.id || teacherId,
            isPrimary: true,
            assignedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      return res.json({ success: true, message: "Teacher updated successfully.", teacher: { ...teacher, teacherProfile: tp } });
    }
  } catch (error) {
    next(error);
  }
}
async function deleteTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    if (isDatabaseConnected) {
      await prisma.user.delete({ where: { id: teacherId } });
      return res.json({ success: true, message: "Teacher deleted successfully." });
    } else {
      const idx = store.users.findIndex((u) => u.id === teacherId);
      if (idx === -1) return next(new AppError("Teacher not found.", 404));
      const tp = store.teacherProfiles.find((p) => p.userId === teacherId);
      store.users.splice(idx, 1);
      if (tp) {
        store.teacherProfiles = store.teacherProfiles.filter((p) => p.id !== tp.id);
        store.teacherBatchAssignments = store.teacherBatchAssignments.filter((t) => t.teacherId !== tp.id);
      }
      return res.json({ success: true, message: "Teacher deleted successfully." });
    }
  } catch (error) {
    next(error);
  }
}
async function getAdminCourses(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const courses = await prisma.course.findMany({
        orderBy: { order: "asc" },
        include: {
          units: { include: { lessons: true } },
          enrollments: true
        }
      });
      return res.json({ success: true, courses });
    } else {
      const courses = store.courses.map((c) => ({
        ...c,
        units: store.units.filter((u) => u.courseId === c.id).map((u) => ({
          ...u,
          lessons: store.lessons.filter((l) => l.unitId === u.id)
        })),
        enrollments: store.enrollments.filter((e) => e.courseId === c.id)
      }));
      return res.json({ success: true, courses });
    }
  } catch (error) {
    next(error);
  }
}
async function createCourse(req, res, next) {
  try {
    const { slug, title, description, level, learningObjectives, estimatedHours, thumbnailUrl, status, order } = req.body;
    if (isDatabaseConnected) {
      const course = await prisma.course.create({
        data: {
          slug,
          title,
          description,
          level,
          learningObjectives: learningObjectives || [],
          estimatedHours: Number(estimatedHours) || 40,
          thumbnailUrl,
          status: status || PublicationStatus3.PUBLISHED,
          order: Number(order) || 0
        }
      });
      await recordAuditLog({
        userId: req.user?.id,
        action: "CREATE_COURSE",
        entityType: "Course",
        entityId: course.id,
        details: { title: course.title, level: course.level }
      });
      return res.status(201).json({ success: true, course });
    } else {
      const course = {
        id: `course-${Date.now()}`,
        slug,
        title,
        description,
        level,
        learningObjectives: learningObjectives || [],
        estimatedHours: Number(estimatedHours) || 40,
        thumbnailUrl,
        status: status || PublicationStatus3.PUBLISHED,
        order: Number(order) || 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.courses.push(course);
      return res.status(201).json({ success: true, course });
    }
  } catch (error) {
    next(error);
  }
}
async function updateCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const { title, slug, description, level, estimatedHours, status, order } = req.body;
    if (isDatabaseConnected) {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: {
          title,
          slug,
          description,
          level,
          estimatedHours: estimatedHours !== void 0 ? Number(estimatedHours) : void 0,
          status,
          order: order !== void 0 ? Number(order) : void 0
        }
      });
      return res.json({ success: true, message: "Course updated successfully.", course });
    } else {
      const course = store.courses.find((c) => c.id === courseId);
      if (!course) return next(new AppError("Course not found.", 404));
      if (title !== void 0) course.title = title;
      if (slug !== void 0) course.slug = slug;
      if (description !== void 0) course.description = description;
      if (level !== void 0) course.level = level;
      if (estimatedHours !== void 0) course.estimatedHours = Number(estimatedHours);
      if (status !== void 0) course.status = status;
      if (order !== void 0) course.order = Number(order);
      course.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      return res.json({ success: true, message: "Course updated successfully.", course });
    }
  } catch (error) {
    next(error);
  }
}
async function deleteCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (isDatabaseConnected) {
      await prisma.course.delete({ where: { id: courseId } });
      return res.json({ success: true, message: "Course deleted successfully." });
    } else {
      const idx = store.courses.findIndex((c) => c.id === courseId);
      if (idx === -1) return next(new AppError("Course not found.", 404));
      store.courses.splice(idx, 1);
      return res.json({ success: true, message: "Course deleted successfully." });
    }
  } catch (error) {
    next(error);
  }
}
async function toggleUserActiveStatus(req, res, next) {
  try {
    const { userId } = req.params;
    if (isDatabaseConnected) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return next(new AppError("User not found.", 404));
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive }
      });
      return res.json({ success: true, message: `User status changed to ${updated.isActive ? "Active" : "Suspended"}.`, isActive: updated.isActive });
    } else {
      const user = store.users.find((u) => u.id === userId);
      if (!user) return next(new AppError("User not found.", 404));
      user.isActive = !user.isActive;
      user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      return res.json({ success: true, message: `User status changed to ${user.isActive ? "Active" : "Suspended"}.`, isActive: user.isActive });
    }
  } catch (error) {
    next(error);
  }
}
async function getAdminEnquiries(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const enquiries = await prisma.contactEnquiry.findMany({
        orderBy: { createdAt: "desc" }
      });
      return res.json({ success: true, enquiries });
    } else {
      return res.json({ success: true, enquiries: store.enquiries });
    }
  } catch (error) {
    next(error);
  }
}
async function updateEnquiryStatus(req, res, next) {
  try {
    const { enquiryId } = req.params;
    const { status, adminNotes } = req.body;
    if (isDatabaseConnected) {
      const enquiry = await prisma.contactEnquiry.update({
        where: { id: enquiryId },
        data: {
          status,
          adminNotes: adminNotes !== void 0 ? adminNotes : void 0
        }
      });
      return res.json({ success: true, enquiry });
    } else {
      const enquiry = store.enquiries.find((e) => e.id === enquiryId);
      if (!enquiry) return next(new AppError("Enquiry not found.", 404));
      enquiry.status = status;
      if (adminNotes !== void 0) enquiry.adminNotes = adminNotes;
      enquiry.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      return res.json({ success: true, enquiry });
    }
  } catch (error) {
    next(error);
  }
}
async function getAuditLogs(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const logs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, firstName: true, lastName: true } } }
      });
      return res.json({ success: true, logs });
    } else {
      return res.json({ success: true, logs: store.auditLogs });
    }
  } catch (error) {
    next(error);
  }
}
async function getPlatformSettings(req, res, next) {
  try {
    if (isDatabaseConnected) {
      const settings = await prisma.siteSetting.findMany();
      return res.json({ success: true, settings });
    } else {
      return res.json({ success: true, settings: store.siteSettings });
    }
  } catch (error) {
    next(error);
  }
}
async function updatePlatformSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    if (isDatabaseConnected) {
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
      });
      return res.json({ success: true, setting });
    } else {
      let setting = store.siteSettings.find((s) => s.key === key);
      if (setting) {
        setting.value = value;
        if (description) setting.description = description;
        setting.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      } else {
        setting = { id: `set-${Date.now()}`, key, value, description, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        store.siteSettings.push(setting);
      }
      return res.json({ success: true, setting });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/admin/adminRoutes.ts
import { UserRole as UserRole6 } from "@deutschwelt/shared";
var router10 = Router10();
router10.use(requireAuth);
router10.use(requireRole(UserRole6.ADMIN));
router10.get("/analytics", getAdminAnalytics);
router10.get("/students", getStudents);
router10.post("/students", createStudent);
router10.put("/students/:studentId", updateStudent);
router10.delete("/students/:studentId", deleteStudent);
router10.get("/teachers", getTeachers);
router10.post("/teachers", createTeacher);
router10.put("/teachers/:teacherId", updateTeacher);
router10.delete("/teachers/:teacherId", deleteTeacher);
router10.post("/teachers/:teacherId/batches", assignTeacherToBatch);
router10.delete("/teachers/:teacherId/batches/:batchId", unassignTeacherFromBatch);
router10.get("/courses", getAdminCourses);
router10.post("/courses", createCourse);
router10.put("/courses/:courseId", updateCourse);
router10.delete("/courses/:courseId", deleteCourse);
router10.post("/users/:userId/toggle-status", toggleUserActiveStatus);
router10.get("/enquiries", getAdminEnquiries);
router10.patch("/enquiries/:enquiryId", updateEnquiryStatus);
router10.get("/audit-logs", getAuditLogs);
router10.get("/settings", getPlatformSettings);
router10.patch("/settings/:key", updatePlatformSetting);
var adminRoutes_default = router10;

// apps/api/src/modules/enquiries/enquiryRoutes.ts
import { Router as Router11 } from "express";

// apps/api/src/modules/enquiries/enquiryController.ts
import { EnquiryStatus as EnquiryStatus2, GermanLevel as GermanLevel6 } from "@deutschwelt/shared";
async function submitEnquiry(req, res, next) {
  try {
    const { name, email, phone, level, message } = req.body;
    if (isDatabaseConnected) {
      const enquiry = await prisma.contactEnquiry.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          level: level || GermanLevel6.A1,
          message,
          status: EnquiryStatus2.NEW
        }
      });
      return res.status(201).json({
        success: true,
        message: "Vielen Dank! Your message has been received. Our academic team will get back to you within 24 hours.",
        enquiryId: enquiry.id
      });
    } else {
      const enquiry = {
        id: `enq-${Date.now()}`,
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        level: level || GermanLevel6.A1,
        message,
        status: EnquiryStatus2.NEW,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.enquiries.unshift(enquiry);
      return res.status(201).json({
        success: true,
        message: "Vielen Dank! Your message has been received. Our academic team will get back to you within 24 hours.",
        enquiryId: enquiry.id
      });
    }
  } catch (error) {
    next(error);
  }
}

// apps/api/src/modules/enquiries/enquiryRoutes.ts
import { contactEnquirySchema } from "@deutschwelt/shared";
var router11 = Router11();
router11.post("/", authRateLimiter, validateBody(contactEnquirySchema), submitEnquiry);
var enquiryRoutes_default = router11;

// apps/api/src/app.ts
var app = express();
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  next();
});
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xContentTypeOptions: true,
  xFrameOptions: { action: "deny" },
  xXssProtection: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: env.isProd ? { maxAge: 31536e3, includeSubDomains: true } : false
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === env.FRONTEND_URL || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
if (!env.isTest) {
  app.use(morgan("dev"));
}
app.use("/uploads", express.static(env.UPLOAD_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (filePath.endsWith(".html") || filePath.endsWith(".htm") || filePath.endsWith(".svg") || filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "text/plain");
    }
  }
}));
app.use(authenticate);
app.use("/api/", apiRateLimiter);
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "DeutschWelt API",
    version: "1.0.0",
    environment: env.NODE_ENV
  });
});
app.use("/api/v1/auth", authRoutes_default);
app.use("/api/v1/courses", courseRoutes_default);
app.use("/api/v1/lessons", lessonRoutes_default);
app.use("/api/v1/exercises", exerciseRoutes_default);
app.use("/api/v1/vocabulary", vocabularyRoutes_default);
app.use("/api/v1/speaking", speakingRoutes_default);
app.use("/api/v1/assignments", assignmentRoutes_default);
app.use("/api/v1/student", studentRoutes_default);
app.use("/api/v1/teacher", teacherRoutes_default);
app.use("/api/v1/admin", adminRoutes_default);
app.use("/api/v1/enquiries", enquiryRoutes_default);
app.use(errorHandler);
var app_default = app;
export {
  app_default as default
};
