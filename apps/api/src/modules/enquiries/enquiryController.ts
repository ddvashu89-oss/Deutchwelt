import { Request, Response, NextFunction } from 'express';
import { EnquiryStatus, GermanLevel } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';

export async function submitEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, level, message } = req.body;

    if (isDatabaseConnected) {
      const enquiry = await prisma.contactEnquiry.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          level: level || GermanLevel.A1,
          message,
          status: EnquiryStatus.NEW
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Vielen Dank! Your message has been received. Our academic team will get back to you within 24 hours.',
        enquiryId: enquiry.id
      });
    } else {
      const enquiry = {
        id: `enq-${Date.now()}`,
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        level: level || GermanLevel.A1,
        message,
        status: EnquiryStatus.NEW,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.enquiries.unshift(enquiry);

      return res.status(201).json({
        success: true,
        message: 'Vielen Dank! Your message has been received. Our academic team will get back to you within 24 hours.',
        enquiryId: enquiry.id
      });
    }
  } catch (error) {
    next(error);
  }
}
