import { z } from 'zod';
import { GermanLevel, EnquiryStatus } from '../types/enums.js';

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().max(30).optional().nullable(),
  level: z.nativeEnum(GermanLevel).default(GermanLevel.A1),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long').max(2000),
  requestDemo: z.boolean().optional().default(false),
  preferredDemoAt: z.string().datetime().optional(),
  consentToContact: z.boolean().refine((val) => val === true, {
    message: 'You must consent to being contacted regarding your enquiry'
  })
}).superRefine((enquiry, context) => {
  if (enquiry.requestDemo && !enquiry.preferredDemoAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['preferredDemoAt'], message: 'Choose a preferred date and time for your demo class.' });
  }
  if (enquiry.preferredDemoAt && new Date(enquiry.preferredDemoAt).getTime() <= Date.now()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['preferredDemoAt'], message: 'Choose a future date and time.' });
  }
});

export const updateEnquiryStatusSchema = z.object({
  status: z.nativeEnum(EnquiryStatus),
  adminNotes: z.string().trim().max(1000).optional().nullable()
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
