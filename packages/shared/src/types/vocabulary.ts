import { GermanLevel, GermanArticle, PartOfSpeech, VocabMasteryStatus } from './enums.js';

export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  hindi?: string | null;
  article: GermanArticle;
  plural?: string | null;
  partOfSpeech: PartOfSpeech;
  level: GermanLevel;
  category: string;
  exampleSentenceDe: string;
  exampleSentenceEn: string;
  exampleSentenceHi?: string | null;
  ipa?: string | null;
  audioUrl?: string | null;
  tags: string[];
  difficulty: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
}

export interface StudentVocabularyProgress {
  id: string;
  userId: string;
  wordId: string;
  status: VocabMasteryStatus;
  box: number; // Leitner box 1 to 5
  timesReviewed: number;
  timesCorrect: number;
  lastReviewedAt?: string | null;
  nextReviewAt: string;
  word?: VocabularyWord;
}

export interface FlashcardStats {
  totalWords: number;
  learning: number;
  reviewing: number;
  mastered: number;
  dueToday: number;
}
