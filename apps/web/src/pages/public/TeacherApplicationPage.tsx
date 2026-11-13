import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, Globe2, Languages, UploadCloud } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input, Textarea } from '../../components/ui/Input.js';

const copy = {
  en: {
    badge: 'Teach with DeutschWelt', title: 'Help learners find their voice in German.',
    intro: 'Share your experience and teaching approach. Our academic team will review your application and contact you to arrange an interview.',
    steps: ['Submit your profile and CV', 'Admin reviews your experience', 'Meet the team in an interview', 'Receive a hiring decision'],
    formTitle: 'Teacher application', formHint: 'Complete each section. Your CV is required; certificates are optional.',
    first: 'First name', last: 'Last name', email: 'Email address', phone: 'Phone number',
    level: 'German proficiency', years: 'Years of teaching experience', qualifications: 'Qualifications and certificates',
    specialization: 'What would you like to teach?', availability: 'Your availability and time zone', motivation: 'Why would you like to teach at DeutschWelt?',
    cv: 'CV / résumé (required)', certs: 'Certificates (optional, up to 3)', uploadHint: 'PDF, Word, ODT, JPG or PNG · max 5 MB each',
    consent: 'I agree that DeutschWelt may review my information and attached documents for this teaching application. I have read the Privacy Policy.',
    submit: 'Send application', sending: 'Sending application…', successTitle: 'Your application is with our team',
    successText: 'We have received your profile and CV. Our admin team will review it and contact you about interview scheduling.',
    error: 'We could not submit your application. Please check the form and try again.',
    selectLevel: 'Select your level', motivationHint: 'Tell us about your teaching style, learners you work best with, and what you hope to bring to our classes.',
    cvNeeded: 'Please attach your CV before sending.', another: 'Submit another application',
    levels: ['A1 — Beginner', 'A2 — Elementary', 'B1 — Intermediate', 'B2 — Upper intermediate', 'C1 — Advanced', 'C2 — Proficient', 'Native speaker']
  },
  de: {
    badge: 'Unterrichten bei DeutschWelt', title: 'Helfen Sie Lernenden, auf Deutsch sicher zu kommunizieren.',
    intro: 'Teilen Sie Ihre Erfahrung und Ihren Unterrichtsansatz. Unser akademisches Team prüft Ihre Bewerbung und meldet sich zur Vereinbarung eines Vorstellungsgesprächs.',
    steps: ['Profil und Lebenslauf einreichen', 'Admin prüft Ihre Erfahrung', 'Team im Gespräch kennenlernen', 'Entscheidung erhalten'],
    formTitle: 'Bewerbung als Lehrkraft', formHint: 'Füllen Sie alle Bereiche aus. Ihr Lebenslauf ist erforderlich; Nachweise sind optional.',
    first: 'Vorname', last: 'Nachname', email: 'E-Mail-Adresse', phone: 'Telefonnummer',
    level: 'Deutschkenntnisse', years: 'Jahre Unterrichtserfahrung', qualifications: 'Qualifikationen und Nachweise',
    specialization: 'Was möchten Sie unterrichten?', availability: 'Verfügbarkeit und Zeitzone', motivation: 'Warum möchten Sie bei DeutschWelt unterrichten?',
    cv: 'Lebenslauf (erforderlich)', certs: 'Nachweise (optional, bis zu 3)', uploadHint: 'PDF, Word, ODT, JPG oder PNG · max. 5 MB pro Datei',
    consent: 'Ich bin einverstanden, dass DeutschWelt meine Angaben und Dokumente für diese Bewerbung prüft. Ich habe die Datenschutzerklärung gelesen.',
    submit: 'Bewerbung senden', sending: 'Bewerbung wird gesendet…', successTitle: 'Ihre Bewerbung ist bei unserem Team',
    successText: 'Wir haben Ihr Profil und Ihren Lebenslauf erhalten. Unser Admin-Team prüft die Bewerbung und meldet sich zur Terminvereinbarung.',
    error: 'Die Bewerbung konnte nicht gesendet werden. Bitte prüfen Sie das Formular und versuchen Sie es erneut.',
    selectLevel: 'Niveau auswählen', motivationHint: 'Beschreiben Sie Ihren Unterrichtsstil, Ihre Zielgruppen und was Sie in unseren Unterricht einbringen möchten.',
    cvNeeded: 'Bitte fügen Sie vor dem Senden Ihren Lebenslauf bei.', another: 'Weitere Bewerbung einreichen',
    levels: ['A1 — Anfänger', 'A2 — Grundkenntnisse', 'B1 — Fortgeschrittene Grundkenntnisse', 'B2 — Selbstständige Sprachverwendung', 'C1 — Fachkundige Sprachkenntnisse', 'C2 — Annähernd muttersprachlich', 'Muttersprachlich']
  }
};

