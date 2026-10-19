import { Request, Response, NextFunction } from 'express';
import { PublicationStatus, GermanLevel } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getAllCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const { level } = req.query;

    if (isDatabaseConnected) {
      const where: any = { status: PublicationStatus.PUBLISHED };
      if (level && Object.values(GermanLevel).includes(level as GermanLevel)) {
        where.level = level;
      }

      const courses = await prisma.course.findMany({
        where,
        orderBy: { order: 'asc' },
        include: {
          units: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                where: { status: PublicationStatus.PUBLISHED },
                select: { id: true, title: true, durationMinutes: true, order: true }
              }
            }
          }
        }
      });

      return res.json({ success: true, courses });
    } else {
      let courses = store.courses.filter(c => c.status === PublicationStatus.PUBLISHED);
      if (level && Object.values(GermanLevel).includes(level as GermanLevel)) {
        courses = courses.filter(c => c.level === level);
      }

      const coursesWithUnits = courses.map(c => {
        const units = store.units.filter(u => u.courseId === c.id).map(u => ({
          ...u,
          lessons: store.lessons.filter(l => l.unitId === u.id && l.status === PublicationStatus.PUBLISHED)
        }));
        return { ...c, units };
      });

      return res.json({ success: true, courses: coursesWithUnits });
    }
  } catch (error) {
    next(error);
  }
}

export async function getCourseBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    if (isDatabaseConnected) {
      const course = await prisma.course.findFirst({
        where: {
          OR: [{ slug }, { id: slug }]
        },
        include: {
          units: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                where: { status: PublicationStatus.PUBLISHED },
                orderBy: { order: 'asc' },
                include: {
                  exercises: {
                    select: { id: true, title: true, type: true, passingScore: true }
                  }
                }
              }
            }
          },
          prerequisites: {
            include: { prerequisiteCourse: true }
          }
        }
      });

      if (!course) {
        return next(new AppError('Course not found.', 404, 'NOT_FOUND'));
      }

      // Check if current user is enrolled
      let isEnrolled = false;
      let userProgress: any = null;
      if (req.user) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: course.id
            }
          }
        });
        if (enrollment) {
          isEnrolled = true;
          userProgress = enrollment.progressPercentage;
        }
      }

      return res.json({ success: true, course, isEnrolled, userProgress });
    } else {
      const course = store.courses.find(c => c.slug === slug || c.id === slug);
      if (!course) {
        return next(new AppError('Course not found.', 404, 'NOT_FOUND'));
      }

      const units = store.units.filter(u => u.courseId === course.id).map(u => ({
        ...u,
        lessons: store.lessons.filter(l => l.unitId === u.id).map(l => ({
          ...l,
          exercises: store.exercises.filter(e => e.lessonId === l.id)
        }))
      }));

      let isEnrolled = false;
      let userProgress = 0;
      if (req.user) {
        const enr = store.enrollments.find(e => e.userId === req.user?.id && e.courseId === course.id);
        if (enr) {
          isEnrolled = true;
          userProgress = enr.progressPercentage;
        }
      }

      return res.json({ success: true, course: { ...course, units }, isEnrolled, userProgress });
    }
  } catch (error) {
    next(error);
  }
}

export async function enrollInCourse(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Please log in to enroll.', 401, 'UNAUTHORIZED'));
    }

    const { courseId } = req.params;

    if (isDatabaseConnected) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return next(new AppError('Course not found.', 404, 'NOT_FOUND'));
      }

      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId
          }
        },
        update: { status: 'ACTIVE' },
        create: {
          userId: req.user.id,
          courseId,
          status: 'ACTIVE',
          progressPercentage: 0
        }
      });

      return res.json({ success: true, message: `Successfully enrolled in ${course.title}!`, enrollment });
    } else {
      const course = store.courses.find(c => c.id === courseId || c.slug === courseId);
      if (!course) {
        return next(new AppError('Course not found.', 404, 'NOT_FOUND'));
      }

      let enrollment = store.enrollments.find(e => e.userId === req.user?.id && e.courseId === course.id);
      if (!enrollment) {
        enrollment = {
          id: `enr-${Date.now()}`,
          userId: req.user.id,
          courseId: course.id,
          status: 'ACTIVE',
          progressPercentage: 0,
          enrolledAt: new Date().toISOString()
        };
        store.enrollments.push(enrollment);
      }

      return res.json({ success: true, message: `Successfully enrolled in ${course.title}!`, enrollment });
    }
  } catch (error) {
    next(error);
  }
}
