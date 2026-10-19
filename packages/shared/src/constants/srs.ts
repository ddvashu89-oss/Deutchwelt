export const LEITNER_INTERVALS_DAYS = {
  1: 1,  // Box 1: review tomorrow
  2: 3,  // Box 2: review in 3 days
  3: 7,  // Box 3: review in 1 week
  4: 14, // Box 4: review in 2 weeks
  5: 30  // Box 5: review in 1 month (Mastered)
} as const;

export function calculateNextReviewDate(box: number): Date {
  const days = LEITNER_INTERVALS_DAYS[box as keyof typeof LEITNER_INTERVALS_DAYS] || 1;
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next;
}
