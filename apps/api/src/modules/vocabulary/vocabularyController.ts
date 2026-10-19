import { Request, Response, NextFunction } from 'express';
import { GermanLevel, GermanArticle, PartOfSpeech } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { computeNextSRSState } from '../../services/srsService.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getVocabulary(req: Request, res: Response, next: NextFunction) {
  try {
    const { level, category, article, partOfSpeech, search, page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (isDatabaseConnected) {
      const where: any = {};
      if (level) where.level = level;
      if (category) where.category = category;
      if (article) where.article = article;
      if (partOfSpeech) where.partOfSpeech = partOfSpeech;
      if (search) {
        where.OR = [
          { german: { contains: String(search), mode: 'insensitive' } },
          { english: { contains: String(search), mode: 'insensitive' } }
        ];
      }

      const [total, words] = await Promise.all([
        prisma.vocabularyWord.count({ where }),
        prisma.vocabularyWord.findMany({
          where,
          skip,
          take,
          orderBy: { german: 'asc' },
          include: req.user ? {
            userProgresses: {
              where: { userId: req.user.id }
            }
          } : undefined
        })
      ]);

      const formattedWords = words.map(w => ({
        ...w,
        progress: (w as any).userProgresses?.[0] || null
      }));

      return res.json({
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        words: formattedWords
      });
    } else {
      let words = [...store.vocabulary];
      if (level) words = words.filter(w => w.level === level);
      if (category) words = words.filter(w => w.category === category);
      if (article) words = words.filter(w => w.article === article);
      if (partOfSpeech) words = words.filter(w => w.partOfSpeech === partOfSpeech);
      if (search) {
        const s = String(search).toLowerCase();
        words = words.filter(w => w.german.toLowerCase().includes(s) || w.english.toLowerCase().includes(s));
      }

      const total = words.length;
      const paginated = words.slice(skip, skip + take).map(w => {
        const prog = req.user ? store.studentVocabProgress.find(p => p.userId === req.user?.id && p.wordId === w.id) : null;
        return { ...w, progress: prog || null };
      });

      return res.json({
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        words: paginated
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    if (isDatabaseConnected) {
      const categories = await prisma.vocabularyCategory.findMany({
        orderBy: { order: 'asc' }
      });
      return res.json({ success: true, categories });
    } else {
      return res.json({ success: true, categories: store.vocabCategories });
    }
  } catch (error) {
    next(error);
  }
}

export async function getFlashcards(req: Request, res: Response, next: NextFunction) {
  try {
    const { level } = req.query;

    if (isDatabaseConnected) {
      const where: any = {};
      if (level) where.level = level;

      const words = await prisma.vocabularyWord.findMany({
        where,
        take: 30,
        orderBy: { difficulty: 'asc' },
        include: req.user ? {
          userProgresses: {
            where: { userId: req.user.id }
          }
        } : undefined
      });

      const cards = words.map(w => ({
        ...w,
        progress: (w as any).userProgresses?.[0] || null
      }));

      return res.json({ success: true, flashcards: cards });
    } else {
      let words = [...store.vocabulary];
      if (level) words = words.filter(w => w.level === level);

      const cards = words.slice(0, 30).map(w => {
        const prog = req.user ? store.studentVocabProgress.find(p => p.userId === req.user?.id && p.wordId === w.id) : null;
        return { ...w, progress: prog || null };
      });

      return res.json({ success: true, flashcards: cards });
    }
  } catch (error) {
    next(error);
  }
}

export async function updateWordProgress(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { wordId } = req.params;
    const { quality } = req.body; // 0-5

    if (quality === undefined || quality < 0 || quality > 5) {
      return next(new AppError('Review quality rating must be between 0 and 5.', 400));
    }

    if (isDatabaseConnected) {
      const existing = await prisma.studentVocabularyProgress.findUnique({
        where: {
          userId_wordId: {
            userId: req.user.id,
            wordId
          }
        }
      });

      const nextState = computeNextSRSState({
        currentBox: existing?.box || 1,
        timesReviewed: existing?.timesReviewed || 0,
        timesCorrect: existing?.timesCorrect || 0,
        quality
      });

      const progress = await prisma.studentVocabularyProgress.upsert({
        where: {
          userId_wordId: {
            userId: req.user.id,
            wordId
          }
        },
        update: {
          box: nextState.box,
          status: nextState.status as any,
          timesReviewed: nextState.timesReviewed,
          timesCorrect: nextState.timesCorrect,
          lastReviewedAt: new Date(nextState.lastReviewedAt),
          nextReviewAt: new Date(nextState.nextReviewAt)
        },
        create: {
          userId: req.user.id,
          wordId,
          box: nextState.box,
          status: nextState.status as any,
          timesReviewed: nextState.timesReviewed,
          timesCorrect: nextState.timesCorrect,
          lastReviewedAt: new Date(nextState.lastReviewedAt),
          nextReviewAt: new Date(nextState.nextReviewAt)
        }
      });

      return res.json({ success: true, progress });
    } else {
      let existing = store.studentVocabProgress.find(p => p.userId === req.user?.id && p.wordId === wordId);
      const nextState = computeNextSRSState({
        currentBox: existing?.box || 1,
        timesReviewed: existing?.timesReviewed || 0,
        timesCorrect: existing?.timesCorrect || 0,
        quality
      });

      if (existing) {
        Object.assign(existing, nextState);
      } else {
        existing = {
          id: `svp-${Date.now()}`,
          userId: req.user.id,
          wordId,
          ...nextState
        };
        store.studentVocabProgress.push(existing);
      }

      return res.json({ success: true, progress: existing });
    }
  } catch (error) {
    next(error);
  }
}
