import { Router, Request, Response, NextFunction } from 'express';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@deutschwelt/shared';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDatabaseConnected) return res.json({ success: true, posts: [], databaseAvailable: false });
    const posts = await prisma.discussionPost.findMany({
      take: 40,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } }
        }
      }
    });
    return res.json({ success: true, posts, databaseAvailable: true });
  } catch (error) { next(error); }
});

router.post('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Community discussions require the connected MySQL database.', 503));
    const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 180) : '';
    const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 6000) : '';
    const category = ['GRAMMAR', 'VOCABULARY', 'EXAMS', 'COURSES', 'GENERAL'].includes(req.body?.category) ? req.body.category : 'GENERAL';
    if (title.length < 6 || body.length < 10) return next(new AppError('Add a title (at least 6 characters) and a question (at least 10 characters).', 400));
    const post = await prisma.discussionPost.create({
      data: { authorId: req.user.id, title, body, category },
      include: { author: { select: { id: true, firstName: true, lastName: true, role: true } }, replies: true }
    });
    return res.status(201).json({ success: true, post });
  } catch (error) { next(error); }
});

router.post('/posts/:postId/replies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Community discussions require the connected MySQL database.', 503));
    const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 4000) : '';
    if (body.length < 2) return next(new AppError('Write a reply before submitting.', 400));
    const post = await prisma.discussionPost.findUnique({ where: { id: req.params.postId }, select: { id: true } });
    if (!post) return next(new AppError('Discussion not found.', 404));
    const reply = await prisma.discussionReply.create({
      data: { postId: post.id, authorId: req.user.id, body, instructorAnswer: [UserRole.TEACHER, UserRole.ADMIN].includes(req.user.role) },
      include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } }
    });
    return res.status(201).json({ success: true, reply });
  } catch (error) { next(error); }
});

router.delete('/posts/:postId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Community discussions require the connected MySQL database.', 503));
    const post = await prisma.discussionPost.findUnique({ where: { id: req.params.postId }, select: { id: true, authorId: true } });
    if (!post) return next(new AppError('Discussion not found.', 404));
    if (post.authorId !== req.user.id && ![UserRole.TEACHER, UserRole.ADMIN].includes(req.user.role)) {
      return next(new AppError('You can remove only your own discussion.', 403));
    }
    await prisma.discussionPost.delete({ where: { id: post.id } });
    return res.json({ success: true });
  } catch (error) { next(error); }
});

router.patch('/posts/:postId/pin', requireRole(UserRole.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDatabaseConnected) return next(new AppError('Community discussions require the connected MySQL database.', 503));
    const post = await prisma.discussionPost.update({ where: { id: req.params.postId }, data: { isPinned: Boolean(req.body?.isPinned) } });
    return res.json({ success: true, post });
  } catch (error) { next(error); }
});

export default router;
