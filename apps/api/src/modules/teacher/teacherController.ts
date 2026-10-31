import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { SubmissionStatus, UserRole } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';
import { driveFileUrl, isGoogleDriveConfigured, trashDriveFile } from '../../services/googleDrive.js';
import { discardTemporaryUpload, persistUploadedFile, removeStoredFile } from '../../services/uploadStorage.js';

/**
 * Resolves the active teacher's TeacherProfile ID
 */
function resolveTeacherProfileId(req: Request): string {
  if (req.user?.teacherProfile?.id) return req.user.teacherProfile.id;
  if (req.user?.id === 'user-teacher-1') return 'profile-teacher-1';
  if (req.user?.id === 'user-teacher-2') return 'profile-teacher-2';
  const found = store.teacherProfiles.find(tp => tp.userId === req.user?.id);
  if (found) return found.id;
  return `profile-${req.user?.id}`;
}

/**
 * Resolves the batch IDs assigned strictly to this teacher
 */
async function getAssignedBatchIds(teacherProfileId: string, userId: string): Promise<string[]> {
  if (isDatabaseConnected) {
    const assignments = await prisma.teacherBatchAssignment.findMany({
      where: { teacherId: teacherProfileId },
      select: { batchId: true }
    });
    return assignments.map(a => a.batchId);
  } else {
    return store.teacherBatchAssignments
      .filter(tba => tba.teacherId === teacherProfileId || tba.teacherId === `profile-${userId}`)
      .map(tba => tba.batchId);
  }
}

function formatDriveAssetSize(sizeBytes: bigint | number) {
  return `${(Number(sizeBytes) / (1024 * 1024)).toFixed(1)} MB`;
}

function driveAssetToLecture(asset: any) {
  return {
    id: asset.id,
    teacherId: asset.teacherProfileId,
    batchId: asset.batchId,
    title: asset.title,
    description: asset.description || '',
    level: asset.level,
    videoUrl: driveFileUrl(asset.driveFileId),
    durationMinutes: asset.durationMinutes || 45,
    scheduledFor: asset.scheduledFor || asset.createdAt,
    isLive: false,
    meetingUrl: asset.meetingUrl || '',
    fileSize: formatDriveAssetSize(asset.sizeBytes),
    originalFilename: asset.fileName,
    status: 'PUBLISHED',
    createdAt: asset.createdAt,
    batch: asset.batch
  };
}

function driveAssetToMaterial(asset: any) {
  return {
    id: asset.id,
    teacherId: asset.teacherProfileId,
    batchId: asset.batchId,
    title: asset.title,
    category: asset.category || 'WORKSHEET',
    description: asset.description || '',
    fileUrl: driveFileUrl(asset.driveFileId),
    fileType: path.extname(asset.fileName).replace('.', '').toUpperCase() || 'FILE',
    fileSize: formatDriveAssetSize(asset.sizeBytes),
    level: asset.level,
    createdAt: asset.createdAt,
    batch: asset.batch
  };
}

/**
 * 1. TEACHER DASHBOARD
 * Strictly isolated: Only aggregates statistics for this teacher's assigned batches and students.
 */
