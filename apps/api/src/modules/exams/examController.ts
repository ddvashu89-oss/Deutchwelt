import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { ExamAttemptStatus } from '@prisma/client';
import { GermanLevel, PublicationStatus, UserRole } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

const SECTIONS = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'LANGUAGE_USE'] as const;
const QUESTION_TYPES = ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'WRITING', 'SPEAKING'] as const;
type ExamQuestion = {
  id: string;
  section: typeof SECTIONS[number];
  type: typeof QUESTION_TYPES[number];
  prompt: string;
  instructions?: string;
  passage?: string;
  audioUrl?: string;
  options?: string[];
  answerKey?: string[];
  points: number;
  rubric?: string;
};

function requireDatabase() {
  if (!isDatabaseConnected) throw new AppError('The exam system is unavailable while the database is disconnected.', 503);
}

function requestUser(req: Request) {
  if (!req.user) throw new AppError('Please sign in to access exams.', 401);
  return req.user;
}

async function teacherProfile(req: Request) {
  requireDatabase();
  const user = requestUser(req);
  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new AppError('A teacher profile is required to manage exams.', 403);
  return profile.id;
}

async function assignedBatchIds(profileId: string) {
  const assignments = await prisma.teacherBatchAssignment.findMany({ where: { teacherId: profileId }, select: { batchId: true } });
  return assignments.map(item => item.batchId);
}

function asQuestions(value: unknown, strict = false): ExamQuestion[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) throw new AppError('Add between 1 and 200 exam questions.', 400);
  return value.map((raw: any, index) => {
    const section = String(raw.section || '').toUpperCase();
    const type = String(raw.type || '').toUpperCase();
    const prompt = typeof raw.prompt === 'string' ? raw.prompt.trim() : '';
    const points = Number(raw.points);
    const options = Array.isArray(raw.options) ? raw.options.map((option: unknown) => String(option).trim()).filter(Boolean) : [];
    const answerKey = Array.isArray(raw.answerKey) ? raw.answerKey.map((answer: unknown) => String(answer).trim()).filter(Boolean) : typeof raw.answerKey === 'string' && raw.answerKey.trim() ? [raw.answerKey.trim()] : [];
    if (!SECTIONS.includes(section as any)) throw new AppError(`Question ${index + 1}: choose a valid exam section.`, 400);
    if (!QUESTION_TYPES.includes(type as any)) throw new AppError(`Question ${index + 1}: choose a supported question type.`, 400);
    if (prompt.length < 2 || prompt.length > 4000) throw new AppError(`Question ${index + 1}: add a prompt (max 4,000 characters).`, 400);
    if (!Number.isInteger(points) || points < 1 || points > 100) throw new AppError(`Question ${index + 1}: points must be between 1 and 100.`, 400);
    if (type === 'MULTIPLE_CHOICE' && (options.length < 2 || options.length > 8)) throw new AppError(`Question ${index + 1}: multiple choice needs 2–8 options.`, 400);
    if (strict && ['MULTIPLE_CHOICE', 'SHORT_ANSWER'].includes(type) && answerKey.length === 0) throw new AppError(`Question ${index + 1}: add the correct answer before publishing.`, 400);
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : randomUUID(),
      section: section as ExamQuestion['section'],
      type: type as ExamQuestion['type'],
      prompt,
      instructions: typeof raw.instructions === 'string' ? raw.instructions.slice(0, 2000) : undefined,
      passage: typeof raw.passage === 'string' ? raw.passage.slice(0, 12000) : undefined,
      audioUrl: typeof raw.audioUrl === 'string' ? raw.audioUrl.slice(0, 2000) : undefined,
      options: type === 'MULTIPLE_CHOICE' ? options : undefined,
      answerKey: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'].includes(type) ? answerKey : undefined,
      points,
      rubric: typeof raw.rubric === 'string' ? raw.rubric.slice(0, 2000) : undefined
    };
  });
}

function safeQuestions(questions: ExamQuestion[]) {
  return questions.map(({ answerKey: _answerKey, rubric: _rubric, ...question }) => question);
}

function maxPoints(questions: ExamQuestion[]) {
  return questions.reduce((sum, question) => sum + Number(question.points || 0), 0);
}

function comparable(value: unknown) {
  return String(value ?? '').trim().normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase();
}

function gradeObjective(questions: ExamQuestion[], answers: Record<string, unknown>) {
  return questions.reduce((sum, question) => {
    if (!['MULTIPLE_CHOICE', 'SHORT_ANSWER'].includes(question.type)) return sum;
    const submitted = comparable(answers[question.id]);
    const correct = (question.answerKey || []).some(answer => comparable(answer) === submitted);
    return sum + (correct ? question.points : 0);
  }, 0);
}

