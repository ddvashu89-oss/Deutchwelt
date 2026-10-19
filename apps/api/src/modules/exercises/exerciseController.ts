import { Request, Response, NextFunction } from 'express';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { evaluateFullExercise, QuestionData } from '../../services/exerciseService.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getLessonExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;

    if (isDatabaseConnected) {
      const exercises = await prisma.exercise.findMany({
        where: { lessonId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
                select: { id: true, label: true, order: true } // Hide isCorrect from student
              }
            }
          }
        }
      });

      return res.json({ success: true, exercises });
    } else {
      const exercises = store.exercises.filter(e => e.lessonId === lessonId).map(e => ({
        ...e,
        questions: store.questions.filter(q => q.exerciseId === e.id).map(q => ({
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
          options: store.options.filter(o => o.questionId === q.id).map(o => ({
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

export async function submitExerciseAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Please log in to submit exercise attempts.', 401));
    }

    const { exerciseId } = req.params;
    const { answers } = req.body; // array of { questionId, answer }

    if (!Array.isArray(answers) || answers.length === 0) {
      return next(new AppError('Answers array cannot be empty.', 400));
    }

    if (isDatabaseConnected) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: true }
          }
        }
      });

      if (!exercise) {
        return next(new AppError('Exercise not found.', 404));
      }

      const questionData: QuestionData[] = exercise.questions.map(q => ({
        id: q.id,
        type: q.type as any,
        prompt: q.prompt,
        points: q.points,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      const evaluation = evaluateFullExercise(questionData, answers, exercise.passingScore);

      // Persist attempt
      const attempt = await prisma.exerciseAttempt.create({
        data: {
          userId: req.user.id,
          exerciseId: exercise.id,
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          percentage: evaluation.percentage,
          passed: evaluation.passed,
          completedAt: new Date(),
          answers: {
            create: evaluation.breakdown.map(b => ({
              questionId: b.questionId,
              submittedAnswer: b.userAnswer ?? '',
              isCorrect: b.isCorrect,
              pointsEarned: b.pointsEarned
            }))
          }
        }
      });

      // Update student profile activity & streak
      await prisma.studentProfile.updateMany({
        where: { userId: req.user.id },
        data: {
          lastActiveDate: new Date(),
          streakCount: { increment: 1 }
        }
      });

      return res.json({
        success: true,
        attemptId: attempt.id,
        result: evaluation
      });
    } else {
      const exercise = store.exercises.find(e => e.id === exerciseId);
      if (!exercise) {
        return next(new AppError('Exercise not found.', 404));
      }

      const questions = store.questions.filter(q => q.exerciseId === exercise.id);
      const questionData: QuestionData[] = questions.map(q => ({
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
        completedAt: new Date().toISOString()
      });

      // Update streak
      const profile = store.studentProfiles.find(sp => sp.userId === req.user?.id);
      if (profile) {
        profile.lastActiveDate = new Date().toISOString();
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
