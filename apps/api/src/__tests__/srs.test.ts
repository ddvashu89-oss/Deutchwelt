import { describe, it, expect } from 'vitest';
import { computeNextSRSState } from '../services/srsService.js';
import { VocabMasteryStatus } from '@deutschwelt/shared';

describe('Spaced Repetition System (SRS) - Leitner Algorithm', () => {
  it('advances box from 1 to 2 when answered correctly (quality >= 3)', () => {
    const next = computeNextSRSState({
      currentBox: 1,
      timesReviewed: 0,
      timesCorrect: 0,
      quality: 4
    });

    expect(next.box).toBe(2);
    expect(next.status).toBe(VocabMasteryStatus.LEARNING);
    expect(next.timesReviewed).toBe(1);
    expect(next.timesCorrect).toBe(1);
  });

  it('drops back to box 1 when answered incorrectly (quality < 3)', () => {
    const next = computeNextSRSState({
      currentBox: 4,
      timesReviewed: 5,
      timesCorrect: 4,
      quality: 2 // failed recall
    });

    expect(next.box).toBe(1);
    expect(next.status).toBe(VocabMasteryStatus.LEARNING);
    expect(next.timesReviewed).toBe(6);
    expect(next.timesCorrect).toBe(4); // did not increment
  });

  it('marks vocabulary as MASTERED when reaching box 5', () => {
    const next = computeNextSRSState({
      currentBox: 4,
      timesReviewed: 8,
      timesCorrect: 8,
      quality: 5
    });

    expect(next.box).toBe(5);
    expect(next.status).toBe(VocabMasteryStatus.MASTERED);
  });
});