async function finishAttempt(attemptId: string, exam: any) {
  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.status !== ExamAttemptStatus.IN_PROGRESS) return attempt;
  const questions = asQuestions(exam.questions);
  const answers = (attempt.answers || {}) as Record<string, unknown>;
  const score = gradeObjective(questions, answers);
  const subjectiveAnswered = questions.some(question => ['WRITING', 'SPEAKING'].includes(question.type) && String(answers[question.id] || '').trim());
  const total = maxPoints(questions);
  const percent = total ? score / total * 100 : 0;
  return prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: subjectiveAnswered ? ExamAttemptStatus.NEEDS_REVIEW : ExamAttemptStatus.GRADED,
      submittedAt: new Date(),
      score,
      maxScore: total,
      percentage: percent,
      passed: subjectiveAnswered ? null : percent >= exam.passPercent
    }
  });
}

function availability(exam: any, now = new Date()) {
  return (!exam.opensAt || new Date(exam.opensAt) <= now) && (!exam.closesAt || new Date(exam.closesAt) > now);
}

async function studentCanAccessExam(examId: string, userId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { batch: { select: { id: true, name: true } } } });
  if (!exam || exam.status !== PublicationStatus.PUBLISHED) throw new AppError('Exam not found.', 404);
  const membership = await prisma.batchMembership.findFirst({ where: { batchId: exam.batchId, userId, status: 'ACTIVE' }, select: { id: true } });
  if (!membership) throw new AppError('This exam is only available to students in its assigned batch.', 403);
  return exam;
}

export async function getStudentExams(req: Request, res: Response, next: NextFunction) {
  try {
    requireDatabase();
    const user = requestUser(req);
    if (user.role !== UserRole.STUDENT) throw new AppError('Student access is required.', 403);
    const memberships = await prisma.batchMembership.findMany({ where: { userId: user.id, status: 'ACTIVE' }, select: { batchId: true } });
    const exams = await prisma.exam.findMany({
      where: { status: PublicationStatus.PUBLISHED, batchId: { in: memberships.map(item => item.batchId) } },
      orderBy: [{ opensAt: 'asc' }, { createdAt: 'desc' }],
      include: { batch: { select: { id: true, name: true } }, attempts: { where: { userId: user.id }, orderBy: { attemptNumber: 'desc' }, select: { id: true, attemptNumber: true, status: true, startedAt: true, expiresAt: true, submittedAt: true, percentage: true, passed: true } } }
    });
    const now = new Date();
    return res.json({ success: true, exams: exams.map(({ questions, ...exam }) => ({
      ...exam,
      questionCount: Array.isArray(questions) ? questions.length : 0,
      available: availability(exam, now),
      latestAttempt: exam.attempts[0] || null,
      attemptsUsed: exam.attempts.length,
      attempts: undefined
    })) });
  } catch (error) { next(error); }
}

export async function startExam(req: Request, res: Response, next: NextFunction) {
  try {
    requireDatabase();
    const user = requestUser(req);
    const exam = await studentCanAccessExam(req.params.examId, user.id);
    const now = new Date();
    if (!availability(exam, now)) throw new AppError('This exam is outside its scheduled availability window.', 403);
    const existing = await prisma.examAttempt.findFirst({ where: { examId: exam.id, userId: user.id, status: ExamAttemptStatus.IN_PROGRESS }, orderBy: { attemptNumber: 'desc' } });
    if (existing && existing.expiresAt > now) return res.json({ success: true, attempt: existing, resumed: true });
    if (existing) await finishAttempt(existing.id, exam);
    const attempts = await prisma.examAttempt.count({ where: { examId: exam.id, userId: user.id } });
    if (attempts >= exam.maxAttempts) throw new AppError('You have used all attempts for this exam.', 409);
    const expiresAt = new Date(now.getTime() + exam.durationMinutes * 60_000);
    if (exam.closesAt && expiresAt > exam.closesAt) expiresAt.setTime(new Date(exam.closesAt).getTime());
    const attempt = await prisma.examAttempt.create({ data: { examId: exam.id, userId: user.id, attemptNumber: attempts + 1, expiresAt, maxScore: maxPoints(asQuestions(exam.questions)), answers: {} } });
    return res.status(201).json({ success: true, attempt, resumed: false });
  } catch (error) { next(error); }
}

