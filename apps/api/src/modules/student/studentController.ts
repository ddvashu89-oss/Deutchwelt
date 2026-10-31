import { Request, Response, NextFunction } from 'express';
import { VocabMasteryStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';
import { driveFileUrl } from '../../services/googleDrive.js';

export async function getStudentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const userId = req.user.id;

    if (isDatabaseConnected) {
      const [
        profile,
        enrollments,
        completedLessons,
        vocabStats,
        exerciseAttempts,
        assignments
      ] = await Promise.all([
        prisma.studentProfile.findUnique({ where: { userId } }),
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                units: {
                  include: {
                    lessons: { select: { id: true, title: true, order: true } }
                  }
                }
              }
            }
          }
        }),
        prisma.lessonProgress.findMany({ where: { userId, isCompleted: true } }),
        prisma.studentVocabularyProgress.findMany({ where: { userId } }),
        prisma.exerciseAttempt.findMany({ where: { userId }, orderBy: { startedAt: 'desc' } }),
        prisma.assignment.findMany({
          where: { dueDate: { gte: new Date() } },
          take: 5,
          include: {
            submissions: { where: { userId } }
          }
        })
      ]);

      const wordsLearned = vocabStats.length;
      const wordsMastered = vocabStats.filter(v => v.box === 5 || v.status === 'MASTERED').length;

      const avgAccuracy = exerciseAttempts.length > 0
        ? Math.round(exerciseAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / exerciseAttempts.length)
        : 100;

      // Recommended / Continue learning lesson
      const activeEnrollment = enrollments[0];
      let continueLesson: any = null;
      if (activeEnrollment && activeEnrollment.course.units.length > 0) {
        const completedIds = new Set(completedLessons.map(cl => cl.lessonId));
        for (const unit of activeEnrollment.course.units) {
          for (const lesson of unit.lessons) {
            if (!completedIds.has(lesson.id)) {
              continueLesson = {
                id: lesson.id,
                title: lesson.title,
                unitTitle: unit.title,
                courseSlug: activeEnrollment.course.slug,
                courseTitle: activeEnrollment.course.title
              };
              break;
            }
          }
          if (continueLesson) break;
        }
      }

      return res.json({
        success: true,
        stats: {
          currentLevel: profile?.currentLevel || 'A1',
          streakDays: profile?.streakCount || 1,
          dailyGoalMinutes: profile?.dailyGoalMinutes || 20,
          minutesSpentToday: 15,
          wordsLearned,
          wordsMastered,
          exerciseAccuracy: avgAccuracy,
          completedLessonsCount: completedLessons.length,
          enrolledCoursesCount: enrollments.length,
          upcomingAssignmentsCount: assignments.filter(a => a.submissions.length === 0).length,
          continueLesson,
          enrollments: enrollments.map(e => ({
            id: e.id,
            courseId: e.courseId,
            courseTitle: e.course.title,
            courseSlug: e.course.slug,
            level: e.course.level,
            progressPercentage: e.progressPercentage,
            status: e.status
          })),
          recentActivity: [
            ...exerciseAttempts.slice(0, 3).map(a => ({
              id: a.id,
              type: 'EXERCISE_COMPLETED',
              title: `Completed exercise score: ${a.percentage}%`,
              timestamp: a.completedAt?.toISOString() || a.startedAt.toISOString(),
              score: a.percentage
            }))
          ]
        }
      });
    } else {
      const profile = store.studentProfiles.find(sp => sp.userId === userId);
      const enrollments = store.enrollments.filter(e => e.userId === userId).map(e => {
        const course = store.courses.find(c => c.id === e.courseId);
        return {
          id: e.id,
          courseId: e.courseId,
          courseTitle: course?.title || 'German Course',
          courseSlug: course?.slug || 'course',
          level: course?.level || 'A1',
          progressPercentage: e.progressPercentage,
          status: e.status
        };
      });

      const completedLessons = store.lessonProgress.filter(lp => lp.userId === userId && lp.isCompleted);
      const vocabStats = store.studentVocabProgress.filter(vp => vp.userId === userId);
      const wordsLearned = vocabStats.length;
      const wordsMastered = vocabStats.filter(vp => vp.box === 5 || vp.status === VocabMasteryStatus.MASTERED).length;

      const exerciseAttempts = store.attempts.filter(a => a.userId === userId);
      const avgAccuracy = exerciseAttempts.length > 0
        ? Math.round(exerciseAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / exerciseAttempts.length)
        : 95;

      const completedIds = new Set(completedLessons.map(cl => cl.lessonId));
      const targetLevel = profile?.currentLevel || 'A1';
      const activeCourse = store.courses.find(c => c.level === targetLevel) || store.courses[0];

      let continueLesson: any = null;
      if (activeCourse && activeCourse.units) {
        for (const unit of activeCourse.units) {
          for (const lesson of unit.lessons) {
            if (!completedIds.has(lesson.id)) {
              continueLesson = {
                id: lesson.id,
                title: lesson.title,
                unitTitle: unit.title,
                courseSlug: activeCourse.slug,
                courseTitle: activeCourse.title
              };
              break;
            }
          }
          if (continueLesson) break;
        }
      }

      if (!continueLesson) {
        continueLesson = {
          id: 'lesson-a1-1-1',
          title: 'Lektion 1.1: Sich vorstellen (Introducing Yourself)',
          unitTitle: 'Einheit 1: Hallo und Willkommen',
          courseSlug: 'deutsch-a1-beginner-intensiv',
          courseTitle: 'Deutsch A1: Complete Beginner to Breakthrough'
        };
      }

      return res.json({
        success: true,
        stats: {
          currentLevel: profile?.currentLevel || 'A1',
          currentLevelName: 'A1 - Beginner',
          streakDays: profile?.streakCount || 7,
          dailyGoalMinutes: profile?.dailyGoalMinutes || 25,
          minutesSpentToday: 180,
          studyTimeMinutes: 180,
          wordsLearned: wordsLearned || 25,
          wordsMastered: wordsMastered || 18,
          exerciseAccuracy: avgAccuracy || 95,
          exercisesDone: exerciseAttempts.length || 12,
          levelProgressPercentage: 20,
          completedLessonsCount: completedLessons.length || 3,
          enrolledCoursesCount: enrollments.length || 1,
          upcomingAssignmentsCount: 1,
          continueLesson,
          enrollments: enrollments.length > 0 ? enrollments : [{
            id: 'enr-1',
            courseId: 'course-a1',
            courseTitle: 'Deutsch A1: Complete Beginner to Breakthrough',
            courseSlug: 'deutsch-a1-beginner-intensiv',
            level: 'A1',
            progressPercentage: 35,
            status: 'ACTIVE'
          }],
          recentActivity: [
            {
              id: 'act-1',
              type: 'LESSON_COMPLETED',
              title: 'Completed: Lektion 1.1: Sich vorstellen',
              timestamp: new Date().toISOString(),
              score: 100
            },
            {
              id: 'act-2',
              type: 'VOCAB_PRACTICED',
              title: 'Practiced 5 vocabulary words',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getStudentNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (isDatabaseConnected) {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, notifications });
    } else {
      const notifications = store.notifications.filter(n => n.userId === req.user?.id);
      return res.json({ success: true, notifications });
    }
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { notificationId } = req.params;

    if (isDatabaseConnected) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: req.user.id },
        data: { isRead: true }
      });
    } else {
      const notif = store.notifications.find(n => n.id === notificationId && n.userId === req.user?.id);
      if (notif) notif.isRead = true;
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { firstName, lastName, phone, address, currentLevel, learningGoal, dailyGoalMinutes, preferredLanguage } = req.body;

    if (isDatabaseConnected) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          phone,
          studentProfile: {
            upsert: {
              create: {
                currentLevel,
                learningGoal,
                dailyGoalMinutes,
                preferredLanguage
              },
              update: {
                currentLevel,
                learningGoal,
                dailyGoalMinutes,
                preferredLanguage
              }
            }
          }
        },
        include: { studentProfile: true }
      });

      return res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
    } else {
      const user = store.users.find(u => u.id === req.user?.id);
      if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
      }
      let sp = store.studentProfiles.find(p => p.userId === req.user?.id);
      if (sp) {
        if (currentLevel) sp.currentLevel = currentLevel;
        if (learningGoal !== undefined) sp.learningGoal = learningGoal;
        if (dailyGoalMinutes) sp.dailyGoalMinutes = dailyGoalMinutes;
        if (preferredLanguage) sp.preferredLanguage = preferredLanguage;
      }

      return res.json({ success: true, message: 'Profile updated successfully.', user: { ...user, studentProfile: sp } });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get study materials and announcements assigned to the student's batch
 */
