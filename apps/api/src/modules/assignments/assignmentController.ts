import { Request, Response, NextFunction } from 'express';
import { SubmissionStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (isDatabaseConnected) {
      const assignments = await prisma.assignment.findMany({
        orderBy: { dueDate: 'asc' },
        include: {
          submissions: {
            where: { userId: req.user.id }
          }
        }
      });

      const formatted = assignments.map(a => ({
        ...a,
        submission: a.submissions[0] || null
      }));

      return res.json({ success: true, assignments: formatted });
    } else {
      const formatted = store.assignments.map(a => {
        const sub = store.submissions.find(s => s.assignmentId === a.id && s.userId === req.user?.id);
        return { ...a, submission: sub || null };
      });

      return res.json({ success: true, assignments: formatted });
    }
  } catch (error) {
    next(error);
  }
}

export async function getAssignmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { assignmentId } = req.params;

    if (isDatabaseConnected) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          teacher: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          submissions: req.user ? {
            where: { userId: req.user.id }
          } : undefined
        }
      });

      if (!assignment) {
        return next(new AppError('Assignment not found.', 404));
      }

      return res.json({
        success: true,
        assignment: {
          ...assignment,
          submission: (assignment as any).submissions?.[0] || null
        }
      });
    } else {
      const assignment = store.assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        return next(new AppError('Assignment not found.', 404));
      }

      const submission = req.user ? store.submissions.find(s => s.assignmentId === assignment.id && s.userId === req.user?.id) : null;
      return res.json({ success: true, assignment: { ...assignment, submission } });
    }
  } catch (error) {
    next(error);
  }
}

export async function submitAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { assignmentId } = req.params;
    const { content, isDraft = false } = req.body;

    const status = isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED;

    if (isDatabaseConnected) {
      const existing = await prisma.assignmentSubmission.findFirst({
        where: { assignmentId, userId: req.user.id }
      });

      let submission;
      if (existing) {
        submission = await prisma.assignmentSubmission.update({
          where: { id: existing.id },
          data: {
            content,
            status,
            submittedAt: new Date()
          }
        });
      } else {
        submission = await prisma.assignmentSubmission.create({
          data: {
            assignmentId,
            userId: req.user.id,
            content,
            status,
            submittedAt: new Date()
          }
        });
      }

      return res.json({
        success: true,
        message: isDraft ? 'Draft saved successfully.' : 'Assignment submitted successfully for teacher grading!',
        submission
      });
    } else {
      let submission = store.submissions.find(s => s.assignmentId === assignmentId && s.userId === req.user?.id);
      if (submission) {
        submission.content = content;
        submission.status = status;
        submission.updatedAt = new Date().toISOString();
      } else {
        submission = {
          id: `sub-${Date.now()}`,
          assignmentId,
          userId: req.user.id,
          content,
          status,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        store.submissions.push(submission);
      }

      return res.json({
        success: true,
        message: isDraft ? 'Draft saved successfully.' : 'Assignment submitted successfully for teacher grading!',
        submission
      });
    }
  } catch (error) {
    next(error);
  }
}
