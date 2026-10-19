import { describe, it, expect } from 'vitest';
import { evaluateQuestionAnswer, evaluateFullExercise, QuestionData } from '../services/exerciseService.js';
import { ExerciseType } from '@deutschwelt/shared';

describe('Exercise Engine - Server Side Evaluation', () => {
  it('correctly evaluates multiple choice questions', () => {
    const question: QuestionData = {
      id: 'q1',
      type: ExerciseType.MULTIPLE_CHOICE,
      prompt: 'What is the correct greeting for the morning?',
      points: 10,
      correctAnswer: 'Guten Morgen'
    };

    const correct = evaluateQuestionAnswer(question, 'Guten Morgen');
    expect(correct.isCorrect).toBe(true);
    expect(correct.pointsEarned).toBe(10);

    const incorrect = evaluateQuestionAnswer(question, 'Gute Nacht');
    expect(incorrect.isCorrect).toBe(false);
    expect(incorrect.pointsEarned).toBe(0);
  });

  it('correctly evaluates fill in the blank with case and whitespace trimming', () => {
    const question: QuestionData = {
      id: 'q2',
      type: ExerciseType.FILL_IN_BLANK,
      prompt: 'Woher ______ du?',
      points: 10,
      correctAnswer: 'kommst'
    };

    const res1 = evaluateQuestionAnswer(question, 'kommst');
    expect(res1.isCorrect).toBe(true);

    const res2 = evaluateQuestionAnswer(question, '  Kommst  ');
    expect(res2.isCorrect).toBe(true);

    const res3 = evaluateQuestionAnswer(question, 'kommen');
    expect(res3.isCorrect).toBe(false);
  });

  it('correctly evaluates sentence ordering arrays', () => {
    const question: QuestionData = {
      id: 'q3',
      type: ExerciseType.SENTENCE_ORDERING,
      prompt: 'Arrange into a correct German sentence',
      points: 20,
      correctAnswer: ['Ich', 'wohne', 'in', 'Berlin']
    };

    const res1 = evaluateQuestionAnswer(question, ['Ich', 'wohne', 'in', 'Berlin']);
    expect(res1.isCorrect).toBe(true);
    expect(res1.pointsEarned).toBe(20);

    const res2 = evaluateQuestionAnswer(question, ['Ich', 'in', 'Berlin', 'wohne']);
    expect(res2.isCorrect).toBe(false);
  });

  it('evaluates a full multi-question exercise and computes percentages', () => {
    const questions: QuestionData[] = [
      { id: 'q1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Q1', points: 10, correctAnswer: 'A' },
      { id: 'q2', type: ExerciseType.TRUE_FALSE, prompt: 'Q2', points: 10, correctAnswer: 'true' },
      { id: 'q3', type: ExerciseType.FILL_IN_BLANK, prompt: 'Q3', points: 10, correctAnswer: 'das' }
    ];

    const submission = [
      { questionId: 'q1', answer: 'A' },
      { questionId: 'q2', answer: 'true' },
      { questionId: 'q3', answer: 'der' } // wrong
    ];

    const result = evaluateFullExercise(questions, submission, 70);
    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(30);
    expect(result.percentage).toBe(67);
    expect(result.passed).toBe(false); // 67% < 70%
  });
});
