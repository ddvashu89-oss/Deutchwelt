import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Upload,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';

export function SpeakingLabPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [textAlternative, setTextAlternative] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    async function loadSpeakingLab() {
      try {
        setLoading(true);
        const [promptsRes, attemptsRes]: any = await Promise.all([
          api.get('/speaking/prompts'),
          api.get('/speaking/attempts')
        ]);

        if (promptsRes.success) {
          setPrompts(promptsRes.prompts);
          if (promptsRes.prompts.length > 0) {
            setSelectedPrompt(promptsRes.prompts[0]);
          }
        }
        if (attemptsRes.success) {
          setMyAttempts(attemptsRes.attempts);
        }
      } catch (e) {
        console.error('Error loading speaking lab:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSpeakingLab();
  }, []);

  // Start Browser Audio Recording
  const startRecording = async () => {
    setMicError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setAiAnalysis(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use modern Chrome, Firefox, or Safari.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setMicError(err.message || 'Microphone access denied. Please grant browser microphone permissions.');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Reset Recording
  const resetRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setAiAnalysis(null);
    setTextAlternative('');
  };

  // Instant AI Pronunciation Evaluation
  const handleAIAnalyze = async () => {
    if (!selectedPrompt) return;
    setAnalyzingAI(true);
    setMicError(null);
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'speaking-analysis.webm');
        formData.append('durationSeconds', String(recordingSeconds));
      }
      formData.append('promptId', selectedPrompt.id);
      if (textAlternative) {
        formData.append('transcriptText', textAlternative);
      }

      const res: any = await api.upload('/speaking/analyze', formData);
      if (res.success && res.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      setMicError('AI speech evaluation could not complete. You can still submit directly for teacher evaluation.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Submit Speaking Attempt
  const handleSubmit = async () => {
    if (!selectedPrompt) return;
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'speaking-recording.webm');
        formData.append('durationSeconds', String(recordingSeconds));
      }
      formData.append('promptId', selectedPrompt.id);
      if (textAlternative) {
        formData.append('transcriptText', textAlternative);
      }

      const res: any = await api.upload('/speaking/submit', formData);
      if (res.success) {
        setSuccessMessage('Your speaking response has been recorded and submitted to your instructor!');
        // Refresh attempts
        const attemptsRes: any = await api.get('/speaking/attempts');
        if (attemptsRes.success) setMyAttempts(attemptsRes.attempts);
        resetRecording();
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setMicError(err.message || 'Failed to submit audio attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* 1. HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <Mic className="w-3 h-3" />
            Audio & Oral Expression
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
          German Speaking Practice Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Record oral answers to Goethe exam scenarios. Listen back to your pronunciation and receive rubric-graded feedback from certified German instructors.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)]" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* 2. PROMPT SELECTOR (LEFT COLUMN) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Scenario</h3>
            <div className="space-y-3">
              {prompts.map(p => {
                const isSelected = selectedPrompt?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPrompt(p); resetRecording(); }}
                    className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-[#16233B] text-white shadow-xl shadow-black/50 ring-1 ring-emerald-500/30'
                        : 'border-[rgba(255,255,255,0.08)] bg-[#0B1325] text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-[#0B0F21] text-emerald-400 border border-[rgba(255,255,255,0.08)]'}`}>
                        {p.level}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {p.minDurationSeconds}s – {p.maxDurationSeconds}s
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug">{p.title}</p>
                    <p className="text-xs mt-1 truncate text-slate-400">{p.topic}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ACTIVE RECORDING LAB (RIGHT COLUMN) */}
          {selectedPrompt && (
            <div className="lg:col-span-8 space-y-6">
              {/* Scenario Details */}
              <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#0B1325] p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Szenario ({selectedPrompt.level})
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Target: {selectedPrompt.minDurationSeconds}–{selectedPrompt.maxDurationSeconds}s
                    </span>
                  </div>
                  <h2 className="text-2xl font-heading font-black text-white mt-1.5">{selectedPrompt.title}</h2>
                  <p className="text-sm text-slate-200 mt-3 bg-[#0B0F21] p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] leading-relaxed">
                    {selectedPrompt.scenario}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instructions:</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPrompt.instructions}</p>
                </div>

                {/* Sample German Answer Accordion */}
                {selectedPrompt.sampleAnswerDe && (
                  <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-xs space-y-1.5">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Musterantwort (Sample Answer):
                    </p>
                    <p className="italic text-white leading-relaxed">"{selectedPrompt.sampleAnswerDe}"</p>
                    {selectedPrompt.sampleAnswerEn && (
                      <p className="text-slate-400 mt-1">{selectedPrompt.sampleAnswerEn}</p>
                    )}
                  </div>
                )}

                {/* Microphone Recording Studio */}
                <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] space-y-6">
                  {micError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{micError}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="p-8 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center text-center space-y-4">
                    {isRecording ? (
                      /* Live Recording Pulse */
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto animate-pulse border border-rose-500/40">
                          <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg">
                            <Mic className="w-6 h-6 animate-bounce" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-mono text-3xl font-black text-white">{formatSeconds(recordingSeconds)}</span>
                          <p className="text-xs text-rose-400 font-bold">Recording live German speech...</p>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 mx-auto"
                        >
                          <Square className="w-4 h-4 fill-white" /> Stop Recording
                        </button>
                      </div>
                    ) : audioUrl ? (
                      /* Playback Preview */
                      <div className="w-full max-w-md space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/30 mx-auto w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recording ready ({formatSeconds(recordingSeconds)})
                        </div>

                        <audio src={audioUrl} controls className="w-full h-11 rounded-xl" />

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={resetRecording}
                            className="px-4 py-2 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 border border-[#2D385E] text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Re-record
                          </button>
                          <button
                            type="button"
                            onClick={handleAIAnalyze}
                            disabled={analyzingAI}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{analyzingAI ? 'Analyzing...' : 'Instant AI Pronunciation Check'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl bg-[#16233B] hover:bg-[#1E3052] text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{submitting ? 'Submitting...' : 'Submit to Teacher'}</span>
                          </button>
                        </div>

                        {/* Interactive AI Speech Evaluation Results */}
                        {aiAnalysis && (
                          <div className="mt-6 p-5 rounded-2xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)] shadow-xl text-left space-y-4 animate-slide-up">
                            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                                  <Award className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">KI-Aussprachebewertung (AI Analysis)</h4>
                                  <p className="text-[11px] text-slate-400">CEFR Goethe Standard Phonetics</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-heading font-black text-white">{aiAnalysis.overallScore}%</span>
                                <p className="text-[10px] uppercase font-bold text-emerald-400">Oral Proficiency</p>
                              </div>
                            </div>

                            {/* Sub-Scores */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2.5 rounded-xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)]">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Pronunciation</p>
                                <p className="text-base font-extrabold text-white mt-0.5">{aiAnalysis.pronunciationScore}%</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)]">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Fluency</p>
                                <p className="text-base font-extrabold text-white mt-0.5">{aiAnalysis.fluencyScore}%</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)]">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Grammar</p>
                                <p className="text-base font-extrabold text-white mt-0.5">{aiAnalysis.grammarScore}%</p>
                              </div>
                            </div>

                            {/* Word-by-Word Phonetic Breakdown */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Wort-für-Wort Phonetik (Word Feedback):
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {aiAnalysis.wordFeedback.map((wf: any, i: number) => (
                                  <span
                                    key={i}
                                    title={wf.phoneticTip}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-help border transition-all ${
                                      wf.status === 'mastered'
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                        : wf.status === 'acceptable'
                                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                    }`}
                                  >
                                    {wf.word} {wf.status === 'mastered' ? '✓' : wf.status === 'needs_practice' ? '⚡' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Coach Recommendations */}
                            <div className="p-3.5 rounded-xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] space-y-1.5 text-xs">
                              <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> AI Tutor Recommendations:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
                                {aiAnalysis.insights.map((insight: string, i: number) => (
                                  <li key={i}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Initial Start State */
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#101B33] text-emerald-400 flex items-center justify-center mx-auto border border-[rgba(255,255,255,0.08)]">
                          <Mic className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Ready to record?</p>
                          <p className="text-xs text-slate-400 mt-0.5">Click below to allow browser microphone access.</p>
                        </div>
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 mx-auto"
                        >
                          <Mic className="w-4 h-4" /> Start Audio Recording
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Text alternative */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Text Alternative (Optional or Backup)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="If microphone is unavailable, you can type your German response here..."
                      value={textAlternative}
                      onChange={(e) => setTextAlternative(e.target.value)}
                      className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    {!audioBlob && textAlternative.trim().length > 10 && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs mt-2 transition-all"
                      >
                        Submit Text Response
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Past Submissions for this Student */}
              {myAttempts.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white">My Previous Speaking Submissions</h3>
                  <div className="space-y-3">
                    {myAttempts.map(att => (
                      <div key={att.id} className="p-5 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#0B1325] shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-white">{att.prompt?.title || 'Speaking Prompt'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${att.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                            {att.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Submitted on: {new Date(att.submittedAt).toLocaleDateString()}</p>

                        {/* Audio playback */}
                        {att.audioUrl && (
                          <div className="my-3">
                            <audio src={att.audioUrl} controls className="w-full h-9 rounded-lg" />
                          </div>
                        )}

                        {att.teacherFeedback && (
                          <div className="mt-3 p-3 bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] rounded-2xl text-xs space-y-1">
                            <p className="font-bold text-emerald-400 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> Instructor Feedback (Score: {att.score}/100):
                            </p>
                            <p className="text-slate-300 leading-relaxed">{att.teacherFeedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpeakingLabPage;
