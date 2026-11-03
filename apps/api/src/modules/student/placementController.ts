import { Request, Response, NextFunction } from 'express';
import { GermanLevel } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

const questions = [
  { id: 'a1-1', level: GermanLevel.A1, prompt: 'Ich ___ Maya.', options: ['heiße', 'heißt', 'heißen'], answer: 'heiße' },
  { id: 'a1-2', level: GermanLevel.A1, prompt: '___ du aus Indien?', options: ['Komme', 'Kommst', 'Kommt'], answer: 'Kommst' },
  { id: 'a1-3', level: GermanLevel.A1, prompt: 'Choose the correct article: ___ Buch', options: ['Der', 'Die', 'Das'], answer: 'Das' },
  { id: 'a2-1', level: GermanLevel.A2, prompt: 'Gestern ___ ich meine Freundin besucht.', options: ['habe', 'bin', 'hat'], answer: 'habe' },
  { id: 'a2-2', level: GermanLevel.A2, prompt: 'Ich fahre ___ dem Bus zur Arbeit.', options: ['mit', 'bei', 'nach'], answer: 'mit' },
  { id: 'a2-3', level: GermanLevel.A2, prompt: 'Choose the correct sentence.', options: ['Ich muss heute lernen.', 'Ich muss lerne heute.', 'Ich heute muss lernen.'], answer: 'Ich muss heute lernen.' },
  { id: 'b1-1', level: GermanLevel.B1, prompt: 'Ich bleibe zu Hause, ___ es regnet.', options: ['weil', 'denn ich', 'trotzdem'], answer: 'weil' },
  { id: 'b1-2', level: GermanLevel.B1, prompt: 'Wenn ich mehr Zeit ___, würde ich öfter lesen.', options: ['habe', 'hätte', 'hatte'], answer: 'hätte' },
  { id: 'b1-3', level: GermanLevel.B1, prompt: 'Der Brief ___ gestern geschrieben.', options: ['wurde', 'hat', 'war'], answer: 'wurde' },
  { id: 'b2-1', level: GermanLevel.B2, prompt: 'Choose the best connector: ___ er krank war, nahm er am Unterricht teil.', options: ['Obwohl', 'Weil', 'Damit'], answer: 'Obwohl' },
  { id: 'b2-2', level: GermanLevel.B2, prompt: 'Die Unterlagen, ___ ich gestern erhalten habe, sind vollständig.', options: ['die', 'denen', 'deren'], answer: 'die' },
  { id: 'b2-3', level: GermanLevel.B2, prompt: 'Er behauptet, die E-Mail schon ___ .', options: ['beantwortet zu haben', 'zu beantworten gehabt', 'beantworten haben'], answer: 'beantwortet zu haben' }
];

const normalize = (value: unknown) => String(value || '').trim().toLocaleLowerCase('de-DE').replace(/[.!?]+$/g, '');

export async function getPlacementTest(_req: Request, res: Response) {
  return res.json({ success: true, questions: questions.map(({ answer: _answer, ...question }) => question) });
}

export async function submitPlacementTest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    const answers = req.body?.answers;
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return next(new AppError('Submit one answer for each placement question.', 400));
    }

    const levelStats = [GermanLevel.A1, GermanLevel.A2, GermanLevel.B1, GermanLevel.B2].map(level => {
      const levelQuestions = questions.filter(question => question.level === level);
      const correct = levelQuestions.filter(question => normalize(answers[question.id]) === normalize(question.answer)).length;
      return { level, correct, total: levelQuestions.length, percentage: Math.round((correct / levelQuestions.length) * 100) };
    });

    let recommendedLevel: GermanLevel = GermanLevel.A1;
    for (const stat of levelStats) {
      if (stat.percentage >= 50) recommendedLevel = stat.level;
      else break;
    }
    const score = levelStats.reduce((sum, stat) => sum + stat.correct, 0);
    const maxScore = questions.length;
    const summary = levelStats.map(({ level, correct, total, percentage }) => ({ level, correct, total, percentage }));

    let attemptId: string | null = null;
    if (isDatabaseConnected) {
      const attempt = await prisma.placementAttempt.create({
        data: { userId: req.user.id, recommendedLevel, score, maxScore, answerSummary: summary }
      });
      attemptId = attempt.id;
      await prisma.studentProfile.updateMany({
        where: { userId: req.user.id },
        data: { currentLevel: recommendedLevel }
      });
    }

    const focusAreas = summary.filter((item: any) => item.percentage < 70).map((item: any) => item.level);
    return res.json({
      success: true,
      result: {
        attemptId,
        recommendedLevel,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        levelBreakdown: summary,
        focusAreas,
        persisted: isDatabaseConnected
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getPersonalLearningPlan(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    const [profile, latestAttempt, enrollments] = isDatabaseConnected
      ? await Promise.all([
          prisma.studentProfile.findUnique({ where: { userId: req.user.id } }),
          prisma.placementAttempt.findFirst({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
          prisma.enrollment.findMany({ where: { userId: req.user.id }, include: { course: true } })
        ])
      : [null, null, []];

    const level = latestAttempt?.recommendedLevel || profile?.currentLevel || GermanLevel.A1;
    const plan = [
      { day: 'Mon', focus: 'Grammar foundations', activity: 'Complete one lesson and its short exercise', minutes: 25 },
      { day: 'Tue', focus: 'Vocabulary', activity: 'Review due words and add 10 useful phrases', minutes: 20 },
      { day: 'Wed', focus: 'Listening', activity: 'Listen to a course dialogue and note 5 new expressions', minutes: 25 },
      { day: 'Thu', focus: 'Speaking', activity: 'Record a short answer in the Speaking Lab', minutes: 20 },
      { day: 'Fri', focus: 'Writing', activity: 'Submit a short paragraph for teacher feedback', minutes: 25 },
      { day: 'Sat', focus: 'Review', activity: 'Retry a quiz and revisit lessons needing practice', minutes: 30 }
    ];

    return res.json({
      success: true,
      plan: {
        level,
        needsPlacementTest: !latestAttempt,
        latestAssessmentAt: latestAttempt?.createdAt || null,
        weeklyGoalMinutes: profile?.dailyGoalMinutes ? profile.dailyGoalMinutes * 5 : 100,
        enrolledCourses: enrollments.map((enrollment: any) => ({ title: enrollment.course.title, progressPercentage: enrollment.progressPercentage })),
        focusAreas: (latestAttempt?.answerSummary as any[] | undefined)?.filter(area => area.percentage < 70).map(area => area.level) || [],
        days: plan
      }
    });
  } catch (error) {
    next(error);
  }
}
