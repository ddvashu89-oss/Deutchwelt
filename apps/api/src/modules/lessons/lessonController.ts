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
      let userScore: number | null = null;

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
    const requestedTime = Number(req.body?.timeSpentSeconds ?? 600);
    const timeSpentSeconds = Number.isFinite(requestedTime) ? Math.max(0, Math.min(14400, Math.floor(requestedTime))) : 600;

    if (isDatabaseConnected) {
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { unit: { select: { courseId: true } } } });
      if (!lesson) return next(new AppError('Lesson not found.', 404));
      const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: lesson.unit.courseId } } });
      if (!enrollment || !['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
        return next(new AppError('Enroll in this course to save lesson progress.', 403));
      }
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

      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({ where: { unit: { courseId: lesson.unit.courseId }, status: 'PUBLISHED' } }),
        prisma.lessonProgress.count({ where: { userId: req.user.id, isCompleted: true, lesson: { unit: { courseId: lesson.unit.courseId } } } })
      ]);
      const progressPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progressPercentage, status: progressPercentage >= 100 ? 'COMPLETED' : 'ACTIVE', completedAt: progressPercentage >= 100 ? new Date() : null }
      });

      return res.json({ success: true, message: 'Lesson marked as completed!', progress, progressPercentage });
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
