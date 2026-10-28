import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Input, Textarea } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  phone: z.string().optional(),
  targetLevel: z.string().optional(),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein')
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setServerError(null);
      await api.post('/contact', data);
      setSubmitted(true);
      reset();
    } catch (err: any) {
      setServerError(err.message || 'Error sending message. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              {t('contact.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-950 tracking-tight">
              {t('contact.title')}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-900 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-forest-800" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">E-Mail Beratung</p>
                <p className="text-sm font-bold text-gray-950">beratung@deutschwelt.de</p>
                <p className="text-xs text-gray-500 mt-0.5">Antwortzeit: innerhalb von 24 Stunden</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-mint/15 text-forest-900 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-forest-800" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Sprechzeiten</p>
                <p className="text-sm font-bold text-gray-950">Mo – Fr: 09:00 – 18:00 CET</p>
                <p className="text-xs text-gray-500 mt-0.5">Berlin & Zentraleuropäische Zeit</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Akademie-Standort</p>
                <p className="text-sm font-bold text-gray-950">Berlin Campus & Digitale Akademie</p>
                <p className="text-xs text-gray-500 mt-0.5">Zertifizierte DACH-Sprachausbildung</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enquiry Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-4xl p-8 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-black text-gray-950">
                  {t('contact.successTitle')}
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {t('contact.successDesc')}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {t('contact.submit')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-black text-gray-950 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-forest-800" /> {t('contact.badge')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('contact.subtitle')}
                  </p>
                </div>

                {serverError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
                    {serverError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('contact.name')}
                    placeholder="Max Mustermann"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <Input
                    label={t('contact.email')}
                    type="email"
                    placeholder="max@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('contact.phone')}
                    placeholder="+49 170 1234567"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 tracking-wide">
                      {t('contact.targetLevel')}
                    </label>
                    <select
                      {...register('targetLevel')}
                      className="flex h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-800/15 focus:border-forest-800 transition-all"
                    >
                      <option value="A1">A1 Beginner</option>
                      <option value="A2">A2 Elementary</option>
                      <option value="B1">B1 Intermediate (Goethe B1 / DTZ)</option>
                      <option value="B2">B2 Advanced (Goethe B2)</option>
                      <option value="OTHER">General Counselling</option>
                    </select>
                  </div>
                </div>

                <Textarea
                  label={t('contact.message')}
                  rows={4}
                  placeholder="Describe your goals or questions..."
                  error={errors.message?.message}
                  {...register('message')}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <span>{isSubmitting ? t('contact.submitting') : t('contact.submit')}</span>
                    <ArrowRight className="w-4 h-4 text-mint" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
