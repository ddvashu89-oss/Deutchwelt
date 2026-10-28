import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../lib/api.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Input, Textarea } from '../../components/ui/Input.js';
import {
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  MessageSquare,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 font-sans text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {t('contact.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
              {t('contact.title')}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B1325] border border-white/[0.08] shadow-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">E-Mail Beratung</p>
                <p className="text-sm font-bold text-white">beratung@deutschwelt.de</p>
                <p className="text-xs text-slate-400 mt-0.5">Antwortzeit: innerhalb von 24 Stunden</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B1325] border border-white/[0.08] shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sprechzeiten</p>
                <p className="text-sm font-bold text-white">Mo – Fr: 09:00 – 18:00 CET</p>
                <p className="text-xs text-slate-400 mt-0.5">Berlin & Zentraleuropäische Zeit</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B1325] border border-white/[0.08] shadow-md">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                <MapPin className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Akademie-Standort</p>
                <p className="text-sm font-bold text-white">Berlin Campus & Digitale Akademie</p>
                <p className="text-xs text-slate-400 mt-0.5">Zertifizierte DACH-Sprachausbildung</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enquiry Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-[#0B1325] rounded-4xl p-8 sm:p-10 border border-white/[0.08] shadow-2xl space-y-6">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-black text-white">
                  {t('contact.successTitle')}
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  {t('contact.successDesc')}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                >
                  {t('contact.submit')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" /> {t('contact.badge')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('contact.subtitle')}
                  </p>
                </div>

                {serverError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold">
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
                    <label className="block text-xs font-bold text-slate-300 tracking-wide">
                      {t('contact.targetLevel')}
                    </label>
                    <select
                      {...register('targetLevel')}
                      className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A] px-4 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
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
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>{isSubmitting ? t('contact.submitting') : t('contact.submit')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
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

export default ContactPage;
