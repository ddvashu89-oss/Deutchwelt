import { Request, Response, NextFunction } from 'express';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getLessonById(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;

    if (isDatabaseConnected) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          contentBlocks: {
            orderBy: { order: 'asc' }
          },
          exercises: {
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: {
                  options: {
                    select: { id: true, label: true, order: true } // Hide isCorrect from student
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
                orderBy: { order: 'asc' },
                select: { id: true, title: true, order: true }
              }
            }
          }
        }
      });

      if (!lesson) {
        return next(new AppError('Lesson not found.', 404, 'NOT_FOUND'));
      }

      // Find previous and next lessons
      const siblingLessons = lesson.unit.lessons;
      const currentIndex = siblingLessons.findIndex(l => l.id === lesson.id);
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
      const lesson = store.lessons.find(l => l.id === lessonId);
      if (!lesson) {
        return next(new AppError('Lesson not found.', 404, 'NOT_FOUND'));
      }

      const contentBlocks = store.contentBlocks.filter(cb => cb.lessonId === lesson.id);
      const exercises = store.exercises.filter(e => e.lessonId === lesson.id).map(e => ({
        ...e,
        questions: store.questions.filter(q => q.exerciseId === e.id).map(q => ({
          ...q,
          options: store.options.filter(o => o.questionId === q.id).map(o => ({
            id: o.id,
            label: o.label,
            order: o.order
          }))
        }))
      }));

      const unit = store.units.find(u => u.id === lesson.unitId);
      const course = unit ? store.courses.find(c => c.id === unit.courseId) : null;
      const siblingLessons = store.lessons.filter(l => l.unitId === lesson.unitId).sort((a, b) => a.order - b.order);
      const currentIndex = siblingLessons.findIndex(l => l.id === lesson.id);
      const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

      let isCompleted = false;
      let userScore = null;

      if (req.user) {
        const prog = store.lessonProgress.find(lp => lp.userId === req.user?.id && lp.lessonId === lesson.id);
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

export async function markLessonComplete(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
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
          completedAt: new Date(),
          timeSpentSeconds: { increment: timeSpentSeconds }
        },
        create: {
          userId: req.user.id,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
          timeSpentSeconds
        }
      });

      return res.json({ success: true, message: 'Lesson marked as completed!', progress });
    } else {
      let progress = store.lessonProgress.find(lp => lp.userId === req.user?.id && lp.lessonId === lessonId);
      if (progress) {
        progress.isCompleted = true;
        progress.completedAt = new Date().toISOString();
        progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + timeSpentSeconds;
      } else {
        progress = {
          id: `lp-${Date.now()}`,
          userId: req.user.id,
          lessonId,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          timeSpentSeconds
        };
        store.lessonProgress.push(progress);
      }

      return res.json({ success: true, message: 'Lesson marked as completed!', progress });
    }
  } catch (error) {
    next(error);
  }
}
