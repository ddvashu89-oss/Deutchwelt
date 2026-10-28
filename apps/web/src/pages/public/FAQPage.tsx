import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge.js';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="default" className="uppercase font-bold tracking-wider">Help & Guidance</Badge>
        <h1 className="text-4xl font-extrabold text-navy">Frequently Asked Questions</h1>
        <p className="text-base text-dark-muted">
          Everything you need to know about DeutschWelt courses, examinations, and methodology.
        </p>

        {/* Search */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search topics (e.g., exams, B1, speaking)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-subtle">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-navy hover:text-germanRed transition-colors"
            >
              <div className="pr-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  {faq.category}
                </span>
                <span>{faq.q}</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openIndex === idx ? 'rotate-180 text-germanRed' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 pt-0 text-sm text-dark-muted leading-relaxed border-t border-gray-50">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
