import { Request, Response, NextFunction } from 'express';
import { SubmissionStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getTeacherDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (isDatabaseConnected) {
      const [batches, pendingSubmissions, pendingSpeaking, allSubmissions] = await Promise.all([
        prisma.teacherBatch.findMany({
          include: {
            memberships: { include: { user: true } }
          }
        }),
        prisma.assignmentSubmission.findMany({
          where: { status: SubmissionStatus.SUBMITTED },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: { select: { id: true, title: true, maxPoints: true } }
          }
        }),
        prisma.speakingAttempt.findMany({
          where: { status: SubmissionStatus.SUBMITTED },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: { select: { id: true, title: true, level: true } }
          }
        }),
        prisma.assignmentSubmission.findMany({
          where: { status: SubmissionStatus.GRADED },
          select: { score: true }
        })
      ]);

      const totalStudents = batches.reduce((acc, b) => acc + b.memberships.length, 0);
      const avgScore = allSubmissions.length > 0
        ? Math.round(allSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / allSubmissions.length)
        : 88;

      return res.json({
        success: true,
        stats: {
          totalBatches: batches.length,
          totalStudents,
          pendingSubmissionsCount: pendingSubmissions.length + pendingSpeaking.length,
          reviewedThisWeek: allSubmissions.length,
          averageScorePercentage: avgScore,
          recentSubmissions: [
            ...pendingSubmissions.map(s => ({
              id: s.id,
              studentName: `${s.user.firstName} ${s.user.lastName}`,
              assignmentTitle: s.assignment.title,
              submittedAt: s.submittedAt.toISOString(),
              type: 'WRITING'
            })),
            ...pendingSpeaking.map(s => ({
              id: s.id,
              studentName: `${s.user.firstName} ${s.user.lastName}`,
              assignmentTitle: s.prompt.title,
              submittedAt: s.submittedAt.toISOString(),
              type: 'SPEAKING'
            }))
          ]
        }
      });
    } else {
      const totalStudents = store.batchMemberships.length || 1;
      const pendingWriting = store.submissions.filter(s => s.status === SubmissionStatus.SUBMITTED);
      const pendingSpeaking = store.speakingAttempts.filter(s => s.status === SubmissionStatus.SUBMITTED);

      return res.json({
        success: true,
        stats: {
          totalBatches: store.batches.length,
          totalStudents,
          pendingSubmissionsCount: pendingWriting.length + pendingSpeaking.length,
          reviewedThisWeek: 4,
          averageScorePercentage: 88,
          recentSubmissions: [
            ...pendingWriting.map(s => {
              const u = store.users.find(usr => usr.id === s.userId);
              const a = store.assignments.find(asg => asg.id === s.assignmentId);
              return {
                id: s.id,
                studentName: u ? `${u.firstName} ${u.lastName}` : 'Student',
                assignmentTitle: a ? a.title : 'Assignment',
                submittedAt: s.submittedAt,
                type: 'WRITING'
              };
            })
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getTeacherBatches(req: Request, res: Response, next: NextFunction) {
  try {
    if (isDatabaseConnected) {
      const batches = await prisma.teacherBatch.findMany({
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, studentProfile: true }
              }
            }
          }
        }
      });
      return res.json({ success: true, batches });
    } else {
      const batches = store.batches.map(b => ({
        ...b,
        memberships: store.batchMemberships.filter(bm => bm.batchId === b.id).map(bm => ({
          ...bm,
          user: store.users.find(u => u.id === bm.userId)
        }))
      }));
      return res.json({ success: true, batches });
    }
  } catch (error) {
    next(error);
  }
}

