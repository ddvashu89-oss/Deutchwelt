import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ArticleBadge } from '../../components/ui/ArticleBadge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
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

  // Submit Leitner SRS response (quality 1 = fail, 3 = good, 5 = easy)
  const submitSRSResponse = async (quality: number) => {
    const activeWord = words[currentIndex];
    if (!activeWord) return;

    setUpdatingProgress(true);
    try {
      const res: any = await api.post(`/vocabulary/${activeWord.id}/progress`, { quality });
      if (res.success) {
        // Update local word progress
        const updated = [...words];
        updated[currentIndex].progress = res.progress;
        setWords(updated);

        // Move to next card
        setIsFlipped(false);
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setCurrentIndex(0); // Loop back
        }
      }
    } catch (e) {
      console.error('Error updating progress:', e);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const currentWord = words[currentIndex];

  // Calculate box counts
  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  words.forEach(w => {
    const box = w.progress?.box || 1;
    if (box >= 1 && box <= 5) boxCounts[box as keyof typeof boxCounts]++;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HEADER & MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="default" className="uppercase font-bold tracking-wider text-[10px]">
            Spaced Repetition Engine
          </Badge>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight mt-1">
            German Vocabulary Trainer
          </h1>
          <p className="text-xs text-dark-muted">
            Master noun genders (der, die, das) and build permanent active recall with the 5-box Leitner system.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full self-start sm:self-auto border border-gray-200/70">
          <button
            onClick={() => setMode('flashcards')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'flashcards' ? 'bg-forest-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Karteikarten (Flashcards)
          </button>
          <button
            onClick={() => setMode('bank')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'bank' ? 'bg-forest-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Wortschatz-Tabelle
          </button>
        </div>
      </div>

      {/* 2. LEITNER BOX PROGRESSION VISUALIZER */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 p-4 rounded-2xl bg-white border border-gray-200/90 shadow-subtle text-center">
        {[1, 2, 3, 4, 5].map(b => (
          <div key={b} className={`p-2.5 rounded-xl border ${b === 5 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark-muted block">
              Box {b} {b === 5 ? '★' : ''}
            </span>
            <span className="text-xl sm:text-2xl font-black text-navy">{boxCounts[b as keyof typeof boxCounts]}</span>
            <span className="text-[9px] text-gray-400 block mt-0.5">
              {b === 1 ? 'Every Day' : b === 2 ? 'Every 3d' : b === 3 ? 'Every 7d' : b === 4 ? 'Every 14d' : 'Mastered'}
            </span>
          </div>
        ))}
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search German or English / Hindi terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-navy"
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
            className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="">All Articles</option>
            <option value="DER">der (Masculine)</option>
            <option value="DIE">die (Feminine)</option>
            <option value="DAS">das (Neuter)</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchVocabulary}>
            Filter
          </Button>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CONTENT */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
          <Skeleton className="h-48 max-w-md mx-auto rounded-2xl" />
        </div>
      ) : words.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
          <Layers className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-navy">No vocabulary words found</h3>
          <p className="text-xs text-dark-muted">Try clearing your search terms or filters above.</p>
        </div>
      ) : mode === 'flashcards' && currentWord ? (
        /* FLASHCARD MODE */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-dark-muted px-2">
            <span>Word {currentIndex + 1} of {words.length}</span>
            <span className="font-bold text-navy">Leitner Box: {currentWord.progress?.box || 1}</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] sm:min-h-[340px] rounded-3xl bg-white border border-gray-200/90 shadow-card hover:shadow-card-hover p-8 sm:p-10 flex flex-col justify-between transition-all select-none relative overflow-hidden"
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
                      className="p-2 rounded-full hover:bg-gray-100 text-dark-muted hover:text-navy transition-colors"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="w-5 h-5 text-germanRed" />
                    </button>
                    <span className="text-xs font-mono text-gray-400">{currentWord.ipa || ''}</span>
                  </div>
                </div>

                <div className="text-center my-6 space-y-2">
                  <h2 className="text-4xl sm:text-5xl font-black text-navy tracking-tight">
                    {currentWord.german}
                  </h2>
                  {currentWord.plural && (
                    <p className="text-xs text-dark-muted font-medium">Plural: <span className="font-bold text-navy">{currentWord.plural}</span></p>
                  )}
                  <p className="text-xs text-gray-400 mt-2 italic flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-germanRed" /> Click anywhere to reveal English & Hindi translation
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-dark-muted pt-4 border-t border-gray-100">
                  <span className="bg-gray-100 px-2.5 py-1 rounded font-semibold">{currentWord.category}</span>
                  <Badge variant="outline">{currentWord.level}</Badge>
                </div>
              </>
            ) : (
              /* Back of Card: Translation & Context Sentences */
              <>
                <div className="flex items-center justify-between text-xs font-bold text-germanRed">
                  <span>Translation & Meaning</span>
                  <ArticleBadge article={currentWord.article} size="sm" />
                </div>

                <div className="text-center my-4 space-y-1.5">
                  <h3 className="text-3xl font-extrabold text-navy">{currentWord.english}</h3>
                  {currentWord.hindi && (
                    <p className="text-base font-semibold text-gray-600 font-sans">{currentWord.hindi}</p>
                  )}
                </div>

                {/* Example sentence */}
                <div className="p-4 rounded-2xl bg-canvas border border-gray-200 text-xs space-y-1">
                  <p className="font-bold text-forest-900">Beispiel (In Context):</p>
                  <p className="italic text-gray-800 font-medium leading-relaxed">"{currentWord.exampleSentenceDe}"</p>
                  <p className="text-gray-500">{currentWord.exampleSentenceEn}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-dark-muted pt-3 border-t border-gray-100">
                  <span>Part of Speech: {currentWord.partOfSpeech}</span>
                  <span className="text-gray-400 italic">Rate your recall below</span>
                </div>
              </>
            )}
          </div>

          {/* Leitner Confidence Buttons */}
          <div className="space-y-2">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-dark-muted">
              How well did you know this word?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => submitSRSResponse(1)}
                isLoading={updatingProgress}
                className="font-bold text-red-700 border-red-200 hover:bg-red-50 flex flex-col py-3 h-auto"
              >
                <span>Again (Reset)</span>
                <span className="text-[10px] font-normal text-red-500">Box 1 • Review Soon</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => submitSRSResponse(3)}
                isLoading={updatingProgress}
                className="font-bold text-blue-700 border-blue-200 hover:bg-blue-50 flex flex-col py-3 h-auto"
              >
                <span>Good (Advance)</span>
                <span className="text-[10px] font-normal text-blue-500">+1 Box</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => submitSRSResponse(5)}
                isLoading={updatingProgress}
                className="font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex flex-col py-3 h-auto"
              >
                <span>Easy (Mastered)</span>
                <span className="text-[10px] font-normal text-emerald-600">Advance to Box 5</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* WORD BANK TABLE MODE */
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white text-xs uppercase font-bold tracking-wider">
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
              <tbody className="divide-y divide-gray-100 text-dark">
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <ArticleBadge article={w.article} size="sm" />
                    </td>
                    <td className="p-4 font-bold text-navy">
                      {w.german}
                      {w.plural && <span className="block text-xs font-normal text-dark-muted">pl: {w.plural}</span>}
                    </td>
                    <td className="p-4 font-medium">{w.english}</td>
                    <td className="p-4 text-gray-500 font-sans">{w.hindi || '—'}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] font-bold">{w.level}</Badge>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-navy text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Box {w.progress?.box || 1}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => speakGerman(w.german)}
                        className="p-1.5 rounded-lg text-dark-muted hover:text-germanRed hover:bg-gray-100 transition-colors"
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