export async function getStudentBatchMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    if (isDatabaseConnected) {
      const memberships = await prisma.batchMembership.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        select: { batchId: true }
      });
      const batchIds = memberships.map((item: any) => item.batchId);
      const stored = batchIds.length ? await prisma.driveAsset.findMany({
        where: { type: 'TEACHER_MATERIAL', batchId: { in: batchIds } },
        include: {
          batch: { select: { name: true } },
          owner: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }) : [];
      const local = store.teacherMaterials.filter(m => batchIds.includes(m.batchId) && !m.fileUrl?.startsWith('/api/v1/files/'));
      const materials = [
        ...stored.map((asset: any) => ({
          id: asset.id,
          teacherId: asset.teacherProfileId,
          batchId: asset.batchId,
          title: asset.title,
          category: asset.category || 'WORKSHEET',
          description: asset.description || '',
          fileUrl: driveFileUrl(asset.driveFileId),
          fileType: asset.fileName.split('.').pop()?.toUpperCase() || 'FILE',
          fileSize: `${(Number(asset.sizeBytes) / (1024 * 1024)).toFixed(1)} MB`,
          level: asset.level,
          createdAt: asset.createdAt,
          batchName: asset.batch?.name || 'Class Materials',
          teacherName: `${asset.owner?.firstName || ''} ${asset.owner?.lastName || ''}`.trim() || 'Course Instructor'
        })),
        ...local.map((m: any) => {
          const batch = store.batches.find(b => b.id === m.batchId);
          const teacher = store.teacherProfiles.find(tp => tp.id === m.teacherId);
          const teacherUser = teacher ? store.users.find(u => u.id === teacher.userId) : null;
          return {
            ...m,
            batchName: batch?.name || 'Class Materials',
            teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Course Instructor'
          };
        })
      ];
      const announcements = store.batchAnnouncements.filter(a => batchIds.includes(a.batchId));
      return res.json({ success: true, materials, announcements });
    }

    const myBatchIds = store.batchMemberships
      .filter(bm => bm.userId === req.user!.id)
      .map(bm => bm.batchId);

    // If student isn't explicitly enrolled in a batch yet, default to batch-1 for demo
    const effectiveBatchIds = myBatchIds.length > 0 ? myBatchIds : ['batch-1'];

    const materials = store.teacherMaterials
      .filter(m => effectiveBatchIds.includes(m.batchId))
      .map(m => {
        const batch = store.batches.find(b => b.id === m.batchId);
        const teacherProfile = store.teacherProfiles.find(tp => tp.id === m.teacherId);
        const teacherUser = teacherProfile ? store.users.find(u => u.id === teacherProfile.userId) : null;
        return {
          ...m,
          batchName: batch?.name || 'Class Materials',
          teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Course Instructor'
        };
      });

    const announcements = store.batchAnnouncements
      .filter(a => effectiveBatchIds.includes(a.batchId))
      .map(a => {
        const batch = store.batches.find(b => b.id === a.batchId);
        const teacherProfile = store.teacherProfiles.find(tp => tp.id === a.teacherId);
        const teacherUser = teacherProfile ? store.users.find(u => u.id === teacherProfile.userId) : null;
        return {
          ...a,
          batchName: batch?.name || 'Batch Announcement',
          teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Course Instructor'
        };
      });

    return res.json({ success: true, materials, announcements });
  } catch (error) {
    next(error);
  }
}

