import { ExerciseType } from '@deutschwelt/shared';

export interface QuestionData {
  id: string;
  type: ExerciseType;
  prompt: string;
  points: number;
  correctAnswer: any;
  explanation?: string | null;
}

export interface AnswerSubmission {
  questionId: string;
  answer: any;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  userAnswer: any;
  correctAnswer: any;
  explanation?: string | null;
}

export function evaluateQuestionAnswer(question: QuestionData, userAnswer: any): QuestionResult {
  let isCorrect = false;

  if (userAnswer === undefined || userAnswer === null) {
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
    case ExerciseType.MULTIPLE_CHOICE:
    case ExerciseType.TRUE_FALSE: {
      const cleanUser = String(userAnswer).trim().toLowerCase();
      const cleanCorrect = String(question.correctAnswer).trim().toLowerCase();
      isCorrect = cleanUser === cleanCorrect;
      break;
    }

    case ExerciseType.FILL_IN_BLANK:
    case ExerciseType.GRAMMAR_CORRECTION:
    case ExerciseType.TRANSLATION: {
      const cleanUser = String(userAnswer).trim().toLowerCase().replace(/[.,!?;:]/g, '');
      if (Array.isArray(question.correctAnswer)) {
        isCorrect = question.correctAnswer.some(ans => 
          String(ans).trim().toLowerCase().replace(/[.,!?;:]/g, '') === cleanUser
        );
      } else {
        const cleanCorrect = String(question.correctAnswer).trim().toLowerCase().replace(/[.,!?;:]/g, '');
        isCorrect = cleanUser === cleanCorrect;
      }
      break;
    }

    case ExerciseType.SENTENCE_ORDERING: {
      if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
        isCorrect = userAnswer.length === question.correctAnswer.length &&
          userAnswer.every((val, idx) => String(val).trim().toLowerCase() === String(question.correctAnswer[idx]).trim().toLowerCase());
      } else {
        const userStr = Array.isArray(userAnswer) ? userAnswer.join(' ') : String(userAnswer);
        const correctStr = Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' ') : String(question.correctAnswer);
        isCorrect = userStr.trim().toLowerCase() === correctStr.trim().toLowerCase();
      }
      break;
    }

    case ExerciseType.MATCHING: {
      if (typeof userAnswer === 'object' && typeof question.correctAnswer === 'object') {
        const userEntries = Object.entries(userAnswer);
        const correctMap = question.correctAnswer as Record<string, string>;
        isCorrect = userEntries.length === Object.keys(correctMap).length &&
          userEntries.every(([k, v]) => String(correctMap[k]).trim().toLowerCase() === String(v).trim().toLowerCase());
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

export function evaluateFullExercise(
  questions: QuestionData[],
  submissions: AnswerSubmission[],
  passingScorePercentage = 70
) {
  let totalPoints = 0;
  let earnedPoints = 0;
  const breakdown: QuestionResult[] = [];

  const submissionMap = new Map<string, any>();
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

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentage >= passingScorePercentage;

  return {
    score: earnedPoints,
    maxScore: totalPoints,
    percentage,
    passed,
    breakdown
  };
}
