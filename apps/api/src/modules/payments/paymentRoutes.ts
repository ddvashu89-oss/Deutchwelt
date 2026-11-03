import { Router, Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();
const razorpayConfigured = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

async function razorpayRequest(path: string, init: RequestInit = {}) {
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    signal: AbortSignal.timeout(20000)
  });
  const data = await response.json().catch(() => ({})) as any;
  if (!response.ok) {
    console.error('[Payments] Razorpay request failed:', response.status, data?.error?.code || 'provider_error');
    throw new Error('Payment provider could not process the request. Please try again.');
  }
  return data;
}

router.get('/config', requireAuth, (_req, res) => {
  res.json({ success: true, configured: razorpayConfigured(), keyId: razorpayConfigured() ? env.RAZORPAY_KEY_ID : null, currency: 'INR' });
});

router.post('/orders', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Payments require the connected MySQL database.', 503));
    if (!razorpayConfigured()) return next(new AppError('Online payments are not configured yet. Please contact the academy.', 503, 'PAYMENTS_NOT_CONFIGURED'));
    const courseId = typeof req.body?.courseId === 'string' ? req.body.courseId.trim() : '';
    if (!courseId) return next(new AppError('Choose a course before checkout.', 400));
    const course = await prisma.course.findFirst({ where: { OR: [{ id: courseId }, { slug: courseId }], status: 'PUBLISHED' } });
    if (!course) return next(new AppError('Course not found.', 404));
    if (!Number.isInteger(course.pricePaise) || course.pricePaise <= 0) return next(new AppError('This course does not have a paid price.', 400));
    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: course.id } } });
    if (existing?.status === 'ACTIVE' || existing?.status === 'COMPLETED') {
      return res.json({ success: true, alreadyEnrolled: true, enrollment: existing });
    }

    const providerOrder = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({ amount: course.pricePaise, currency: 'INR', receipt: `dw-${req.user.id.slice(0, 12)}-${Date.now()}` })
    });
    const order = await prisma.paymentOrder.create({
      data: {
        userId: req.user.id,
        courseId: course.id,
        amountPaise: course.pricePaise,
        currency: 'INR',
        providerOrderId: providerOrder.id,
        status: 'CREATED'
      }
    });
    return res.status(201).json({
      success: true,
      order: { id: providerOrder.id, amount: providerOrder.amount, currency: providerOrder.currency, keyId: env.RAZORPAY_KEY_ID, courseTitle: course.title, localOrderId: order.id }
    });
  } catch (error) { next(error); }
});

router.post('/verify', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Payments require the connected MySQL database.', 503));
    if (!razorpayConfigured()) return next(new AppError('Online payments are not configured yet.', 503));
    const orderId = String(req.body?.razorpay_order_id || '');
    const paymentId = String(req.body?.razorpay_payment_id || '');
    const signature = String(req.body?.razorpay_signature || '');
    if (!orderId || !paymentId || !signature || signature.length > 256) return next(new AppError('Payment verification details are incomplete.', 400));

    const order = await prisma.paymentOrder.findFirst({ where: { providerOrderId: orderId, userId: req.user.id } });
    if (!order) return next(new AppError('Payment order not found.', 404));
    const expected = createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    const receivedBytes = Buffer.from(signature, 'hex');
    const expectedBytes = Buffer.from(expected, 'hex');
    if (receivedBytes.length !== expectedBytes.length || !timingSafeEqual(receivedBytes, expectedBytes)) {
      return next(new AppError('Payment signature could not be verified.', 400, 'INVALID_PAYMENT_SIGNATURE'));
    }

    const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
    if (payment.order_id !== orderId || payment.amount !== order.amountPaise || payment.currency !== order.currency || payment.status !== 'captured') {
      await prisma.paymentOrder.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      return next(new AppError('Payment has not been captured for this course order.', 400, 'PAYMENT_NOT_CAPTURED'));
    }

    const enrollment = await prisma.$transaction(async (tx: any) => {
      await tx.paymentOrder.update({ where: { id: order.id }, data: { providerPaymentId: paymentId, status: 'PAID' } });
      return tx.enrollment.upsert({
        where: { userId_courseId: { userId: req.user!.id, courseId: order.courseId } },
        update: { status: 'ACTIVE' },
        create: { userId: req.user!.id, courseId: order.courseId, status: 'ACTIVE', progressPercentage: 0 }
      });
    });
    return res.json({ success: true, message: 'Payment verified and course access is active.', enrollment });
  } catch (error) { next(error); }
});

export default router;