/**
 * Get lectures and live video sessions for the student's batch
 */
export async function getStudentBatchLectures(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    if (isDatabaseConnected) {
      const memberships = await prisma.batchMembership.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        select: { batchId: true }
      });
      const batchIds = memberships.map((item: any) => item.batchId);
      const stored = batchIds.length ? await prisma.driveAsset.findMany({
        where: { type: 'TEACHER_LECTURE', batchId: { in: batchIds } },
        include: {
          batch: { select: { name: true } },
          owner: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }) : [];
      const local = store.teacherLectures.filter(l => batchIds.includes(l.batchId) && !l.videoUrl?.startsWith('/api/v1/files/'));
      const lectures = [
        ...stored.map((asset: any) => ({
          id: asset.id,
          teacherId: asset.teacherProfileId,
          batchId: asset.batchId,
          title: asset.title,
          description: asset.description || '',
          level: asset.level,
          videoUrl: driveFileUrl(asset.driveFileId),
          durationMinutes: asset.durationMinutes || 45,
          scheduledFor: asset.scheduledFor || asset.createdAt,
          isLive: asset.isLive,
          meetingUrl: asset.meetingUrl || '',
          fileSize: `${(Number(asset.sizeBytes) / (1024 * 1024)).toFixed(1)} MB`,
          originalFilename: asset.fileName,
          status: 'PUBLISHED',
          createdAt: asset.createdAt,
          batchName: asset.batch?.name || 'Class Lecture',
          teacherName: `${asset.owner?.firstName || ''} ${asset.owner?.lastName || ''}`.trim() || 'Course Instructor'
        })),
        ...local.map((l: any) => {
          const batch = store.batches.find(b => b.id === l.batchId);
          const teacher = store.teacherProfiles.find(tp => tp.id === l.teacherId);
          const teacherUser = teacher ? store.users.find(u => u.id === teacher.userId) : null;
          return {
            ...l,
            batchName: batch?.name || 'Class Lecture',
            teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Course Instructor'
          };
        })
      ];
      return res.json({ success: true, lectures });
    }

    const myBatchIds = store.batchMemberships
      .filter(bm => bm.userId === req.user!.id)
      .map(bm => bm.batchId);

    const effectiveBatchIds = myBatchIds.length > 0 ? myBatchIds : ['batch-1'];

    const lectures = store.teacherLectures
      .filter(l => effectiveBatchIds.includes(l.batchId))
      .map(l => {
        const batch = store.batches.find(b => b.id === l.batchId);
        const teacherProfile = store.teacherProfiles.find(tp => tp.id === l.teacherId);
        const teacherUser = teacherProfile ? store.users.find(u => u.id === teacherProfile.userId) : null;
        return {
          ...l,
          batchName: batch?.name || 'Class Lecture',
          teacherName: teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Course Instructor'
        };
      });

    return res.json({ success: true, lectures });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all earned certificates for the authenticated student
 */
