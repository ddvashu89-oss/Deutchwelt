import { GermanLevel } from '../types/enums.js';

export interface LevelInfo {
  code: GermanLevel;
  title: string;
  subtitle: string;
  cefr: string;
  description: string;
  exam: string;
  vocabTarget: number;
  grammarFocus: string[];
}

export const GERMAN_LEVELS_INFO: Record<GermanLevel, LevelInfo> = {
  [GermanLevel.BEGINNER]: {
    code: GermanLevel.BEGINNER,
    title: 'Absolute Beginner',
    subtitle: 'German Alphabet, Pronunciation & Basic Greetings',
    cefr: 'Pre-A1',
    description: 'Learn the German alphabet, umlauts (ä, ö, ü), the sharp S (ß), numbers 1-100, and foundational greetings.',
    exam: 'Preparation for A1',
    vocabTarget: 250,
    grammarFocus: ['Alphabet & Phonetics', 'Basic Greetings', 'Numbers & Alphabet', 'Personal Pronouns']
  },
  [GermanLevel.A1]: {
    code: GermanLevel.A1,
    title: 'A1 — Beginner Breakthrough',
    subtitle: 'Everyday survival, basic conversations & introductions',
    cefr: 'A1',
    description: 'Understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs.',
    exam: 'Goethe-Zertifikat A1 / telc Deutsch A1',
    vocabTarget: 650,
    grammarFocus: ['Articles (der, die, das)', 'Nominative & Accusative cases', 'Regular & Irregular verb conjugation', 'Modal verbs in present tense']
  },
  [GermanLevel.A2]: {
    code: GermanLevel.A2,
    title: 'A2 — Elementary German',
    subtitle: 'Daily routines, shopping, travel & past tense narratives',
    cefr: 'A2',
    description: 'Communicate in simple and routine tasks requiring a direct exchange of information on familiar matters.',
    exam: 'Goethe-Zertifikat A2 / telc Deutsch A2',
    vocabTarget: 1300,
    grammarFocus: ['Dative case & Two-way prepositions (Wechselpräpositionen)', 'Perfekt with haben and sein', 'Reflexive verbs', 'Subordinate clauses with weil, dass, wenn']
  },
  [GermanLevel.B1]: {
    code: GermanLevel.B1,
    title: 'B1 — Intermediate Fluency',
    subtitle: 'Independent communication, work, travel & expressing opinions',
    cefr: 'B1',
    description: 'Understand the main points of clear standard input on familiar matters regularly encountered in work, school, and leisure.',
    exam: 'Goethe-Zertifikat B1 / telc Deutsch B1 / DTZ (Citizenship)',
    vocabTarget: 2400,
    grammarFocus: ['Genitive case', 'Präteritum (Simple past)', 'Konjunktiv II (Wishes & Politeness)', 'Passive voice (Passiv)', 'Relative clauses (Relativsätze)']
  },
  [GermanLevel.B2]: {
    code: GermanLevel.B2,
    title: 'B2 — Upper Intermediate',
    subtitle: 'Complex texts, professional fluency, technical discussions & debate',
    cefr: 'B2',
    description: 'Understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field.',
    exam: 'Goethe-Zertifikat B2 / telc Deutsch B2 / TestDaF Preparation',
    vocabTarget: 4000,
    grammarFocus: ['Advanced Konjunktiv I & II', 'Nominalization (Nominalstil)', 'Participle attributes', 'Advanced connectors & stylistic nuance']
  },
  [GermanLevel.UNSURE]: {
    code: GermanLevel.UNSURE,
    title: 'Placement Assessment',
    subtitle: 'Take our guided diagnostic to discover your level',
    cefr: 'Diagnostic',
    description: 'Evaluate your current reading, grammar, and listening skills to enter at the ideal stage.',
    exam: 'Diagnostic Level Test',
    vocabTarget: 0,
    grammarFocus: ['Diagnostic Comprehensive Review']
  }
};