export async function getTeacherSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    if (isDatabaseConnected) {
      const [writing, speaking] = await Promise.all([
        prisma.assignmentSubmission.findMany({
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: true
          },
          orderBy: { submittedAt: 'desc' }
        }),
        prisma.speakingAttempt.findMany({
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: true
          },
          orderBy: { submittedAt: 'desc' }
        })
      ]);

      return res.json({ success: true, writing, speaking });
    } else {
      const writing = store.submissions.map(s => ({
        ...s,
        user: store.users.find(u => u.id === s.userId),
        assignment: store.assignments.find(a => a.id === s.assignmentId)
      }));

      const speaking = store.speakingAttempts.map(sa => ({
        ...sa,
        user: store.users.find(u => u.id === sa.userId),
        prompt: store.speakingPrompts.find(p => p.id === sa.promptId)
      }));

      return res.json({ success: true, writing, speaking });
    }
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, level, dueDate, maxPoints = 100, instructions, rubricCriteria } = req.body;

    if (isDatabaseConnected) {
      const assignment = await prisma.assignment.create({
        data: {
          teacherId: req.user?.teacherProfile?.id || req.user!.id,
          title,
          description,
          level,
          dueDate: new Date(dueDate),
          maxPoints,
          instructions,
          rubricCriteria: rubricCriteria || []
        }
      });
      return res.status(201).json({ success: true, assignment });
    } else {
      const assignment = {
        id: `assign-${Date.now()}`,
        teacherId: 'profile-teacher-1',
        title,
        description,
        level,
        dueDate,
        maxPoints,
        instructions,
        rubricCriteria: rubricCriteria || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.assignments.push(assignment);
      return res.status(201).json({ success: true, assignment });
    }
  } catch (error) {
    next(error);
  }
}

export async function gradeWritingSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const { submissionId } = req.params;
    const { score, teacherFeedback, rubricScores } = req.body;

    if (isDatabaseConnected) {
      const submission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score,
          teacherFeedback,
          rubricScores,
          status: SubmissionStatus.GRADED,
          evaluatedAt: new Date()
        }
      });

      // Send student notification
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          title: 'Aufgabe korrigiert / Assignment graded',
          message: `Your teacher evaluated your submission with a score of ${score} points.`,
          type: 'FEEDBACK',
          linkUrl: '/student/assignments'
        }
      });

      return res.json({ success: true, message: 'Submission evaluated successfully.', submission });
    } else {
      const sub = store.submissions.find(s => s.id === submissionId);
      if (!sub) return next(new AppError('Submission not found.', 404));

      sub.score = score;
      sub.teacherFeedback = teacherFeedback;
      sub.rubricScores = rubricScores;
      sub.status = SubmissionStatus.GRADED;
      sub.evaluatedAt = new Date().toISOString();

      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId: sub.userId,
        title: 'Aufgabe korrigiert / Assignment graded',
        message: `Your teacher evaluated your submission with a score of ${score} points.`,
        type: 'FEEDBACK',
        linkUrl: '/student/assignments',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return res.json({ success: true, message: 'Submission evaluated successfully.', submission: sub });
    }
  } catch (error) {
    next(error);
  }
}

export async function gradeSpeakingAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const { attemptId } = req.params;
    const { score, teacherFeedback, rubricScores } = req.body;

    if (isDatabaseConnected) {
      const attempt = await prisma.speakingAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          teacherFeedback,
          rubricScores,
          status: SubmissionStatus.GRADED,
          evaluatedAt: new Date(),
          teacherId: req.user?.teacherProfile?.id || null
        }
      });

      await prisma.notification.create({
        data: {
          userId: attempt.userId,
          title: 'Sprechübung bewertet / Speaking evaluated',
          message: `Your teacher has provided feedback on your speaking submission (Score: ${score}/100).`,
          type: 'FEEDBACK',
          linkUrl: '/student/speaking'
        }
      });

      return res.json({ success: true, message: 'Speaking attempt evaluated successfully.', attempt });
    } else {
      const att = store.speakingAttempts.find(a => a.id === attemptId);
      if (!att) return next(new AppError('Speaking attempt not found.', 404));

      att.score = score;
      att.teacherFeedback = teacherFeedback;
      att.rubricScores = rubricScores;
      att.status = SubmissionStatus.GRADED;
      att.evaluatedAt = new Date().toISOString();

      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId: att.userId,
        title: 'Sprechübung bewertet / Speaking evaluated',
        message: `Your teacher has provided feedback on your speaking submission (Score: ${score}/100).`,
        type: 'FEEDBACK',
        linkUrl: '/student/speaking',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return res.json({ success: true, message: 'Speaking attempt evaluated successfully.', attempt: att });
    }
  } catch (error) {
    next(error);
  }
}
