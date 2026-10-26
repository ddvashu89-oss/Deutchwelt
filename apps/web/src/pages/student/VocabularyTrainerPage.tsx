import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ArticleBadge } from '../../components/ui/ArticleBadge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Layers,
  Search,
  Filter,
  Volume2,
  RotateCw,
  Check,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export function VocabularyTrainerPage() {
  const [words, setWords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'bank' | 'flashcards'>('flashcards');

  // Filters
  const [levelFilter, setLevelFilter] = useState('');
  const [articleFilter, setArticleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (levelFilter) params.level = levelFilter;
      if (articleFilter) params.article = articleFilter;
      if (search) params.search = search;

      const [resWords, resCats]: any = await Promise.all([
        api.get('/vocabulary', params),
        api.get('/vocabulary/categories')
      ]);

      if (resWords.success) {
        setWords(resWords.words);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
      if (resCats.success) {
        setCategories(resCats.categories);
      }
    } catch (e) {
      console.error('Error loading vocabulary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, [levelFilter, articleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVocabulary();
  };

  // Browser Speech Synthesis pronunciation playback
  const speakGerman = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit Leitner Box update (Box 1 to 5)
  const submitSRSResponse = async (targetBox: number) => {
    if (!words[currentIndex]) return;
    setUpdatingProgress(true);

    try {
      const currentWord = words[currentIndex];
      const res: any = await api.post('/vocabulary/progress', {
        wordId: currentWord.id,
        box: targetBox,
        status: targetBox >= 4 ? 'MASTERED' : 'LEARNING'
      });

      if (res.success) {
        // Update local state for immediate feedback
        const updated = [...words];
        updated[currentIndex] = {
          ...updated[currentIndex],
          progress: res.progress
        };
        setWords(updated);

        // Advance to next card
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setCurrentIndex(0); // Cycle back to beginning
        }
        setIsFlipped(false);
      }
    } catch (e) {
      console.error('Error submitting SRS response:', e);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const currentWord = words[currentIndex];

  // Leitner Box counts
  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  words.forEach(w => {
    const box = w.progress?.box || 1;
    if (box >= 1 && box <= 5) boxCounts[box as keyof typeof boxCounts]++;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* 1. HEADER & MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              Spaced Repetition Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            German Vocabulary Trainer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Master noun genders (der, die, das) and build permanent active recall with the 5-box Leitner system.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#11172B] p-1.5 rounded-2xl self-start sm:self-auto border border-[#1F2742] shadow-md">
          <button
            onClick={() => setMode('flashcards')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'flashcards'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-[#161E36]'
            }`}
          >
            Karteikarten (Flashcards)
          </button>
          <button
            onClick={() => setMode('bank')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'bank'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-[#161E36]'
            }`}
          >
            Wortschatz-Tabelle
          </button>
        </div>
      </div>

      {/* 2. LEITNER BOX PROGRESSION VISUALIZER */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-xl shadow-black/40 text-center">
        {[1, 2, 3, 4, 5].map(b => (
          <div
            key={b}
            className={`p-2.5 sm:p-4 rounded-2xl border min-w-0 transition-all ${
              b === 5
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-[#0B0F21] border-[#1F2742] text-slate-300'
            }`}
          >
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Box {b} {b === 5 ? '★' : ''}
            </span>
            <span className="text-lg sm:text-2xl font-heading font-black text-white mt-1 block">
              {boxCounts[b as keyof typeof boxCounts]}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 truncate">
              {b === 1 ? 'Daily' : b === 2 ? '3d' : b === 3 ? '7d' : b === 4 ? '14d' : 'Mastered'}
            </span>
          </div>
        ))}
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search German or English / Hindi terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#1F2742] bg-[#11172B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-10 rounded-2xl border border-[#1F2742] bg-[#11172B] px-3.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Levels</option>
            <option value="A1">Level A1</option>
            <option value="A2">Level A2</option>
            <option value="B1">Level B1</option>
            <option value="B2">Level B2</option>
          </select>

          <select
            value={articleFilter}
            onChange={(e) => setArticleFilter(e.target.value)}
            className="h-10 rounded-2xl border border-[#1F2742] bg-[#11172B] px-3.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Articles</option>
            <option value="DER">der (Masculine)</option>
            <option value="DIE">die (Feminine)</option>
            <option value="DAS">das (Neuter)</option>
          </select>

          <button
            type="button"
            onClick={fetchVocabulary}
            className="h-10 px-4 rounded-2xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 border border-[#2D385E] text-xs font-bold transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CONTENT */}
      {loading ? (
        <div className="p-12 text-center bg-[#11172B] rounded-3xl border border-[#1F2742]">
          <Skeleton className="h-48 max-w-md mx-auto rounded-2xl bg-[#0B0F21]" />
        </div>
      ) : words.length === 0 ? (
        <div className="p-16 text-center bg-[#11172B] rounded-3xl border border-[#1F2742] space-y-2">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No vocabulary words found</h3>
          <p className="text-xs text-slate-400">Try clearing your search terms or filters above.</p>
        </div>
      ) : mode === 'flashcards' && currentWord ? (
        /* FLASHCARD MODE */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Word {currentIndex + 1} of {words.length}</span>
            <span className="font-bold text-emerald-400">Leitner Box: {currentWord.progress?.box || 1}</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] sm:min-h-[340px] rounded-3xl bg-[#11172B] border border-[#1F2742] shadow-2xl shadow-black/60 hover:border-emerald-500/40 p-8 sm:p-10 flex flex-col justify-between transition-all select-none relative overflow-hidden group"
          >
            {!isFlipped ? (
              /* Front of Card: German Term & Gender */
              <>
                <div className="flex items-center justify-between">
                  <ArticleBadge article={currentWord.article} size="lg" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); speakGerman(currentWord.german); }}
                      className="p-2.5 rounded-xl bg-[#0B0F21] hover:bg-[#161E36] text-slate-300 hover:text-emerald-400 transition-colors border border-[#1F2742]"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-mono text-slate-400">{currentWord.ipa || ''}</span>
                  </div>
                </div>

                <div className="text-center my-6 space-y-2">
                  <h2 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                    {currentWord.german}
                  </h2>
                  {currentWord.plural && (
                    <p className="text-xs text-slate-400 font-medium">Plural: <span className="font-bold text-emerald-300">{currentWord.plural}</span></p>
                  )}
                  <p className="text-xs text-slate-400 mt-2 italic flex items-center justify-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" /> Click card to reveal English & Hindi translation
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-[#1F2742]">
                  <span className="bg-[#0B0F21] border border-[#1F2742] px-3 py-1 rounded-lg font-semibold text-slate-300">{currentWord.category}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{currentWord.level}</span>
                </div>
              </>
            ) : (
              /* Back of Card: Translation & Context Sentences */
              <>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Translation & Meaning</span>
                  <ArticleBadge article={currentWord.article} size="sm" />
                </div>

                <div className="text-center my-4 space-y-1.5">
                  <h3 className="text-3xl font-heading font-black text-white">{currentWord.english}</h3>
                  {currentWord.hindi && (
                    <p className="text-base font-semibold text-amber-300 font-sans">{currentWord.hindi}</p>
                  )}
                </div>

                {/* Example sentence */}
                <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[#1F2742] text-xs space-y-1">
                  <p className="font-bold text-emerald-400">Beispiel (In Context):</p>
                  <p className="italic text-slate-200 font-medium leading-relaxed">"{currentWord.exampleSentenceDe}"</p>
                  <p className="text-slate-400">{currentWord.exampleSentenceEn}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1F2742]">
                  <span>Part of Speech: <strong className="text-slate-300">{currentWord.partOfSpeech}</strong></span>
                  <span className="text-slate-400 italic">Rate your recall below</span>
                </div>
              </>
            )}
          </div>

          {/* Leitner Confidence Buttons */}
          <div className="space-y-2">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              How well did you know this word?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => submitSRSResponse(1)}
                disabled={updatingProgress}
                className="font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center py-3 px-2 transition-all"
              >
                <span>Again (Reset)</span>
                <span className="text-[10px] font-normal text-rose-400">Box 1 • Review Soon</span>
              </button>

              <button
                type="button"
                onClick={() => submitSRSResponse(3)}
                disabled={updatingProgress}
                className="font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl flex flex-col items-center justify-center py-3 px-2 transition-all"
              >
                <span>Good (Advance)</span>
                <span className="text-[10px] font-normal text-blue-400">+1 Box</span>
              </button>

              <button
                type="button"
                onClick={() => submitSRSResponse(5)}
                disabled={updatingProgress}
                className="font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center py-3 px-2 transition-all"
              >
                <span>Easy (Mastered)</span>
                <span className="text-[10px] font-normal text-emerald-400">Box 5 ★</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* WORD BANK TABLE MODE */
        <div className="bg-[#11172B] rounded-3xl border border-[#1F2742] overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F21] text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-[#1F2742]">
                <tr>
                  <th className="p-4">Article</th>
                  <th className="p-4">German Term</th>
                  <th className="p-4">English</th>
                  <th className="p-4">Hindi</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Leitner Box</th>
                  <th className="p-4 text-right">Pronounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2742] text-slate-200">
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-[#161E36]/60 transition-colors">
                    <td className="p-4">
                      <ArticleBadge article={w.article} size="sm" />
                    </td>
                    <td className="p-4 font-bold text-white">
                      {w.german}
                      {w.plural && <span className="block text-xs font-normal text-slate-400">pl: {w.plural}</span>}
                    </td>
                    <td className="p-4 font-medium">{w.english}</td>
                    <td className="p-4 text-slate-400 font-sans">{w.hindi || '—'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        {w.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                        Box {w.progress?.box || 1}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => speakGerman(w.german)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#0B0F21] transition-colors"
                        title="Listen to native pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabularyTrainerPage;
