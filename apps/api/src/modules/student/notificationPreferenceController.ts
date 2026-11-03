import { Request, Response, NextFunction } from 'express';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getNotificationPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return res.json({ success: true, preferences: { emailReminders: false, whatsappReminders: false, reminderPhone: '' } });
    const preferences = await prisma.notificationPreference.findUnique({ where: { userId: req.user.id } });
    return res.json({ success: true, preferences: preferences || { emailReminders: false, whatsappReminders: false, reminderPhone: '' } });
  } catch (error) { next(error); }
}

export async function updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!isDatabaseConnected) return next(new AppError('Notification preferences require the connected database.', 503));
    const whatsappReminders = Boolean(req.body?.whatsappReminders);
    const reminderPhone = typeof req.body?.reminderPhone === 'string' ? req.body.reminderPhone.trim().slice(0, 30) : '';
    if (whatsappReminders && reminderPhone.replace(/\D/g, '').length < 8) {
      return next(new AppError('Add a valid phone number before enabling WhatsApp reminders.', 400));
    }
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        emailReminders: Boolean(req.body?.emailReminders),
        whatsappReminders,
        reminderPhone: whatsappReminders ? reminderPhone : null
      },
      update: {
        emailReminders: Boolean(req.body?.emailReminders),
        whatsappReminders,
        reminderPhone: whatsappReminders ? reminderPhone : null
      }
    });
    return res.json({ success: true, preferences });
  } catch (error) { next(error); }
}