export async function getExamAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    requireDatabase();
    const user = requestUser(req);
    let attempt = await prisma.examAttempt.findUnique({ where: { id: req.params.attemptId }, include: { exam: { include: { batch: { select: { id: true, name: true } } } } } });
    if (!attempt || attempt.userId !== user.id) throw new AppError('Exam attempt not found.', 404);
    if (attempt.status === ExamAttemptStatus.IN_PROGRESS && attempt.expiresAt <= new Date()) {
      await finishAttempt(attempt.id, attempt.exam);
      attempt = await prisma.examAttempt.findUnique({ where: { id: attempt.id }, include: { exam: { include: { batch: { select: { id: true, name: true } } } } } }) as any;
    }
    const { answerKey: _hidden, ...exam } = attempt.exam as any;
    return res.json({ success: true, attempt, exam: { ...exam, questions: safeQuestions(asQuestions(exam.questions)) } });
  } catch (error) { next(error); }
}

export async function saveExamAnswers(req: Request, res: Response, next: NextFunction) {
  try {
    requireDatabase();
    const user = requestUser(req);
    const attempt = await prisma.examAttempt.findUnique({ where: { id: req.params.attemptId }, include: { exam: true } });
    if (!attempt || attempt.userId !== user.id) throw new AppError('Exam attempt not found.', 404);
    if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) throw new AppError('This exam has already been submitted.', 409);
    if (attempt.expiresAt <= new Date()) {
      await finishAttempt(attempt.id, attempt.exam);
      throw new AppError('The exam time has ended. Your saved answers have been submitted.', 409);
    }
    const payload = req.body?.answers;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new AppError('Answers must be provided as a question-to-response map.', 400);
    const questions = asQuestions(attempt.exam.questions);
    const ids = new Set(questions.map(question => question.id));
    const previous = (attempt.answers || {}) as Record<string, string>;
    const next = { ...previous };
    for (const [id, raw] of Object.entries(payload)) {
      if (!ids.has(id)) throw new AppError('An answer references a question outside this exam.', 400);
      if (typeof raw !== 'string' || raw.length > 12000) throw new AppError('Each answer must be text under 12,000 characters.', 400);
      next[id] = raw;
    }
    const updated = await prisma.examAttempt.update({ where: { id: attempt.id }, data: { answers: next } });
    return res.json({ success: true, savedAt: new Date(), attempt: updated });
  } catch (error) { next(error); }
}

export async function submitExam(req: Request, res: Response, next: NextFunction) {
  try {
    requireDatabase();
    const user = requestUser(req);
    const attempt = await prisma.examAttempt.findUnique({ where: { id: req.params.attemptId }, include: { exam: true } });
    if (!attempt || attempt.userId !== user.id) throw new AppError('Exam attempt not found.', 404);
    if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) return res.json({ success: true, attempt });
    const updated = await finishAttempt(attempt.id, attempt.exam);
    return res.json({ success: true, attempt: updated });
  } catch (error) { next(error); }
}

export async function getTeacherExams(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = await teacherProfile(req);
    const exams = await prisma.exam.findMany({ where: { teacherProfileId: profileId }, orderBy: { createdAt: 'desc' }, include: { batch: { select: { id: true, name: true } }, _count: { select: { attempts: true } } } });
    return res.json({ success: true, exams });
  } catch (error) { next(error); }
}

export async function createTeacherExam(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = await teacherProfile(req);
    const { title, description, batchId, format, level, durationMinutes, passPercent, maxAttempts, opensAt, closesAt, status } = req.body || {};
    const batches = await assignedBatchIds(profileId);
    if (typeof batchId !== 'string' || !batches.includes(batchId)) throw new AppError('Choose one of your assigned batches.', 403);
    if (typeof title !== 'string' || title.trim().length < 3 || title.length > 160) throw new AppError('Add an exam title between 3 and 160 characters.', 400);
    if (typeof description !== 'string' || description.trim().length < 5 || description.length > 4000) throw new AppError('Add exam instructions (5–4,000 characters).', 400);
    if (!['GOETHE', 'TELC'].includes(String(format).toUpperCase())) throw new AppError('Choose Goethe or telc exam style.', 400);
    if (!Object.values(GermanLevel).includes(level)) throw new AppError('Choose a CEFR exam level.', 400);
    if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < 10 || Number(durationMinutes) > 360) throw new AppError('Exam duration must be between 10 and 360 minutes.', 400);
    if (!Number.isFinite(Number(passPercent)) || Number(passPercent) < 0 || Number(passPercent) > 100) throw new AppError('Pass threshold must be between 0 and 100%.', 400);
    if (!Number.isInteger(Number(maxAttempts)) || Number(maxAttempts) < 1 || Number(maxAttempts) > 10) throw new AppError('Allow between 1 and 10 attempts.', 400);
    const questions = asQuestions(req.body.questions, status === PublicationStatus.PUBLISHED);
    const opens = opensAt ? new Date(opensAt) : null;
    const closes = closesAt ? new Date(closesAt) : null;
    if ((opensAt && Number.isNaN(opens!.getTime())) || (closesAt && Number.isNaN(closes!.getTime())) || (opens && closes && closes <= opens)) throw new AppError('Check the exam open and close times.', 400);
    const exam = await prisma.exam.create({ data: {
      teacherProfileId: profileId, batchId, title: title.trim(), description: description.trim(),
      format: String(format).toUpperCase(), level, durationMinutes: Number(durationMinutes),
      passPercent: Number(passPercent), maxAttempts: Number(maxAttempts), opensAt: opens, closesAt: closes,
      status: status === PublicationStatus.PUBLISHED ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT,
      questions: questions as any
    }, include: { batch: { select: { id: true, name: true } } } });
    return res.status(201).json({ success: true, exam });
  } catch (error) { next(error); }
}

