import { PrismaClient, UserRole, GermanLevel, PublicationStatus, GermanArticle, PartOfSpeech, ExerciseType, LessonContentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting DeutschWelt Database Seed ---');

  // 1. Password Hashes
  const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'AdminDeutschWelt2026!', 10);
  const teacherPasswordHash = await bcrypt.hash(process.env.SEED_TEACHER_PASSWORD || 'TeacherDeutschWelt2026!', 10);
  const studentPasswordHash = await bcrypt.hash(process.env.SEED_STUDENT_PASSWORD || 'StudentDeutschWelt2026!', 10);

  // 2. Seed Users
  console.log('Seeding core users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deutschwelt.de' },
    update: {},
    create: {
      email: 'admin@deutschwelt.de',
      passwordHash: adminPasswordHash,
      firstName: 'Maximilian',
      lastName: 'Schmidt',
      phone: '+49 151 12345678',
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@deutschwelt.de' },
    update: {},
    create: {
      email: 'teacher@deutschwelt.de',
      passwordHash: teacherPasswordHash,
      firstName: 'Dr. Katharina',
      lastName: 'Weber',
      phone: '+49 151 87654321',
      role: UserRole.TEACHER,
      isActive: true,
      isEmailVerified: true,
      teacherProfile: {
        create: {
          bio: 'Goethe-Institut certified German instructor with 12+ years of experience guiding international students from A1 to TestDaF.',
          qualifications: 'MA in Germanistik (LMU Munich), DaF/DaZ Certification',
          specialization: 'Goethe-Zertifikat Exam Preparation, Phonetics, and Business German',
          maxBatches: 5
        }
      }
    },
    include: { teacherProfile: true }
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@deutschwelt.de' },
    update: {},
    create: {
      email: 'student@deutschwelt.de',
      passwordHash: studentPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '+91 9876543210',
      role: UserRole.STUDENT,
      isActive: true,
      isEmailVerified: true,
      studentProfile: {
        create: {
          currentLevel: GermanLevel.A1,
          learningGoal: 'Prepare for Goethe-Zertifikat A1 for master studies in Germany',
          preferredLanguage: 'en',
          dailyGoalMinutes: 25,
          streakCount: 5,
          lastActiveDate: new Date()
        }
      }
    },
    include: { studentProfile: true }
  });

  // 3. Seed Site Settings
  console.log('Seeding site settings...');
  await prisma.siteSetting.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: {
      key: 'platform_name',
      value: 'DeutschWelt',
      description: 'Public brand name of the academy'
    }
  });
  await prisma.siteSetting.upsert({
    where: { key: 'tagline' },
    update: {},
    create: {
      key: 'tagline',
      value: 'Your journey to German fluency.',
      description: 'Official platform motto'
    }
  });
  await prisma.siteSetting.upsert({
    where: { key: 'contact_email' },
    update: {},
    create: {
      key: 'contact_email',
      value: 'admissions@deutschwelt.de',
      description: 'Inquiries reception mailbox'
    }
  });

  // 4. Seed Vocabulary Categories & Words
  console.log('Seeding vocabulary bank...');
  const catAlltag = await prisma.vocabularyCategory.upsert({
    where: { slug: 'alltag-und-begruessung' },
    update: {},
    create: {
      name: 'Alltag & Begrüßung (Everyday & Greetings)',
      slug: 'alltag-und-begruessung',
      description: 'Essential daily vocabulary, greetings, and introductions',
      order: 1
    }
  });

  const catEssen = await prisma.vocabularyCategory.upsert({
    where: { slug: 'essen-und-trinken' },
    update: {},
    create: {
      name: 'Essen & Trinken (Food & Dining)',
      slug: 'essen-und-trinken',
      description: 'Food items, supermarket vocabulary, and restaurant expressions',
      order: 2
    }
  });

  const catWohnen = await prisma.vocabularyCategory.upsert({
    where: { slug: 'wohnen-und-stadt' },
    update: {},
    create: {
      name: 'Wohnen & Stadt (Living & City)',
      slug: 'wohnen-und-stadt',
      description: 'Apartments, rooms, furniture, and navigating the city',
      order: 3
    }
  });

  const vocabWords = [
    {
      german: 'Guten Tag',
      english: 'Good day / Hello',
      hindi: 'नमस्ते / शुभ दिन',
      article: GermanArticle.NONE,
      partOfSpeech: PartOfSpeech.PHRASE,
      level: GermanLevel.A1,
      category: 'Alltag & Begrüßung',
      categoryId: catAlltag.id,
      exampleSentenceDe: 'Guten Tag, wie geht es Ihnen?',
      exampleSentenceEn: 'Good day, how are you (formal)?',
      exampleSentenceHi: 'नमस्ते, आप कैसे हैं?',
      ipa: '/ˌɡuːtn̩ ˈtaːk/',
      tags: ['greeting', 'polite', 'A1-basics'],
      difficulty: 1
    },
    {
      german: 'Apfel',
      english: 'Apple',
      hindi: 'सेब',
      article: GermanArticle.DER,
      plural: 'die Äpfel',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.A1,
      category: 'Essen & Trinken',
      categoryId: catEssen.id,
      exampleSentenceDe: 'Der Apfel schmeckt frisch und süß.',
      exampleSentenceEn: 'The apple tastes fresh and sweet.',
      exampleSentenceHi: 'सेब ताज़ा और मीठा लगता है।',
      ipa: '/ˈʔapfl̩/',
      tags: ['food', 'fruit', 'noun-masculine'],
      difficulty: 1
    },
    {
      german: 'Kaffee',
      english: 'Coffee',
      hindi: 'कॉफ़ी',
      article: GermanArticle.DER,
      plural: 'die Kaffees',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.A1,
      category: 'Essen & Trinken',
      categoryId: catEssen.id,
      exampleSentenceDe: 'Ich trinke morgens gerne einen heißen Kaffee.',
      exampleSentenceEn: 'I like to drink a hot coffee in the morning.',
      exampleSentenceHi: 'मुझे सुबह गर्म कॉफ़ी पीना पसंद है।',
      ipa: '/ˈkafe/',
      tags: ['beverage', 'breakfast', 'noun-masculine'],
      difficulty: 1
    },
    {
      german: 'Wohnung',
      english: 'Apartment / Flat',
      hindi: 'अपार्टमेंट / मकान',
      article: GermanArticle.DIE,
      plural: 'die Wohnungen',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.A1,
      category: 'Wohnen & Stadt',
      categoryId: catWohnen.id,
      exampleSentenceDe: 'Meine Wohnung hat drei helle Zimmer.',
      exampleSentenceEn: 'My apartment has three bright rooms.',
      exampleSentenceHi: 'मेरे अपार्टमेंट में तीन चमकदार कमरे हैं।',
      ipa: '/ˈvoːnʊŋ/',
      tags: ['housing', 'city', 'noun-feminine'],
      difficulty: 2
    },
    {
      german: 'Buch',
      english: 'Book',
      hindi: 'किताब',
      article: GermanArticle.DAS,
      plural: 'die Bücher',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.A1,
      category: 'Alltag & Begrüßung',
      categoryId: catAlltag.id,
      exampleSentenceDe: 'Das Buch liegt auf dem Schreibtisch.',
      exampleSentenceEn: 'The book is lying on the desk.',
      exampleSentenceHi: 'किताब मेज पर रखी है।',
      ipa: '/buːx/',
      tags: ['education', 'reading', 'noun-neuter'],
      difficulty: 1
    },
    {
      german: 'Bahnhof',
      english: 'Train station',
      hindi: 'रेलवे स्टेशन',
      article: GermanArticle.DER,
      plural: 'die Bahnhöfe',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.A2,
      category: 'Wohnen & Stadt',
      categoryId: catWohnen.id,
      exampleSentenceDe: 'Wir treffen uns um 18 Uhr am Hauptbahnhof.',
      exampleSentenceEn: 'We meet at 6 PM at the central train station.',
      exampleSentenceHi: 'हम शाम 6 बजे मुख्य रेलवे स्टेशन पर मिलते हैं।',
      ipa: '/ˈbaːnhoːf/',
      tags: ['travel', 'transport', 'noun-masculine'],
      difficulty: 2
    },
    {
      german: 'entscheiden',
      english: 'to decide',
      hindi: 'फैसला करना / निर्णय लेना',
      article: GermanArticle.NONE,
      partOfSpeech: PartOfSpeech.VERB,
      level: GermanLevel.B1,
      category: 'Alltag & Begrüßung',
      categoryId: catAlltag.id,
      exampleSentenceDe: 'Ich habe mich für das Studium in Deutschland entschieden.',
      exampleSentenceEn: 'I decided to study in Germany.',
      exampleSentenceHi: 'मैंने जर्मनी में पढ़ाई करने का निर्णय लिया है।',
      ipa: '/ʔɛntˈʃaɪ̯dn̩/',
      tags: ['verb', 'reflexive', 'B1-intermediate'],
      difficulty: 3
    },
    {
      german: 'Voraussetzung',
      english: 'Prerequisite / Requirement',
      hindi: 'पूर्वशर्त / आवश्यकता',
      article: GermanArticle.DIE,
      plural: 'die Voraussetzungen',
      partOfSpeech: PartOfSpeech.NOUN,
      level: GermanLevel.B2,
      category: 'Alltag & Begrüßung',
      categoryId: catAlltag.id,
      exampleSentenceDe: 'Fließende Deutschkenntnisse sind eine wichtige Voraussetzung.',
      exampleSentenceEn: 'Fluent German knowledge is an important prerequisite.',
      exampleSentenceHi: 'जर्मन भाषा का धाराप्रवाह ज्ञान एक महत्वपूर्ण आवश्यकता है।',
      ipa: '/foːɐ̯ˈʔaʊ̯szɛtsʊŋ/',
      tags: ['academic', 'professional', 'noun-feminine', 'B2-advanced'],
      difficulty: 4
    }
  ];

  for (const w of vocabWords) {
    const wordRecord = await prisma.vocabularyWord.upsert({
      where: { id: `seed-vocab-${w.german.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
      update: {},
      create: {
        id: `seed-vocab-${w.german.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        ...w
      }
    });

    // Create student vocabulary progress
    await prisma.studentVocabularyProgress.upsert({
      where: {
        userId_wordId: {
          userId: studentUser.id,
          wordId: wordRecord.id
        }
      },
      update: {},
      create: {
        userId: studentUser.id,
        wordId: wordRecord.id,
        box: 1,
        timesReviewed: 1,
        timesCorrect: 1,
        status: 'LEARNING',
        nextReviewAt: new Date(Date.now() + 86400000)
      }
    });
  }

  // 5. Seed Courses across A1, A2, B1, B2
  console.log('Seeding courses...');
  const courseA1 = await prisma.course.upsert({
    where: { slug: 'deutsch-a1-beginner-intensiv' },
    update: {},
    create: {
      slug: 'deutsch-a1-beginner-intensiv',
      title: 'Deutsch A1: Complete Beginner to Breakthrough',
      description: 'Comprehensive foundation for learning German from scratch. Master pronunciation, basic greetings, shopping, ordering food, and the German case system (Nominativ & Akkusativ).',
      level: GermanLevel.A1,
      learningObjectives: [
        'Master the German alphabet, umlauts (ä, ö, ü), and phonetics',
        'Introduce yourself and hold simple daily conversations',
        'Understand noun genders (der, die, das) and plural forms',
        'Use Nominative and Accusative cases accurately',
        'Prepare thoroughly for the Goethe-Zertifikat A1: Start Deutsch 1 exam'
      ],
      estimatedHours: 60,
      thumbnailUrl: '/images/courses/course-a1.jpg',
      status: PublicationStatus.PUBLISHED,
      order: 1
    }
  });

  const courseA2 = await prisma.course.upsert({
    where: { slug: 'deutsch-a2-elementary-dialoge' },
    update: {},
    create: {
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
      order: 2
    }
  });

  const courseB1 = await prisma.course.upsert({
    where: { slug: 'deutsch-b1-intermediate-mastery' },
    update: {},
    create: {
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
      order: 3
    }
  });

  const courseB2 = await prisma.course.upsert({
    where: { slug: 'deutsch-b2-professional-fluency' },
    update: {},
    create: {
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
      order: 4
    }
  });

  // Course Prerequisites
  await prisma.coursePrerequisite.upsert({
    where: {
      courseId_prerequisiteCourseId: {
        courseId: courseA2.id,
        prerequisiteCourseId: courseA1.id
      }
    },
    update: {},
    create: {
      courseId: courseA2.id,
      prerequisiteCourseId: courseA1.id
    }
  });

  // Enroll student in A1
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: studentUser.id,
        courseId: courseA1.id
      }
    },
    update: {},
    create: {
      userId: studentUser.id,
      courseId: courseA1.id,
      status: 'ACTIVE',
      progressPercentage: 25.0
    }
  });

  // 6. Units and Lessons for A1 Course
  console.log('Seeding units and lessons for A1...');
  const unit1 = await prisma.courseUnit.upsert({
    where: { id: 'seed-unit-a1-1' },
    update: {},
    create: {
      id: 'seed-unit-a1-1',
      courseId: courseA1.id,
      title: 'Einheit 1: Hallo und Willkommen (Greetings & First Steps)',
      description: 'Learn German phonetics, greetings, how to introduce yourself, and say where you are from.',
      order: 1
    }
  });

  const unit2 = await prisma.courseUnit.upsert({
    where: { id: 'seed-unit-a1-2' },
    update: {},
    create: {
      id: 'seed-unit-a1-2',
      courseId: courseA1.id,
      title: 'Einheit 2: Der, Die, Das — Die deutschen Artikel',
      description: 'Master the three German grammatical genders and the concept of noun capitalization.',
      order: 2
    }
  });

  // Lesson 1 in Unit 1
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'seed-lesson-a1-1-1' },
    update: {},
    create: {
      id: 'seed-lesson-a1-1-1',
      unitId: unit1.id,
      title: 'Lektion 1.1: Sich vorstellen (Introducing Yourself)',
      description: 'Essential phrases: "Ich heiße...", "Ich komme aus...", "Wie geht es dir?"',
      durationMinutes: 15,
      order: 1,
      status: PublicationStatus.PUBLISHED
    }
  });

  // Content blocks for Lesson 1
  await prisma.lessonContentBlock.upsert({
    where: { id: 'seed-block-1-1' },
    update: {},
    create: {
      id: 'seed-block-1-1',
      lessonId: lesson1.id,
      type: LessonContentType.TEXT,
      title: 'Die Grundlagen der Begrüßung (Greeting Essentials)',
      content: `### Herzlich willkommen bei DeutschWelt!
In this first lesson, you will learn how to greet someone politely in German and introduce yourself with confidence.

#### 1. Wichtige Begrüßungen (Important Greetings)
* **Guten Morgen** — Good morning (used until ~11:00 AM)
* **Guten Tag** — Good day / Hello (standard polite greeting throughout the day)
* **Guten Abend** — Good evening (from ~6:00 PM onwards)
* **Hallo** — Hello / Hi (informal, used with friends and peers)
* **Auf Wiedersehen** — Goodbye (formal, spoken in person)
* **Tschüss** — Bye (informal)

#### 2. Sich vorstellen (Introducing Yourself)
To introduce yourself, you use the verb **heißen** (to be called) or **sein** (to be):
* *Ich heiße Anna.* (My name is Anna.)
* *Ich bin Studentin.* (I am a student.)
* *Ich komme aus Indien.* (I come from India.)
* *Ich wohne in Berlin.* (I live in Berlin.)`,
      order: 1
    }
  });

  await prisma.lessonContentBlock.upsert({
    where: { id: 'seed-block-1-2' },
    update: {},
    create: {
      id: 'seed-block-1-2',
      lessonId: lesson1.id,
      type: LessonContentType.GRAMMAR,
      title: 'Grammatik: Das Verb "sein" und "kommen"',
      content: `### Verb Conjugation in Present Tense (Präsens)
In German, verbs change their endings depending on the subject pronoun:

| Pronoun | kommen (to come) | sein (to be) |
| :--- | :--- | :--- |
| **ich** (I) | komme | bin |
| **du** (you, informal) | kommst | bist |
| **er / sie / es** (he/she/it) | kommt | ist |
| **wir** (we) | kommen | sind |
| **ihr** (you all) | kommt | seid |
| **Sie / sie** (You formal / they) | kommen | sind |

> **Key Rule**: German always capitalizes the formal "Sie" (You), whereas informal "sie" (she/they) is lowercase!`,
      order: 2
    }
  });

  // Exercise for Lesson 1
  const exercise1 = await prisma.exercise.upsert({
    where: { id: 'seed-exercise-a1-1' },
    update: {},
    create: {
      id: 'seed-exercise-a1-1',
      lessonId: lesson1.id,
      title: 'Übung 1: Begrüßungen & Personalpronomen',
      description: 'Test your understanding of greetings and verb conjugation.',
      level: GermanLevel.A1,
      type: ExerciseType.MULTIPLE_CHOICE,
      passingScore: 70.0,
      order: 1,
      status: PublicationStatus.PUBLISHED
    }
  });

  // Question 1
  const q1 = await prisma.exerciseQuestion.upsert({
    where: { id: 'seed-q1' },
    update: {},
    create: {
      id: 'seed-q1',
      exerciseId: exercise1.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      prompt: 'How do you say "Good day, my name is Lukas" in German?',
      instructions: 'Select the single best translation.',
      explanation: '"Guten Tag, ich heiße Lukas." is the correct polite greeting and verb form.',
      points: 10,
      order: 1,
      correctAnswer: 'Guten Tag, ich heiße Lukas.',
      options: {
        create: [
          { label: 'Guten Tag, ich heiße Lukas.', isCorrect: true, order: 1 },
          { label: 'Gute Nacht, du heißt Lukas.', isCorrect: false, order: 2 },
          { label: 'Auf Wiedersehen, ich bin Lukas.', isCorrect: false, order: 3 },
          { label: 'Tschüss, er heißt Lukas.', isCorrect: false, order: 4 }
        ]
      }
    }
  });

  // Question 2: Fill in the blank
  await prisma.exerciseQuestion.upsert({
    where: { id: 'seed-q2' },
    update: {},
    create: {
      id: 'seed-q2',
      exerciseId: exercise1.id,
      type: ExerciseType.FILL_IN_BLANK,
      prompt: 'Complete the sentence with the correct form of the verb "kommen":\n"Woher ______ du?"',
      instructions: 'Type the conjugated verb in the blank.',
      hint: 'The pronoun is "du" (2nd person singular).',
      explanation: 'For "du", the ending is -st: "Woher kommst du?"',
      points: 10,
      order: 2,
      correctAnswer: 'kommst'
    }
  });

  // Question 3: True / False
  await prisma.exerciseQuestion.upsert({
    where: { id: 'seed-q3' },
    update: {},
    create: {
      id: 'seed-q3',
      exerciseId: exercise1.id,
      type: ExerciseType.TRUE_FALSE,
      prompt: 'In German, all nouns are always written with a capital first letter.',
      instructions: 'Choose True or False.',
      explanation: 'True! In German orthography, every noun (e.g., der Tisch, das Haus, die Frau) must be capitalized.',
      points: 10,
      order: 3,
      correctAnswer: 'true',
      options: {
        create: [
          { label: 'True (Richtig)', isCorrect: true, order: 1 },
          { label: 'False (Falsch)', isCorrect: false, order: 2 }
        ]
      }
    }
  });

  // 7. Speaking Prompts
  console.log('Seeding speaking prompts...');
  await prisma.speakingPrompt.upsert({
    where: { id: 'seed-speaking-a1-1' },
    update: {},
    create: {
      id: 'seed-speaking-a1-1',
      title: 'Sich vorstellen (A1 Self-Introduction)',
      topic: 'Personal Information & Introductions',
      level: GermanLevel.A1,
      scenario: 'You are attending your first German class at DeutschWelt. Introduce yourself to the teacher and fellow students.',
      instructions: 'Record an audio message of 30 to 60 seconds. Mention: 1) Your name, 2) Where you are from, 3) Where you currently live, 4) Which languages you speak, and 5) Why you are learning German.',
      sampleAnswerDe: 'Guten Tag! Mein Name ist Elena. Ich komme aus Indien und wohne jetzt in Frankfurt. Ich spreche Englisch und lerne jetzt Deutsch, weil ich an einer deutschen Universität studieren möchte. Freut mich, Sie kennenzulernen!',
      sampleAnswerEn: 'Good day! My name is Elena. I come from India and now live in Frankfurt. I speak English and am now learning German because I want to study at a German university. Pleased to meet you!',
      minDurationSeconds: 15,
      maxDurationSeconds: 90,
      status: PublicationStatus.PUBLISHED
    }
  });

  await prisma.speakingPrompt.upsert({
    where: { id: 'seed-speaking-a2-1' },
    update: {},
    create: {
      id: 'seed-speaking-a2-1',
      title: 'Mein gestriger Tag (A2 Past Events with Perfekt)',
      topic: 'Daily Routine & Past Tense',
      level: GermanLevel.A2,
      scenario: 'Your German friend asks you how your yesterday went. Describe your day in detail using the Perfekt tense.',
      instructions: 'Speak for 45 to 90 seconds. Use verbs with both "haben" and "sein" (e.g., aufstehen, frühstücken, zur Arbeit fahren, Freunde treffen).',
      sampleAnswerDe: 'Gestern bin ich um 7 Uhr aufgestanden. Ich habe gemütlich Kaffee getrunken und die Nachrichten gelesen. Danach bin ich mit der U-Bahn ins Büro gefahren...',
      sampleAnswerEn: 'Yesterday I got up at 7 AM. I casually drank coffee and read the news. After that, I took the subway to the office...',
      minDurationSeconds: 30,
      maxDurationSeconds: 120,
      status: PublicationStatus.PUBLISHED
    }
  });

  // 8. Assignments & Submissions
  console.log('Seeding assignments...');
  if (teacherUser.teacherProfile) {
    const assignment1 = await prisma.assignment.upsert({
      where: { id: 'seed-assignment-1' },
      update: {},
      create: {
        id: 'seed-assignment-1',
        teacherId: teacherUser.teacherProfile.id,
        courseId: courseA1.id,
        title: 'Schreibaufgabe: Eine kurze E-Mail an das Hotel',
        description: 'Write a short formal inquiry email to book a room at a hotel in Munich for a weekend trip.',
        level: GermanLevel.A1,
        dueDate: new Date(Date.now() + 7 * 86400000),
        maxPoints: 100,
        instructions: `Write an email containing ~40-60 words. You must include:
1. Formal greeting (Sehr geehrte Damen und Herren / Sehr geehrte(r) Frau/Herr...)
2. Reason for writing: booking a double room for 2 nights
3. Mention dates and arrival time
4. Inquire about breakfast
5. Formal closing (Mit freundlichen Grüßen)`,
        rubricCriteria: [
          { name: 'Formal Greeting & Closing', description: 'Correct polite opening and closing formulae', maxPoints: 20 },
          { name: 'Content Completion', description: 'All 5 bullet points addressed clearly', maxPoints: 40 },
          { name: 'Grammar & Word Order', description: 'Accurate verb position and noun capitalization', maxPoints: 40 }
        ],
        status: PublicationStatus.PUBLISHED
      }
    });

    // Seed a student submission
    await prisma.assignmentSubmission.upsert({
      where: { id: 'seed-submission-1' },
      update: {},
      create: {
        id: 'seed-submission-1',
        assignmentId: assignment1.id,
        userId: studentUser.id,
        content: `Sehr geehrte Damen und Herren,

ich möchte gern ein Doppelzimmer für zwei Nächte vom 14. bis 16. November reservieren. Wir kommen um ca. 18 Uhr am Hotel an.
Bieten Sie auch ein Frühstücksbüffet an und was kostet es?

Vielen Dank im Voraus für Ihre Antwort.

Mit freundlichen Grüßen,
Elena Rostova`,
        status: 'SUBMITTED',
        submittedAt: new Date(Date.now() - 3600000)
      }
    });
  }

  // 9. Teacher Batches
  console.log('Seeding batches...');
  const batch1 = await prisma.teacherBatch.upsert({
    where: { id: 'seed-batch-a1-winter' },
    update: {},
    create: {
      id: 'seed-batch-a1-winter',
      name: 'Goethe A1 Intensive — Winter 2026',
      level: GermanLevel.A1,
      description: 'Morning intensive batch meeting Mon-Thu 10:00-11:30 CET for Goethe-Zertifikat A1 candidates.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 86400000),
      maxStudents: 15,
      isActive: true
    }
  });

  if (teacherUser.teacherProfile) {
    await prisma.teacherBatchAssignment.upsert({
      where: {
        batchId_teacherId: {
          batchId: batch1.id,
          teacherId: teacherUser.teacherProfile.id
        }
      },
      update: {},
      create: {
        batchId: batch1.id,
        teacherId: teacherUser.teacherProfile.id,
        isPrimary: true
      }
    });
  }

  await prisma.batchMembership.upsert({
    where: {
      batchId_userId: {
        batchId: batch1.id,
        userId: studentUser.id
      }
    },
    update: {},
    create: {
      batchId: batch1.id,
      userId: studentUser.id,
      status: 'ACTIVE'
    }
  });

  // 10. Sample Inquiries
  console.log('Seeding contact enquiries...');
  await prisma.contactEnquiry.upsert({
    where: { id: 'seed-enquiry-1' },
    update: {},
    create: {
      id: 'seed-enquiry-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9811223344',
      level: GermanLevel.A1,
      message: 'Hello DeutschWelt team, I am planning to move to Munich this autumn for my engineering master degree. Does your A1 course include live conversation practice with certified instructors?',
      status: 'NEW'
    }
  });

  await prisma.contactEnquiry.upsert({
    where: { id: 'seed-enquiry-2' },
    update: {},
    create: {
      id: 'seed-enquiry-2',
      name: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      phone: '+49 176 99887766',
      level: GermanLevel.B1,
      message: 'I have passed A2 last year and want to prepare for the Goethe-Zertifikat B1 exam in 3 months. Can I get a placement test before enrolling?',
      status: 'CONTACTED',
      adminNotes: 'Contacted on phone. Scheduled online diagnostic assessment for Wednesday.'
    }
  });

  // 11. Sample Notifications
  console.log('Seeding notifications...');
  await prisma.notification.upsert({
    where: { id: 'seed-notif-1' },
    update: {},
    create: {
      id: 'seed-notif-1',
      userId: studentUser.id,
      title: 'Willkommen bei DeutschWelt!',
      message: 'Welcome to your German learning journey! Start with Einheit 1: Sich vorstellen.',
      type: 'INFO',
      linkUrl: '/courses/deutsch-a1-beginner-intensiv',
      isRead: false
    }
  });

  await prisma.notification.upsert({
    where: { id: 'seed-notif-2' },
    update: {},
    create: {
      id: 'seed-notif-2',
      userId: studentUser.id,
      title: 'Neue Schreibaufgabe bereit',
      message: 'Dr. Katharina Weber has published a new writing assignment: "Eine kurze E-Mail an das Hotel".',
      type: 'ASSIGNMENT',
      linkUrl: '/student/assignments',
      isRead: false
    }
  });

  console.log('--- DeutschWelt Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
