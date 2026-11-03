import { Request, Response, NextFunction } from 'express';
import { GermanLevel, SubmissionStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';
import { discardTemporaryUpload, persistUploadedFile } from '../../services/uploadStorage.js';
import { trashDriveFile } from '../../services/googleDrive.js';
import fs from 'node:fs/promises';
import { env } from '../../config/env.js';
import { generateGeminiText } from '../../services/gemini.js';

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

    if (!file && !transcriptText) {
      return next(new AppError('Please provide either an audio recording or text response.', 400));
    }

    const prompt = isDatabaseConnected
      ? await prisma.speakingPrompt.findUnique({ where: { id: promptId } })
      : store.speakingPrompts.find(item => item.id === promptId);
    if (!prompt) {
      await discardTemporaryUpload(file);
      return next(new AppError('Speaking prompt not found.', 404));
    }

    const storedUpload = file ? await persistUploadedFile(file) : null;
    const audioUrl = storedUpload?.fileUrl || null;

    if (isDatabaseConnected) {

      let attempt;
      try {
        attempt = await prisma.speakingAttempt.create({
          data: {
            userId: req.user.id,
            promptId,
            audioUrl,
            durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
            transcriptText: transcriptText || null,
            status: SubmissionStatus.SUBMITTED
          }
        });
      } catch (error) {
        if (storedUpload?.driveFileId) await trashDriveFile(storedUpload.driveFileId).catch(() => undefined);
        throw error;
      }

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

/**
 * AI Speech Pronunciation & Fluency Evaluation
 */
export async function analyzeSpeakingAudio(req: Request, res: Response, next: NextFunction) {
  try {
    const { promptId, durationSeconds, transcriptText } = req.body;
    const file = req.file;

    // Analysis does not retain the recording; remove the temporary multipart file.
    if (file?.path) await fs.unlink(file.path).catch(() => undefined);

    if (!req.user) return next(new AppError('Unauthorized', 401));
    if (!env.GEMINI_API_KEY) return next(new AppError('AI speaking feedback is not configured yet. You can still submit your response to your teacher.', 503, 'AI_NOT_CONFIGURED'));
    const transcript = typeof transcriptText === 'string' ? transcriptText.trim().slice(0, 1200) : '';
    if (!transcript) return next(new AppError('Enter the words you spoke so the tutor can give accurate transcript feedback. Audio alone is not scored.', 400));
    const prompt = isDatabaseConnected
      ? await prisma.speakingPrompt.findUnique({ where: { id: promptId } })
      : store.speakingPrompts.find(item => item.id === promptId);
    const targetText = prompt?.sampleAnswerDe || prompt?.scenario || '';
    if (!targetText) return next(new AppError('Speaking prompt not found.', 404));
    const raw = await generateGeminiText([{ role: 'user', text: `Target phrase: ${targetText}\nLearner transcript: ${transcript}` }], 'You are a patient German tutor. You cannot hear audio. Do not claim to score pronunciation, accent or fluency. Return JSON only with overallScore integer 0-100 for transcript match and language accuracy, correctedTranscript string, strengths array of short strings, practiceTips array of short strings, nextPhrase string.', true);
    let feedback: any;
    try { feedback = JSON.parse(raw); } catch { throw new Error('AI feedback could not be formatted. Please try again.'); }
    const overallScore = Number(feedback.overallScore);

    return res.json({
      success: true,
      analysis: {
        overallScore: Number.isFinite(overallScore) ? Math.max(0, Math.min(100, Math.round(overallScore))) : null,
        targetPhrase: targetText,
        detectedSpeech: transcript,
        correctedTranscript: String(feedback.correctedTranscript || transcript).slice(0, 1200),
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths.slice(0, 4) : [],
        practiceTips: Array.isArray(feedback.practiceTips) ? feedback.practiceTips.slice(0, 4) : [],
        nextPhrase: String(feedback.nextPhrase || '').slice(0, 300),
        evaluationType: 'Transcript feedback only; acoustic pronunciation was not measured.',
        audioUrl: null,
        durationSeconds: durationSeconds ? Math.max(0, parseInt(durationSeconds, 10)) : null,
        evaluatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
