import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const allFaqs = [
    {
      category: 'Courses & CEFR Levels',
      q: 'Which level should I enroll in if I studied some German in school?',
      a: 'If you have prior exposure, we recommend taking our diagnostic assessment or speaking with our academic coordinator. Most learners with high school German start comfortably at A2.'
    },
    {
      category: 'Courses & CEFR Levels',
      q: 'What is the difference between A1, A2, B1, and B2?',
      a: 'A1 covers survival basics and introductions. A2 adds past tense narrative and daily errands. B1 provides independent fluency required for citizenship and naturalization. B2 qualifies you for German university degree programs and professional workplace roles.'
    },
    {
      category: 'Examinations',
      q: 'Does DeutschWelt issue official Goethe-Institut certificates?',
      a: 'Official Goethe-Zertifikat and telc exams must be physically proctored at accredited testing centers. DeutschWelt prepares you to pass these examinations on your first attempt with full mock test modules.'
    },
    {
      category: 'Practice Tools',
      q: 'How does the Speaking Practice Lab work?',
      a: 'You receive guided prompts corresponding to your level. You record your response using your microphone directly in the browser, listen back, and submit it for certified teacher review and rubric grading.'
    },
    {
      category: 'Practice Tools',
      q: 'Can I access DeutschWelt on my mobile phone or tablet?',
      a: 'Yes! DeutschWelt is fully responsive and designed to work seamlessly across smartphones, iPads/tablets, laptops, and desktops.'
    }
  ];

  const filteredFaqs = allFaqs.filter(
    f => f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-slate-100 font-sans">
      <div className="text-center space-y-3">
        <span className="inline-flex px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          Help & Guidance
        </span>
        <h1 className="text-4xl font-heading font-black text-white tracking-tight">Frequently Asked Questions</h1>
        <p className="text-base text-slate-400">
          Everything you need to know about DeutschWelt courses, examinations, and methodology.
        </p>

        {/* Search */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search topics (e.g., exams, B1, speaking)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-white/10 bg-[#0B1325] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-white/[0.08] bg-[#0B1325] overflow-hidden shadow-lg transition-all hover:border-white/20">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:text-blue-400 transition-colors"
            >
              <div className="pr-4">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1">
                  {faq.category}
                </span>
                <span>{faq.q}</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openIndex === idx ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQPage;