export async function getTeacherDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user.id);

    if (isDatabaseConnected) {
      const batches = await prisma.teacherBatch.findMany({
        where: { id: { in: assignedBatchIds } },
        include: {
          memberships: { include: { user: true } }
        }
      });

      const studentUserIds = Array.from(
        new Set(batches.flatMap(b => b.memberships.map(m => m.userId)))
      );

      const [pendingSubmissions, pendingSpeaking, evaluatedSubmissions] = await Promise.all([
        prisma.assignmentSubmission.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus.SUBMITTED
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: { select: { id: true, title: true, maxPoints: true } }
          }
        }),
        prisma.speakingAttempt.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus.SUBMITTED
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: { select: { id: true, title: true, level: true } }
          }
        }),
        prisma.assignmentSubmission.findMany({
          where: {
            userId: { in: studentUserIds },
            status: SubmissionStatus.GRADED
          },
          select: { score: true }
        })
      ]);

      const avgScore = evaluatedSubmissions.length > 0
        ? Math.round(evaluatedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / evaluatedSubmissions.length)
        : 88;

      return res.json({
        success: true,
        stats: {
          totalBatches: batches.length,
          totalStudents: studentUserIds.length,
          pendingSubmissionsCount: pendingSubmissions.length + pendingSpeaking.length,
          reviewedThisWeek: evaluatedSubmissions.length,
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
      const myBatches = store.batches.filter(b => assignedBatchIds.includes(b.id));
      const myMemberships = store.batchMemberships.filter(bm => assignedBatchIds.includes(bm.batchId));
      const studentUserIds = Array.from(new Set(myMemberships.map(bm => bm.userId)));

      const pendingWriting = store.submissions.filter(
        s => studentUserIds.includes(s.userId) && s.status === SubmissionStatus.SUBMITTED
      );
      const pendingSpeaking = store.speakingAttempts.filter(
        sa => studentUserIds.includes(sa.userId) && sa.status === SubmissionStatus.SUBMITTED
      );

      return res.json({
        success: true,
        stats: {
          totalBatches: myBatches.length,
          totalStudents: studentUserIds.length,
          pendingSubmissionsCount: pendingWriting.length + pendingSpeaking.length,
          reviewedThisWeek: 4,
          averageScorePercentage: 91,
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

/**
 * 2. TEACHER BATCHES
 * Strictly isolated: Returns ONLY batches assigned to this teacher.
 */
export async function getTeacherBatches(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    if (isDatabaseConnected) {
      const batches = await prisma.teacherBatch.findMany({
        where: { id: { in: assignedBatchIds } },
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true, studentProfile: true }
              }
            }
          }
        }
      });
      return res.json({ success: true, batches });
    } else {
      const batches = store.batches
        .filter(b => assignedBatchIds.includes(b.id))
        .map(b => ({
          ...b,
          memberships: store.batchMemberships
            .filter(bm => bm.batchId === b.id)
            .map(bm => ({
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

/**
 * 3. TEACHER STUDENTS
 * Strictly isolated: Returns ONLY students enrolled in this teacher's batches.
 */
export async function getTeacherStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    if (isDatabaseConnected) {
      const memberships = await prisma.batchMembership.findMany({
        where: { batchId: { in: assignedBatchIds } },
        include: {
          batch: true,
          user: {
            include: {
              studentProfile: true,
              lessonProgresses: { where: { isCompleted: true } }
            }
          }
        }
      });

      const students = memberships.map((m: any) => ({
        id: m.user?.id || m.userId,
        firstName: m.user?.firstName || 'Student',
        lastName: m.user?.lastName || '',
        email: m.user?.email || '',
        phone: m.user?.phone || '',
        batchId: m.batch?.id || m.batchId,
        batchName: m.batch?.name || 'Assigned Batch',
        batchLevel: m.batch?.level || 'A1',
        status: m.status,
        joinedAt: m.joinedAt,
        currentLevel: m.user?.studentProfile?.currentLevel || 'A1',
        streakCount: m.user?.studentProfile?.streakCount || 0,
        completedLessonsCount: m.user?.lessonProgresses?.length || 0
      }));

      return res.json({ success: true, students });
    } else {
      const myMemberships = store.batchMemberships.filter(bm => assignedBatchIds.includes(bm.batchId));
      const students = myMemberships.map(bm => {
        const user = store.users.find(u => u.id === bm.userId);
        const batch = store.batches.find(b => b.id === bm.batchId);
        const profile = store.studentProfiles.find(sp => sp.userId === bm.userId);
        const progress = store.lessonProgress.filter(lp => lp.userId === bm.userId && lp.isCompleted);

        return {
          id: user?.id || bm.userId,
          firstName: user?.firstName || 'Student',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          batchId: batch?.id || bm.batchId,
          batchName: batch?.name || 'Assigned Batch',
          batchLevel: batch?.level || 'A1',
          status: bm.status,
          joinedAt: bm.joinedAt,
          currentLevel: profile?.currentLevel || 'A1',
          streakCount: profile?.streakCount || 7,
          completedLessonsCount: progress.length
        };
      });

      return res.json({ success: true, students });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 4. TEACHER SUBMISSIONS (WRITING & SPEAKING)
 * Strictly isolated: Only returns submissions from students enrolled in this teacher's batches.
 */
export async function getTeacherSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    if (isDatabaseConnected) {
      const myMemberships = await prisma.batchMembership.findMany({
        where: { batchId: { in: assignedBatchIds } },
        select: { userId: true }
      });
      const studentUserIds = myMemberships.map(m => m.userId);

      const [writing, speaking] = await Promise.all([
        prisma.assignmentSubmission.findMany({
          where: { userId: { in: studentUserIds } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignment: true
          },
          orderBy: { submittedAt: 'desc' }
        }),
        prisma.speakingAttempt.findMany({
          where: { userId: { in: studentUserIds } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            prompt: true
          },
          orderBy: { submittedAt: 'desc' }
        })
      ]);

      return res.json({ success: true, writing, speaking });
    } else {
      const myMemberships = store.batchMemberships.filter(bm => assignedBatchIds.includes(bm.batchId));
      const studentUserIds = myMemberships.map(bm => bm.userId);

      const writing = store.submissions
        .filter(s => studentUserIds.includes(s.userId))
        .map(s => ({
          ...s,
          user: store.users.find(u => u.id === s.userId),
          assignment: store.assignments.find(a => a.id === s.assignmentId)
        }));

      const speaking = store.speakingAttempts
        .filter(sa => studentUserIds.includes(sa.userId))
        .map(sa => ({
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

/**
 * 5. CREATE ASSIGNMENT
 */
export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, level, dueDate, maxPoints = 100, instructions, rubricCriteria, batchId } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (isDatabaseConnected) {
      const assignment = await prisma.assignment.create({
        data: {
          teacherId: teacherProfileId,
          batchId: batchId || null,
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
        teacherId: teacherProfileId,
        batchId: batchId || 'batch-1',
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

/**
 * 6. GRADE WRITING SUBMISSION
 */
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

/**
 * 7. GRADE SPEAKING ATTEMPT
 */
export async function gradeSpeakingAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const { attemptId } = req.params;
    const { score, teacherFeedback, rubricScores } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (isDatabaseConnected) {
      const attempt = await prisma.speakingAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          teacherFeedback,
          rubricScores,
          status: SubmissionStatus.GRADED,
          evaluatedAt: new Date(),
          teacherId: teacherProfileId
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
      att.teacherId = teacherProfileId;

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

/**
 * 8. TEACHER LECTURES & LIVE SESSIONS
 * Teacher can upload recorded lectures or schedule live classes for their batches.
 */
export async function getTeacherLectures(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    if (isDatabaseConnected) {
      const [stored, local] = await Promise.all([
        prisma.driveAsset.findMany({
          where: {
            type: 'TEACHER_LECTURE',
            OR: [{ batchId: { in: assignedBatchIds } }, { teacherProfileId }]
          },
          include: { batch: true },
          orderBy: { createdAt: 'desc' }
        }),
        Promise.resolve(store.teacherLectures.filter(l =>
          (assignedBatchIds.includes(l.batchId) || l.teacherId === teacherProfileId) && !l.videoUrl?.startsWith('/api/v1/files/')
        ).map(l => ({ ...l, batch: store.batches.find(b => b.id === l.batchId) })))
      ]);
      return res.json({ success: true, lectures: [...stored.map(driveAssetToLecture), ...local] });
    }

    const lectures = store.teacherLectures
      .filter(l => assignedBatchIds.includes(l.batchId) || l.teacherId === teacherProfileId)
      .map(l => ({
        ...l,
        batch: store.batches.find(b => b.id === l.batchId)
      }));

    return res.json({ success: true, lectures });
  } catch (error) {
    next(error);
  }
}

export async function uploadLectureVideo(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(new AppError('No video file provided for upload.', 400));
    }
    if (isGoogleDriveConfigured()) {
      await discardTemporaryUpload(req.file);
      return next(new AppError('Upload videos through the batch lecture form so each Drive file is linked to its lecture and access rules.', 400));
    }
    const upload = await persistUploadedFile(req.file);
    const sizeMb = (upload.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    return res.json({
      success: true,
      message: 'Video file uploaded successfully.',
      fileUrl: upload.fileUrl,
      fileName: upload.fileName,
      fileSize: sizeMb,
      mimeType: upload.mimeType
    });
  } catch (error) {
    next(error);
  }
}

export async function createTeacherLecture(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, level, durationMinutes = 45, scheduledFor, meetingUrl, batchId } = req.body;
    let videoUrl = req.body.videoUrl || '';
    let fileSize = req.body.fileSize;
    let originalFilename = req.body.originalFilename;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (!title || !batchId) {
      await discardTemporaryUpload(req.file);
      return next(new AppError('Lecture title and target batch are required.', 400));
    }

    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);
    if (req.user?.role !== UserRole.ADMIN && !assignedBatchIds.includes(batchId)) {
      await discardTemporaryUpload(req.file);
      return next(new AppError('You can only publish lectures to your assigned batches.', 403));
    }

    let storedUpload: Awaited<ReturnType<typeof persistUploadedFile>> | null = null;

    if (req.file) {
      storedUpload = await persistUploadedFile(req.file);
      videoUrl = storedUpload.fileUrl;
      fileSize = (storedUpload.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
      originalFilename = storedUpload.fileName;
    }

    const isLive = req.body.isLive === 'true' || req.body.isLive === true;

    if (isDatabaseConnected && storedUpload?.driveFileId) {
      let asset;
      try {
        asset = await prisma.driveAsset.create({
          data: {
            driveFileId: storedUpload.driveFileId,
            type: 'TEACHER_LECTURE',
            ownerId: req.user!.id,
            teacherProfileId,
            batchId,
            title,
            description: description || '',
            fileName: storedUpload.fileName,
            mimeType: storedUpload.mimeType,
            sizeBytes: BigInt(storedUpload.sizeBytes),
            level: level || 'A1',
            durationMinutes: Number(durationMinutes) || 45,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
            isLive,
            meetingUrl: meetingUrl || null
          },
          include: { batch: true }
        });
      } catch (error) {
        await trashDriveFile(storedUpload.driveFileId).catch(() => undefined);
        throw error;
      }
      return res.status(201).json({
        success: true,
        message: 'Lecture uploaded and saved to Google Drive.',
        lecture: driveAssetToLecture(asset)
      });
    }

    const newLecture = {
      id: `lec-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      description: description || '',
      level: level || 'A1',
      videoUrl: videoUrl || '',
      durationMinutes: Number(durationMinutes) || 45,
      scheduledFor: scheduledFor || new Date().toISOString(),
      isLive: Boolean(isLive),
      meetingUrl: meetingUrl || '',
      fileSize: fileSize || (req.file ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : undefined),
      originalFilename: originalFilename || (req.file ? req.file.originalname : undefined),
      status: 'PUBLISHED',
      createdAt: new Date().toISOString()
    };

    store.teacherLectures.unshift(newLecture);

    // Notify batch students of new lecture
    const batchMembers = store.batchMemberships.filter(bm => bm.batchId === batchId);
    batchMembers.forEach(bm => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: isLive ? 'Neue Live-Sitzung geplant' : 'Neue Video-Vorlesung verfügbar',
        message: `${newLecture.title} has been published by your instructor.`,
        type: 'INFO',
        linkUrl: '/student/materials',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return res.status(201).json({ success: true, message: 'Lecture created successfully.', lecture: newLecture });
  } catch (error) {
    next(error);
  }
}

export async function deleteTeacherLecture(req: Request, res: Response, next: NextFunction) {
  try {
    const { lectureId } = req.params;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (isDatabaseConnected) {
      const asset = await prisma.driveAsset.findFirst({
        where: {
          id: lectureId,
          type: 'TEACHER_LECTURE',
          ...(req.user?.role === UserRole.ADMIN ? {} : { teacherProfileId })
        }
      });
      if (!asset) return next(new AppError('Lecture not found or unauthorized to delete.', 404));
      await removeStoredFile(driveFileUrl(asset.driveFileId));
      await prisma.driveAsset.delete({ where: { id: asset.id } });
      return res.json({ success: true, message: 'Lecture deleted successfully.' });
    }

    const index = store.teacherLectures.findIndex(l => l.id === lectureId && (l.teacherId === teacherProfileId || req.user?.role === UserRole.ADMIN));
    if (index === -1) {
      return next(new AppError('Lecture not found or unauthorized to delete.', 404));
    }

    const [deleted] = store.teacherLectures.splice(index, 1);

    await removeStoredFile(deleted?.videoUrl);

    return res.json({ success: true, message: 'Lecture deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * 9. TEACHER STUDY MATERIALS & WORKSHEETS
 * Teacher can upload worksheets, grammar cheat sheets, and practice PDFs to their batches.
 */
export async function getTeacherMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    if (isDatabaseConnected) {
      const [stored, local] = await Promise.all([
        prisma.driveAsset.findMany({
          where: {
            type: 'TEACHER_MATERIAL',
            OR: [{ batchId: { in: assignedBatchIds } }, { teacherProfileId }]
          },
          include: { batch: true },
          orderBy: { createdAt: 'desc' }
        }),
        Promise.resolve(store.teacherMaterials.filter(m =>
          (assignedBatchIds.includes(m.batchId) || m.teacherId === teacherProfileId) && !m.fileUrl?.startsWith('/api/v1/files/')
        ).map(m => ({ ...m, batch: store.batches.find(b => b.id === m.batchId) })))
      ]);
      return res.json({ success: true, materials: [...stored.map(driveAssetToMaterial), ...local] });
    }

    const materials = store.teacherMaterials
      .filter(m => assignedBatchIds.includes(m.batchId) || m.teacherId === teacherProfileId)
      .map(m => ({
        ...m,
        batch: store.batches.find(b => b.id === m.batchId)
      }));

    return res.json({ success: true, materials });
  } catch (error) {
    next(error);
  }
}

export async function createTeacherMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, category, description, batchId, level } = req.body;
    let fileUrl = req.body.fileUrl || '';
    let fileType = req.body.fileType || 'PDF';
    let fileSize = req.body.fileSize || '1.0 MB';

    const teacherProfileId = resolveTeacherProfileId(req);
    if (!title || !batchId) {
      await discardTemporaryUpload(req.file);
      return next(new AppError('Material title and target batch are required.', 400));
    }
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);
    if (req.user?.role !== UserRole.ADMIN && !assignedBatchIds.includes(batchId)) {
      await discardTemporaryUpload(req.file);
      return next(new AppError('You can only publish materials to your assigned batches.', 403));
    }

    let storedUpload: Awaited<ReturnType<typeof persistUploadedFile>> | null = null;

    if (req.file) {
      storedUpload = await persistUploadedFile(req.file);
      fileUrl = storedUpload.fileUrl;
      fileSize = `${(storedUpload.sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
      const ext = path.extname(storedUpload.fileName).replace('.', '').toUpperCase();
      if (ext) fileType = ext;
    }

    if (isDatabaseConnected && storedUpload?.driveFileId) {
      let asset;
      try {
        asset = await prisma.driveAsset.create({
          data: {
            driveFileId: storedUpload.driveFileId,
            type: 'TEACHER_MATERIAL',
            ownerId: req.user!.id,
            teacherProfileId,
            batchId,
            title,
            description: description || '',
            fileName: storedUpload.fileName,
            mimeType: storedUpload.mimeType,
            sizeBytes: BigInt(storedUpload.sizeBytes),
            level: level || 'A1',
            category: category || 'WORKSHEET'
          },
          include: { batch: true }
        });
      } catch (error) {
        await trashDriveFile(storedUpload.driveFileId).catch(() => undefined);
        throw error;
      }
      return res.status(201).json({
        success: true,
        message: 'Material uploaded and saved to Google Drive.',
        material: driveAssetToMaterial(asset)
      });
    }

    const newMaterial = {
      id: `mat-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      category: category || 'WORKSHEET',
      description: description || '',
      fileUrl: fileUrl || '/uploads/materials/sample_doc.pdf',
      fileType: fileType.toUpperCase(),
      fileSize,
      level: level || 'A1',
      createdAt: new Date().toISOString()
    };

    store.teacherMaterials.unshift(newMaterial);

    // Notify batch students of new study material
    const batchMembers = store.batchMemberships.filter(bm => bm.batchId === batchId);
    batchMembers.forEach(bm => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: 'Neues Unterrichtsmaterial verfügbar',
        message: `${newMaterial.title} has been uploaded to your course files.`,
        type: 'INFO',
        linkUrl: '/student/materials',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return res.status(201).json({ success: true, message: 'Material uploaded successfully.', material: newMaterial });
  } catch (error) {
    next(error);
  }
}

export async function deleteTeacherMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const { materialId } = req.params;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (isDatabaseConnected) {
      const asset = await prisma.driveAsset.findFirst({
        where: {
          id: materialId,
          type: 'TEACHER_MATERIAL',
          ...(req.user?.role === UserRole.ADMIN ? {} : { teacherProfileId })
        }
      });
      if (!asset) return next(new AppError('Material not found or unauthorized to delete.', 404));
      await removeStoredFile(driveFileUrl(asset.driveFileId));
      await prisma.driveAsset.delete({ where: { id: asset.id } });
      return res.json({ success: true, message: 'Material deleted successfully.' });
    }

    const index = store.teacherMaterials.findIndex(m => m.id === materialId && (m.teacherId === teacherProfileId || req.user?.role === UserRole.ADMIN));
    if (index === -1) {
      return next(new AppError('Material not found or unauthorized to delete.', 404));
    }

    const [deleted] = store.teacherMaterials.splice(index, 1);

    await removeStoredFile(deleted?.fileUrl);

    return res.json({ success: true, message: 'Material deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * 10. BATCH NOTICEBOARD ANNOUNCEMENTS
 */
export async function getTeacherAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = resolveTeacherProfileId(req);
    const assignedBatchIds = await getAssignedBatchIds(teacherProfileId, req.user!.id);

    const announcements = store.batchAnnouncements
      .filter(a => assignedBatchIds.includes(a.batchId) || a.teacherId === teacherProfileId)
      .map(a => ({
        ...a,
        batch: store.batches.find(b => b.id === a.batchId)
      }));

    return res.json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
}

export async function createBatchAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, batchId } = req.body;
    const teacherProfileId = resolveTeacherProfileId(req);

    if (!title || !content || !batchId) {
      return next(new AppError('Title, content, and batchId are required.', 400));
    }

    const announcement = {
      id: `anc-${Date.now()}`,
      teacherId: teacherProfileId,
      batchId,
      title,
      content,
      createdAt: new Date().toISOString()
    };

    store.batchAnnouncements.unshift(announcement);

    // Send notifications to all batch students
    const batchMembers = store.batchMemberships.filter(bm => bm.batchId === batchId);
    batchMembers.forEach(bm => {
      store.notifications.push({
        id: `notif-${Date.now()}-${bm.userId}`,
        userId: bm.userId,
        title: `Mitteilung: ${title}`,
        message: content.substring(0, 120),
        type: 'INFO',
        linkUrl: '/student/materials',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return res.status(201).json({ success: true, message: 'Announcement posted.', announcement });
  } catch (error) {
    next(error);
  }
}

/**
 * 11. ENROLL STUDENT INTO TEACHER'S BATCH
 */
export async function enrollStudentInBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { batchId } = req.params;
    const { studentEmail } = req.body;

    const student = store.users.find(u => u.email.toLowerCase() === String(studentEmail).toLowerCase().trim());
    if (!student) {
      return next(new AppError('Student with this email address does not exist.', 404));
    }

    const alreadyInBatch = store.batchMemberships.some(bm => bm.batchId === batchId && bm.userId === student.id);
    if (alreadyInBatch) {
      return next(new AppError('Student is already enrolled in this batch.', 400));
    }

    const newMembership = {
      id: `bm-${Date.now()}`,
      batchId,
      userId: student.id,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString()
    };
    store.batchMemberships.push(newMembership);

    return res.status(201).json({ success: true, message: `${student.firstName} ${student.lastName} enrolled successfully.`, membership: newMembership });
  } catch (error) {
    next(error);
  }
}

export async function getTeacherSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({
      success: true,
      upcomingSessions: [
        {
          id: 'sess-1',
          studentName: 'Jason K',
          topic: 'A1 Phonetics & Pronunciation Coaching',
          time: '9:30 AM',
          date: 'Today',
          status: 'ACTIVE',
          meetingUrl: 'https://meet.google.com/dw-a1-live'
        },
        {
          id: 'sess-2',
          studentName: 'Enoch',
          topic: 'B1 Dativ vs Akkusativ Mastery',
          time: '4:50 PM',
          date: 'Today',
          status: 'ACTIVE',
          meetingUrl: 'https://meet.google.com/dw-b1-live'
        },
        {
          id: 'sess-3',
          studentName: 'Mia G',
          topic: 'A2 Goethe Sprechen Preparation',
          time: '7:00 PM',
          date: 'Today',
          status: 'ACTIVE',
          meetingUrl: 'https://meet.google.com/dw-a2-live'
        }
      ],
      cancelledSessions: [],
      stats: {
        activeStudents: 4,
        upcomingCount: 4,
        taughtHoursMonth: 5
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createTeacherLessonReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentName, lessonTopic, rating, notes } = req.body;
    const report = {
      id: `rep-${Date.now()}`,
      teacherId: resolveTeacherProfileId(req),
      studentName: studentName || 'Elena Rostova',
      lessonTopic: lessonTopic || 'Alltagskommunikation A1',
      date: new Date().toISOString(),
      rating: Number(rating) || 5,
      notes: notes || 'Sehr gute Aussprache und Konzentration im Unterricht.'
    };
    store.lessonReports.push(report);
    return res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

export async function getTeacherAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({
      success: true,
      attendance: store.attendance || []
    });
  } catch (error) {
    next(error);
  }
}

export async function recordTeacherAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { batchId, date, records } = req.body;
    const batch = store.batches.find(b => b.id === batchId) || store.batches[0];
    const newEntry = {
      id: `att-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.name,
      date: date || new Date().toISOString().split('T')[0],
      totalEnrolled: Array.isArray(records) ? records.length : 15,
      presentCount: Array.isArray(records) ? records.filter((r: any) => r.status === 'PRESENT').length : 14,
      attendanceRate: 95,
      students: records || []
    };
    store.attendance.push(newEntry);
    return res.json({ success: true, attendance: newEntry });
  } catch (error) {
    next(error);
  }
}
