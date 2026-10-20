import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
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

  const fetchPromptsAndAttempts = async () => {
    try {
      setLoading(true);
      const [resP, resA]: any = await Promise.all([
        api.get('/speaking/prompts'),
        api.get('/speaking/my-attempts')
      ]);

      if (resP.success) {
        setPrompts(resP.prompts);
        if (resP.prompts.length > 0 && !selectedPrompt) {
          setSelectedPrompt(resP.prompts[0]);
        }
      }
      if (resA.success) {
        setMyAttempts(resA.attempts);
      }
    } catch (e) {
      console.error('Error fetching speaking prompts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptsAndAttempts();
  }, []);

  // Start Audio Recording
  const startRecording = async () => {
    setMicError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setAiAnalysis(null);
    setSuccessMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicError('Microphone access was denied or is not supported. You can use the text alternative below.');
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
        formData.append('audio', audioBlob, 'speaking-submission.webm');
        formData.append('durationSeconds', String(recordingSeconds));
      }
      if (textAlternative) {
        formData.append('transcriptText', textAlternative);
      }

      const res: any = await api.upload(`/speaking/prompts/${selectedPrompt.id}/attempts`, formData);
      if (res.success) {
        setSuccessMessage('Recording successfully submitted! An academic instructor will evaluate your pronunciation and grammar.');
        resetRecording();
        fetchPromptsAndAttempts();
      }
    } catch (e: any) {
      console.error('Error submitting speaking attempt:', e);
      setMicError(e.message || 'Failed to upload speaking attempt.');
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
    <div className="space-y-8 pb-16">
      {/* 1. HEADER */}
      <div className="space-y-2">
        <Badge variant="germanRed" className="uppercase font-bold tracking-wider text-[10px]">
          Audio & Oral Expression
        </Badge>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">
          German Speaking Practice Lab
        </h1>
        <p className="text-xs text-dark-muted max-w-2xl leading-relaxed">
          Record oral answers to Goethe exam scenarios. Listen back to your pronunciation and receive rubric-graded feedback from certified German instructors.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 2. PROMPT SELECTOR (LEFT COLUMN) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark-muted">Select Scenario</h3>
            <div className="space-y-3">
              {prompts.map(p => {
                const isSelected = selectedPrompt?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPrompt(p); resetRecording(); }}
                    className={`w-full p-4 rounded-3xl border text-left transition-all ${
                      isSelected
                        ? 'border-forest-900 bg-forest-900 text-white shadow-md'
                        : 'border-gray-200/80 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-mint text-forest-950' : 'bg-gray-100 text-gray-800'}`}>
                        {p.level}
                      </span>
                      <span className={`text-[11px] ${isSelected ? 'text-emerald-100/70' : 'text-gray-400'}`}>
                        {p.minDurationSeconds}s – {p.maxDurationSeconds}s
                      </span>
                    </div>
                    <p className="text-sm font-bold leading-snug">{p.title}</p>
                    <p className={`text-xs mt-1 truncate ${isSelected ? 'text-emerald-100/70' : 'text-gray-500'}`}>{p.topic}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ACTIVE RECORDING LAB (RIGHT COLUMN) */}
          {selectedPrompt && (
            <div className="lg:col-span-8 space-y-6">
              {/* Scenario Details */}
              <Card className="border-gray-200/80 bg-white p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                      Szenario ({selectedPrompt.level})
                    </span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Ziel-Dauer: {selectedPrompt.minDurationSeconds}–{selectedPrompt.maxDurationSeconds}s
                    </span>
                  </div>
                  <h2 className="text-2xl font-heading font-black text-gray-950 mt-1">{selectedPrompt.title}</h2>
                  <p className="text-sm text-gray-700 mt-2 bg-canvas p-4 rounded-2xl border border-gray-200/80 leading-relaxed">
                    {selectedPrompt.scenario}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Instructions:</h4>
                  <p className="text-xs text-dark leading-relaxed">{selectedPrompt.instructions}</p>
                </div>

                {/* Sample German Answer Accordion */}
                {selectedPrompt.sampleAnswerDe && (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-1">
                    <p className="font-bold text-navy flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-germanRed" /> Musterantwort (Sample Answer):
                    </p>
                    <p className="italic text-navy leading-relaxed">"{selectedPrompt.sampleAnswerDe}"</p>
                    {selectedPrompt.sampleAnswerEn && (
                      <p className="text-dark-muted mt-1">{selectedPrompt.sampleAnswerEn}</p>
                    )}
                  </div>
                )}

                {/* Microphone Recording Studio */}
                <div className="pt-6 border-t border-gray-100 space-y-6">
                  {micError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                    {isRecording ? (
                      /* Live Recording Pulse */
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-germanRed flex items-center justify-center text-white shadow-lg">
                            <Mic className="w-6 h-6 animate-bounce" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-mono text-3xl font-black text-navy">{formatSeconds(recordingSeconds)}</span>
                          <p className="text-xs text-germanRed font-bold">Recording live German speech...</p>
                        </div>
                        <Button variant="danger" size="md" onClick={stopRecording}>
                          <Square className="w-4 h-4 mr-1" /> Stop Recording
                        </Button>
                      </div>
                    ) : audioUrl ? (
                      /* Playback Preview */
                      <div className="w-full max-w-md space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200 mx-auto w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recording ready ({formatSeconds(recordingSeconds)})
                        </div>

                        <audio src={audioUrl} controls className="w-full h-11 rounded-lg" />

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <Button variant="outline" size="sm" onClick={resetRecording}>
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-record
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAIAnalyze}
                            isLoading={analyzingAI}
                            className="bg-navy hover:bg-navy-700 text-white font-bold shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-germanGold" /> Instant AI Pronunciation Check
                          </Button>
                          <Button variant="secondary" size="sm" onClick={handleSubmit} isLoading={submitting}>
                            <Upload className="w-3.5 h-3.5 mr-1" /> Submit for Teacher Review
                          </Button>
                        </div>

                        {/* Interactive AI Speech Evaluation Results */}
                        {aiAnalysis && (
                          <div className="mt-6 p-5 rounded-2xl bg-white border border-gray-200/90 shadow-md text-left space-y-4 animate-slide-up">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                  <Award className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-navy">KI-Aussprachebewertung (AI Analysis)</h4>
                                  <p className="text-[11px] text-dark-muted">CEFR Goethe Standard Phonetics</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-black text-navy">{aiAnalysis.overallScore}%</span>
                                <p className="text-[10px] uppercase font-bold text-emerald-600">Oral Proficiency</p>
                              </div>
                            </div>

                            {/* Sub-Scores */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] text-dark-muted uppercase font-bold">Pronunciation</p>
                                <p className="text-base font-extrabold text-navy">{aiAnalysis.pronunciationScore}%</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] text-dark-muted uppercase font-bold">Fluency</p>
                                <p className="text-base font-extrabold text-navy">{aiAnalysis.fluencyScore}%</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] text-dark-muted uppercase font-bold">Grammar</p>
                                <p className="text-base font-extrabold text-navy">{aiAnalysis.grammarScore}%</p>
                              </div>
                            </div>

                            {/* Word-by-Word Phonetic Breakdown */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-navy uppercase tracking-wider">
                                Wort-für-Wort Phonetik (Word Feedback):
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {aiAnalysis.wordFeedback.map((wf: any, i: number) => (
                                  <span
                                    key={i}
                                    title={wf.phoneticTip}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-help border transition-all ${
                                      wf.status === 'mastered'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : wf.status === 'acceptable'
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                                    }`}
                                  >
                                    {wf.word} {wf.status === 'mastered' ? '✓' : wf.status === 'needs_practice' ? '⚡' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Coach Recommendations */}
                            <div className="p-3.5 rounded-xl bg-navy-50/50 border border-navy-100 space-y-1.5 text-xs">
                              <p className="font-bold text-navy flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-germanRed" /> AI Tutor Recommendations:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-dark-muted leading-relaxed">
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
                        <div className="w-16 h-16 rounded-full bg-navy-100 text-navy flex items-center justify-center mx-auto">
                          <Mic className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy">Ready to record?</p>
                          <p className="text-xs text-dark-muted mt-0.5">Click below to allow browser microphone access.</p>
                        </div>
                        <Button variant="secondary" size="md" onClick={startRecording} className="font-bold shadow-md">
                          <Mic className="w-4 h-4 mr-1" /> Start Audio Recording
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Text alternative */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                      Text Alternative (Optional or Backup)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="If microphone is unavailable, you can type your German response here..."
                      value={textAlternative}
                      onChange={(e) => setTextAlternative(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                    {!audioBlob && textAlternative.trim().length > 10 && (
                      <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={submitting} className="mt-2">
                        Submit Text Response
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Past Submissions for this Student */}
              {myAttempts.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-navy">My Previous Speaking Submissions</h3>
                  <div className="space-y-3">
                    {myAttempts.map(att => (
                      <Card key={att.id} className="p-5 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-navy">{att.prompt?.title || 'Speaking Prompt'}</span>
                          <Badge variant={att.status === 'GRADED' ? 'success' : 'default'} className="text-[10px]">
                            {att.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-dark-muted">Submitted on: {new Date(att.submittedAt).toLocaleDateString()}</p>

                        {/* Audio playback */}
                        {att.audioUrl && (
                          <div className="my-3">
                            <audio src={att.audioUrl} controls className="w-full h-9" />
                          </div>
                        )}

                        {att.teacherFeedback && (
                          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-emerald-900 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-700" /> Instructor Feedback (Score: {att.score}/100):
                            </p>
                            <p className="text-dark leading-relaxed">{att.teacherFeedback}</p>
                          </div>
                        )}
                      </Card>
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