const proficiencyValues = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE'];

export function TeacherApplicationPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', germanProficiency: '', teachingExperienceYears: '', qualifications: '', specialization: '', availability: '', motivation: '', consentToPrivacy: false });
  const [cv, setCv] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: string | boolean) => setForm(previous => ({ ...previous, [key]: value }));
  const accept = '.pdf,.doc,.docx,.odt,.jpg,.jpeg,.png';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cv) { setError(text.cvNeeded); return; }
    if (!form.consentToPrivacy) { setError(text.error); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        teachingExperienceYears: Number(form.teachingExperienceYears),
        preferredLanguage: language,
        consentToPrivacy: true
      };
      const body = new FormData();
      body.append('application', JSON.stringify(payload));
      body.append('cv', cv);
      certificates.forEach(file => body.append('certificates', file));
      await api.upload('/teacher-applications', body);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f3] pb-16">
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-mint/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-mint"><Globe2 className="h-4 w-4" />{text.badge}</p>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-black leading-tight tracking-tight sm:text-5xl">{text.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{text.intro}</p>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-mint hover:text-white">{language === 'de' ? 'DeutschWelt kennenlernen' : 'Meet DeutschWelt'} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-forest-950"><BookOpenCheck className="h-5 w-5" /></div><div><p className="font-bold">{language === 'de' ? 'Unser Auswahlprozess' : 'Our selection process'}</p><p className="text-xs text-white/55">{language === 'de' ? 'Transparent und persönlich' : 'Thoughtful and personal'}</p></div></div>
            <ol className="space-y-4">
              {text.steps.map((step, index) => <li key={step} className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mint/30 text-xs font-black text-mint">0{index + 1}</span><span className="text-sm font-medium text-white/85">{step}</span>{index < 3 && <span className="sr-only">{language === 'de' ? 'Dann' : 'Then'}</span>}</li>)}
            </ol>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-5 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.68fr_1.32fr] lg:gap-8 lg:px-8">
        <aside className="order-2 space-y-4 lg:order-1 lg:mt-12">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-800">{language === 'de' ? 'Was Sie brauchen' : 'What to prepare'}</p>
            <div className="mt-5 space-y-4 text-sm text-gray-600">
              <p className="flex gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" /><span>{language === 'de' ? 'Einen aktuellen Lebenslauf und optional Ihre Qualifikationsnachweise.' : 'A current CV and any teaching or language certificates you would like to share.'}</span></p>
              <p className="flex gap-3"><Languages className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" /><span>{language === 'de' ? 'Ihre Deutschkenntnisse und Erfahrung mit Lernenden.' : 'Your German proficiency and experience supporting learners.'}</span></p>
              <p className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" /><span>{language === 'de' ? 'Ihre Verfügbarkeit einschließlich Zeitzone.' : 'Your availability, including your time zone.'}</span></p>
            </div>
          </div>
          <div className="rounded-3xl bg-[#e8eee8] p-5 sm:p-6">
            <div className="flex items-center gap-2 font-bold text-forest-950"><BriefcaseBusiness className="h-4 w-4" />{language === 'de' ? 'Noch Fragen?' : 'Questions first?'}</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">{language === 'de' ? 'Schreiben Sie unserem Team, bevor Sie Ihre Bewerbung absenden.' : 'Talk with our team before you apply.'}</p>
            <Link className="mt-3 inline-flex text-sm font-bold text-forest-900 underline underline-offset-4" to="/contact">{language === 'de' ? 'Kontakt aufnehmen' : 'Contact the team'}</Link>
          </div>
        </aside>

        <section className="order-1 rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-forest-950/5 sm:p-8 lg:order-2">
          {submitted ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></div>
              <h2 className="mt-5 font-heading text-2xl font-black text-gray-950">{text.successTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">{text.successText}</p>
              <Button className="mt-6" onClick={() => { setSubmitted(false); setCv(null); setCertificates([]); }}>{text.another}</Button>
            </div>
          ) : (
            <>
              <div className="mb-7 border-b border-gray-100 pb-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-forest-800">{language === 'de' ? 'Bewerbung' : 'Application'}</p><h2 className="mt-1 font-heading text-2xl font-black text-gray-950">{text.formTitle}</h2><p className="mt-2 text-sm text-gray-500">{text.formHint}</p></div>
              {error && <p role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
              <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label={text.first} autoComplete="given-name" required maxLength={60} value={form.firstName} onChange={event => update('firstName', event.target.value)} />
                  <Input label={text.last} autoComplete="family-name" required maxLength={60} value={form.lastName} onChange={event => update('lastName', event.target.value)} />
                  <Input label={text.email} type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={event => update('email', event.target.value)} />
                  <Input label={text.phone} type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={event => update('phone', event.target.value)} />
                  <label className="block space-y-1.5"><span className="block text-xs font-bold tracking-wide text-gray-700">{text.level}</span><select required value={form.germanProficiency} onChange={event => update('germanProficiency', event.target.value)} className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-800/15"><option value="">{text.selectLevel}</option>{proficiencyValues.map((value, index) => <option key={value} value={value}>{text.levels[index]}</option>)}</select></label>
                  <Input label={text.years} type="number" min="0" max="60" required value={form.teachingExperienceYears} onChange={event => update('teachingExperienceYears', event.target.value)} />
                </div>

                <Textarea label={text.qualifications} required minLength={2} maxLength={4000} rows={3} value={form.qualifications} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => update('qualifications', event.target.value)} />
                <Textarea label={text.specialization} required minLength={2} maxLength={2000} rows={3} value={form.specialization} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => update('specialization', event.target.value)} />
                <Textarea label={text.availability} required minLength={2} maxLength={2000} rows={2} value={form.availability} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => update('availability', event.target.value)} />
                <Textarea label={text.motivation} required minLength={20} maxLength={5000} rows={5} helperText={text.motivationHint} value={form.motivation} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => update('motivation', event.target.value)} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4"><span className="flex items-center gap-2 text-sm font-bold text-gray-800"><UploadCloud className="h-4 w-4 text-forest-800" />{text.cv}</span><span className="mt-1 block text-xs text-gray-500">{text.uploadHint}</span><input required type="file" accept={accept} onChange={event => setCv(event.target.files?.[0] || null)} className="mt-3 block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-forest-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />{cv && <span className="mt-2 block truncate text-xs font-semibold text-forest-900">{cv.name}</span>}</label>
                  <label className="block rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4"><span className="flex items-center gap-2 text-sm font-bold text-gray-800"><FileText className="h-4 w-4 text-forest-800" />{text.certs}</span><span className="mt-1 block text-xs text-gray-500">{text.uploadHint}</span><input type="file" multiple accept={accept} onChange={event => setCertificates(Array.from(event.target.files || []).slice(0, 3))} className="mt-3 block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-xs file:font-bold file:text-gray-800" />{certificates.length > 0 && <span className="mt-2 block text-xs font-semibold text-forest-900">{certificates.length} {language === 'de' ? 'Datei(en) ausgewählt' : 'file(s) selected'}</span>}</label>
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-[#f6f7f3] p-4 text-sm leading-6 text-gray-600"><input type="checkbox" required checked={form.consentToPrivacy} onChange={event => update('consentToPrivacy', event.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 accent-forest-900" /><span>{text.consent} <Link to="/privacy" className="font-bold text-forest-900 underline underline-offset-2">{language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}</Link>.</span></label>
                <Button type="submit" size="lg" isLoading={loading} className="w-full sm:w-auto"><span className="inline-flex items-center gap-2">{loading ? text.sending : text.submit}<ArrowRight className="h-4 w-4" /></span></Button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