export async function updateTeacherExamStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = await teacherProfile(req);
    const status = req.body?.status;
    if (![PublicationStatus.PUBLISHED, PublicationStatus.ARCHIVED, PublicationStatus.DRAFT].includes(status)) throw new AppError('Choose Draft, Published, or Archived.', 400);
    const exam = await prisma.exam.findFirst({ where: { id: req.params.examId, teacherProfileId: profileId } });
    if (!exam) throw new AppError('Exam not found.', 404);
    if (status === PublicationStatus.PUBLISHED) asQuestions(exam.questions, true);
    const updated = await prisma.exam.update({ where: { id: exam.id }, data: { status } });
    return res.json({ success: true, exam: updated });
  } catch (error) { next(error); }
}

export async function getTeacherExamAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = await teacherProfile(req);
    const exam = await prisma.exam.findFirst({ where: { id: req.params.examId, teacherProfileId: profileId }, select: { id: true, questions: true } });
    if (!exam) throw new AppError('Exam not found.', 404);
    const attempts = await prisma.examAttempt.findMany({ where: { examId: exam.id }, orderBy: { startedAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } } } });
    return res.json({ success: true, questions: asQuestions(exam.questions), attempts });
  } catch (error) { next(error); }
}

export async function gradeTeacherExamAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = await teacherProfile(req);
    const attempt = await prisma.examAttempt.findUnique({ where: { id: req.params.attemptId }, include: { exam: true } });
    if (!attempt || attempt.exam.teacherProfileId !== profileId) throw new AppError('Exam attempt not found.', 404);
    if (attempt.status === ExamAttemptStatus.IN_PROGRESS) throw new AppError('The student must submit the exam before grading.', 409);
    const questions = asQuestions(attempt.exam.questions);
    const subjective = questions.filter(question => ['WRITING', 'SPEAKING'].includes(question.type) && String((attempt.answers as any)?.[question.id] || '').trim());
    const submittedScores = Array.isArray(req.body?.scores) ? req.body.scores : [];
    const scores: Record<string, { points: number; feedback?: string }> = {};
    for (const entry of submittedScores) {
      const question = subjective.find(item => item.id === entry.questionId);
      if (!question) throw new AppError('A grade references a question that is not awaiting manual review.', 400);
      const points = Number(entry.points);
      if (!Number.isFinite(points) || points < 0 || points > question.points) throw new AppError(`Score for a question must be between 0 and ${question.points}.`, 400);
      scores[question.id] = { points, feedback: typeof entry.feedback === 'string' ? entry.feedback.slice(0, 2000) : undefined };
    }
    if (Object.keys(scores).length !== subjective.length) throw new AppError('Grade every written and speaking response before finalizing the result.', 400);
    const objectiveScore = gradeObjective(questions, attempt.answers as any);
    const score = objectiveScore + Object.values(scores).reduce((sum, result) => sum + result.points, 0);
    const total = maxPoints(questions);
    const percentage = total ? score / total * 100 : 0;
    const updated = await prisma.examAttempt.update({ where: { id: attempt.id }, data: {
      status: ExamAttemptStatus.GRADED, manualScores: scores as any, score, maxScore: total, percentage,
      passed: percentage >= attempt.exam.passPercent,
      teacherFeedback: typeof req.body?.teacherFeedback === 'string' ? req.body.teacherFeedback.slice(0, 4000) : null
    } });
    return res.json({ success: true, attempt: updated });
  } catch (error) { next(error); }
}
