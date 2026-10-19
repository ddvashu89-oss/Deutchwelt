import { Request, Response, NextFunction } from 'express';
import { GermanLevel, SubmissionStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getSpeakingPrompts(req: Request, res: Response, next: NextFunction) {
  try {
    const { level } = req.query;

    if (isDatabaseConnected) {
      const where: any = {};
      if (level && Object.values(GermanLevel).includes(level as GermanLevel)) {
        where.level = level;
      }

      const prompts = await prisma.speakingPrompt.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, prompts });
    } else {
      let prompts = [...store.speakingPrompts];
      if (level && Object.values(GermanLevel).includes(level as GermanLevel)) {
        prompts = prompts.filter(p => p.level === level);
      }
      return res.json({ success: true, prompts });
    }
  } catch (error) {
    next(error);
  }
}

export async function getSpeakingPromptById(req: Request, res: Response, next: NextFunction) {
  try {
    const { promptId } = req.params;

    if (isDatabaseConnected) {
      const prompt = await prisma.speakingPrompt.findUnique({
        where: { id: promptId }
      });
      if (!prompt) {
        return next(new AppError('Speaking prompt not found.', 404));
      }
      return res.json({ success: true, prompt });
    } else {
      const prompt = store.speakingPrompts.find(p => p.id === promptId);
      if (!prompt) {
        return next(new AppError('Speaking prompt not found.', 404));
      }
      return res.json({ success: true, prompt });
    }
  } catch (error) {
    next(error);
  }
}

export async function submitSpeakingAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { promptId } = req.params;
    const { transcriptText, durationSeconds } = req.body;
    const file = req.file;

    const audioUrl = file ? `/uploads/audio/${file.filename}` : null;

    if (!audioUrl && !transcriptText) {
      return next(new AppError('Please provide either an audio recording or text response.', 400));
    }

    if (isDatabaseConnected) {
      const prompt = await prisma.speakingPrompt.findUnique({ where: { id: promptId } });
      if (!prompt) {
        return next(new AppError('Speaking prompt not found.', 404));
      }

      const attempt = await prisma.speakingAttempt.create({
        data: {
          userId: req.user.id,
          promptId,
          audioUrl,
          durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
          transcriptText: transcriptText || null,
          status: SubmissionStatus.SUBMITTED
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Speaking attempt submitted successfully for teacher review!',
        attempt
      });
    } else {
      const attempt = {
        id: `speaking-attempt-${Date.now()}`,
        userId: req.user.id,
        promptId,
        audioUrl,
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
        transcriptText: transcriptText || null,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date().toISOString()
      };
      store.speakingAttempts.push(attempt);

      return res.status(201).json({
        success: true,
        message: 'Speaking attempt submitted successfully for teacher review!',
        attempt
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getUserSpeakingAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (isDatabaseConnected) {
      const attempts = await prisma.speakingAttempt.findMany({
        where: { userId: req.user.id },
        include: { prompt: true },
        orderBy: { submittedAt: 'desc' }
      });
      return res.json({ success: true, attempts });
    } else {
      const attempts = store.speakingAttempts.filter(a => a.userId === req.user?.id).map(a => ({
        ...a,
        prompt: store.speakingPrompts.find(p => p.id === a.promptId)
      }));
      return res.json({ success: true, attempts });
    }
  } catch (error) {
    next(error);
  }
}
