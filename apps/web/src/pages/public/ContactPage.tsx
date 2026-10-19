import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactEnquirySchema, ContactEnquiryInput, GermanLevel } from '@deutschwelt/shared';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Mail, Phone, MapPin, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactEnquiryInput>({
    resolver: zodResolver(contactEnquirySchema),
    defaultValues: {
      level: GermanLevel.A1,
      consentToContact: true
    }
  });

  const onSubmit = async (data: ContactEnquiryInput) => {
    try {
      setServerError(null);
      const res: any = await api.post('/enquiries', data);
      if (res.success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to submit enquiry. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Academic Advisors Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <Badge variant="default" className="uppercase font-bold tracking-wider">Admissions & Support</Badge>
            <h1 className="text-4xl font-extrabold text-navy tracking-tight">
              Get in Touch with Our Academic Advisors
            </h1>
            <p className="text-base text-dark-muted leading-relaxed">
              Have questions about which CEFR level is right for you, preparation for the Goethe-Zertifikat, or live intensive batch schedules? We are here to guide you.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dark-muted">Email Inquiries</p>
                <p className="text-sm font-semibold text-navy">admissions@deutschwelt.de</p>
                <p className="text-xs text-gray-500 mt-0.5">Average response time: within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-germanRed-100 text-germanRed flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-germanRed" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dark-muted">Advising Hours</p>
                <p className="text-sm font-semibold text-navy">Mon – Fri: 09:00 – 18:00 CET</p>
                <p className="text-xs text-gray-500 mt-0.5">Berlin & Central European Time</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dark-muted">Academic Center</p>
                <p className="text-sm font-semibold text-navy">Berlin Campus & Global Digital Academy</p>
                <p className="text-xs text-gray-500 mt-0.5">Certified DACH language instruction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enquiry Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-card">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-navy">Vielen Dank für Ihre Nachricht!</h3>
                <p className="text-sm text-dark-muted max-w-md mx-auto">
                  Your enquiry has been securely logged in our admissions system. An academic advisor will reach out to your provided email within one business day.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-germanRed" /> Send Us a Message
                </h2>

                {serverError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                    {serverError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Priya Sharma"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="priya@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="+91 98765 43210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                      Target German Level
                    </label>
                    <select
                      className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
                      {...register('level')}
                    >
                      <option value={GermanLevel.A1}>A1 — Complete Beginner</option>
                      <option value={GermanLevel.A2}>A2 — Elementary</option>
                      <option value={GermanLevel.B1}>B1 — Intermediate</option>
                      <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
                      <option value={GermanLevel.UNSURE}>Not sure / Need placement test</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                    How can we help you?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your learning goals, upcoming exams, or target university/visa timeline..."
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy"
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 font-medium">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                    {...register('consentToContact')}
                  />
                  <label htmlFor="consent" className="text-xs text-dark-muted leading-tight">
                    I consent to DeutschWelt contacting me regarding course details, diagnostic tests, and educational updates.
                  </label>
                </div>
                {errors.consentToContact && (
                  <p className="text-xs text-red-600 font-medium">{errors.consentToContact.message}</p>
                )}

                <Button type="submit" variant="secondary" size="lg" className="w-full font-bold shadow-md" isLoading={isSubmitting}>
                  Submit Enquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