export async function getStudentCertificates(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const certificates = store.certificates.filter(c => c.userId === req.user!.id);
    return res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
}

/**
 * Claim / issue course completion certificate
 */
export async function claimCourseCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { courseId } = req.params;

    const course = store.courses.find(c => c.id === courseId);
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }

    // Check if certificate already exists
    const existing = store.certificates.find(c => c.userId === req.user!.id && c.courseId === courseId);
    if (existing) {
      return res.json({ success: true, certificate: existing, message: 'Certificate already issued.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certNumber = `DW-${new Date().getFullYear()}-${course.level}-${randomSuffix}`;
    const newCert = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      userId: req.user.id,
      userFullName: `${req.user.firstName} ${req.user.lastName}`,
      courseId: course.id,
      courseTitle: course.title,
      level: course.level,
      gradeScore: 95,
      gradeClassification: 'Sehr Gut (With Distinction)',
      issuedAt: new Date().toISOString(),
      instructorName: 'Dr. Katharina Weber',
      directorName: 'Dr. Klaus Becker',
      directorTitle: 'Direktor Akademische Bildung, DeutschWelt',
      verificationCode: `DW-VERIFY-${course.level}-${randomSuffix}`
    };

    store.certificates.push(newCert);

    // Add a congratulatory notification
    store.notifications.push({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: '📜 Zertifikat ausgestellt!',
      message: `Herzlichen Glückwunsch! Your official Certificate of Completion for ${course.title} is now available to download.`,
      type: 'COURSE_COMPLETED',
      linkUrl: '/student/courses',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate of Completion generated successfully!',
      certificate: newCert
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public verification of a certificate
 */
export async function verifyCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const { certificateNumber } = req.params;
    const cert = store.certificates.find(
      c => c.certificateNumber.toLowerCase() === certificateNumber.toLowerCase() ||
           c.verificationCode?.toLowerCase() === certificateNumber.toLowerCase()
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'No active DeutschWelt certificate found with this verification number.'
      });
    }

    return res.json({
      success: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        recipient: cert.userFullName,
        courseTitle: cert.courseTitle,
        level: cert.level,
        gradeClassification: cert.gradeClassification,
        issuedAt: cert.issuedAt,
        directorName: cert.directorName,
        isValid: true
      }
    });
  } catch (error) {
    next(error);
  }
}

