import { VocabMasteryStatus } from '@deutschwelt/shared';

// Leitner Spaced Repetition Box Intervals in Days:
// Box 1: 1 day
// Box 2: 3 days
// Box 3: 7 days
// Box 4: 14 days
// Box 5: 30 days
const BOX_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
};

export interface SRSProgressionInput {
  currentBox: number;
  timesReviewed: number;
  timesCorrect: number;
  quality: number; // 0 to 5: 0-2 = failure (reset to box 1), 3-5 = success (advance box)
}

export function computeNextSRSState(input: SRSProgressionInput) {
  let nextBox = input.currentBox;
  let status: VocabMasteryStatus = VocabMasteryStatus.LEARNING;
  let isCorrect = input.quality >= 3;

  if (isCorrect) {
    nextBox = Math.min(5, input.currentBox + 1);
  } else {
    nextBox = 1; // Drop back to Box 1 for relearning
  }

  if (nextBox === 5) {
    status = VocabMasteryStatus.MASTERED;
  } else if (nextBox >= 3) {
    status = VocabMasteryStatus.REVIEWING;
  } else {
    status = VocabMasteryStatus.LEARNING;
  }

  const daysUntilNextReview = BOX_INTERVALS[nextBox] || 1;
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilNextReview);

  return {
    box: nextBox,
    status,
    timesReviewed: input.timesReviewed + 1,
    timesCorrect: isCorrect ? input.timesCorrect + 1 : input.timesCorrect,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: nextReviewAt.toISOString()
  };
}
