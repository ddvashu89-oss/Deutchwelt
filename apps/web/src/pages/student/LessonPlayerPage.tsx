import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Volume2,
  VolumeX,
  PlayCircle,
  Award,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

export function LessonPlayerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [exerciseResult, setExerciseResult] = useState<any>(null);
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setExerciseResult(null);
      setUserAnswers({});
      try {
        const res: any = await api.get(`/lessons/${lessonId}`);
        if (res.success) {
          setLesson(res.lesson);
          setCompleted(res.lesson.isCompleted || false);
        }
      } catch (e) {
        console.error('Error fetching lesson:', e);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonId]);

  const handleOptionSelect = (questionId: string, optionLabel: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionLabel
    }));
  };

  const handleTextAnswerChange = (questionId: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const submitExercise = async (exerciseId: string) => {
    setSubmittingExercise(true);
    try {
      const answersPayload = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      }));

      const res: any = await api.post(`/exercises/${exerciseId}/attempts`, {
        answers: answersPayload
      });

      if (res.success) {
        setExerciseResult(res.attempt);
        if (res.attempt.passed) {
          setCompleted(true);
        }
      }
    } catch (e) {
      console.error('Error submitting exercise:', e);
    } finally {
      setSubmittingExercise(false);
    }
  };

  const markComplete = async () => {
    setCompleting(true);
    try {
      const res: any = await api.post(`/lessons/${lessonId}/complete`, {
        timeSpentMinutes: lesson?.durationMinutes || 15
      });
      if (res.success) {
        setCompleted(true);
      }
    } catch (e) {
      console.error('Error marking lesson complete:', e);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 rounded-2xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)]" />
        <Skeleton className="h-20 w-full rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)]" />
        <Skeleton className="h-64 w-full rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)]" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-slate-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Lesson Not Found</h2>
        <Link to="/student/courses">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Return to Courses
          </button>
        </Link>
      </div>
    );
  }

  const { unit, exercises, contentBlocks, navigation } = lesson;
  const course = unit?.course;

  return (
    <div className="max-w-4xl mx-auto space-y-7 sm:space-y-8 pb-16 font-sans">
      {/* 1. TOP NAVIGATION & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center text-xs text-slate-400 gap-1.5 flex-wrap">
          <Link to="/student/courses" className="hover:text-emerald-400 transition-colors">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          {course && (
            <>
              <Link to="/student/courses" className="hover:text-emerald-400 transition-colors font-medium truncate max-w-xs">
                {course.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </>
          )}
          <span className="font-semibold text-white truncate">{lesson.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {completed && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> {lesson.durationMinutes} min
          </span>
        </div>
      </div>

      {/* 2. LESSON TITLE HEADER */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          {unit?.title || 'Lesson Unit'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">{lesson.description}</p>
      </div>

      {/* 3. CONTENT BLOCKS */}
      <div className="space-y-6 sm:space-y-8">
        {contentBlocks && contentBlocks.length > 0 ? (
          contentBlocks.map((block: any) => (
            <div key={block.id} className="bg-[#0B1325] rounded-3xl p-6 sm:p-8 border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 space-y-4">
              {block.title && (
                <h3 className="text-xl font-heading font-black text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                  {block.title}
                </h3>
              )}

              {/* Render Rich Text Content */}
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                {block.content}
              </div>

              {/* Listening Transcript Option */}
              {block.transcript && (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <button
                    type="button"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    {showTranscript ? 'Hide Audio Transcript' : 'Show German Audio Transcript'}
                  </button>
                  {showTranscript && (
                    <div className="mt-3 p-4 bg-[#0B0F21] rounded-2xl border border-[rgba(255,255,255,0.08)] text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                      {block.transcript}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : null}
      </div>

      {/* 4. INTERACTIVE EXERCISE ENGINE SECTION */}
      {exercises && exercises.length > 0 && (
        <div className="space-y-6 pt-4">
          {exercises.map((exercise: any) => (
            <div key={exercise.id} className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#0B1325] overflow-hidden shadow-xl shadow-black/40">
              <div className="bg-[#101B33] p-6 text-white flex items-center justify-between border-b border-[rgba(255,255,255,0.08)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Practice Engine</span>
                  </div>
                  <h3 className="text-xl font-heading font-black mt-1 text-white">{exercise.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{exercise.description}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0B0F21] text-emerald-400 border border-[rgba(255,255,255,0.08)]">
                  Pass: {exercise.passingScore}%
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {exercise.questions?.map((q: any, qIdx: number) => {
                  const questionResult = exerciseResult?.breakdown?.find((b: any) => b.questionId === q.id);

                  return (
                    <div key={q.id} className="space-y-3 pb-6 border-b border-[rgba(255,255,255,0.08)] last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Question {qIdx + 1} ({q.points} pts)
                          </span>
                          <p className="text-base font-bold text-white whitespace-pre-line">{q.prompt}</p>
                          {q.instructions && (
                            <p className="text-xs text-slate-400 italic">{q.instructions}</p>
                          )}
                        </div>

                        {/* Result Badge after submission */}
                        {questionResult && (
                          <div className="shrink-0">
                            {questionResult.isCorrect ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{questionResult.pointsEarned} pts)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect (0 pts)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Multiple Choice / True-False Options */}
                      {q.options && q.options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.options.map((opt: any) => {
                            const isSelected = userAnswers[q.id] === opt.label;
                            let btnStyle = 'border-[rgba(255,255,255,0.08)] bg-[#0B0F21] text-slate-200 hover:border-slate-500 hover:bg-[#101B33]/40';

                            if (isSelected) {
                              btnStyle = 'border-emerald-500 bg-[#16233B] text-emerald-300 font-bold ring-2 ring-emerald-500/20';
                            }

                            if (questionResult) {
                              if (opt.label === questionResult.correctAnswer) {
                                btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                              } else if (isSelected && !questionResult.isCorrect) {
                                btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
                              }
                            }

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                disabled={Boolean(exerciseResult)}
                                onClick={() => handleOptionSelect(q.id, opt.label)}
                                className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt.label}</span>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600'}`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Fill in the blank input */
                        <div className="pt-2 max-w-sm">
                          <input
                            type="text"
                            disabled={Boolean(exerciseResult)}
                            placeholder="Type your answer here..."
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                            className="w-full h-11 px-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}

                      {/* Explanation after submission */}
                      {questionResult && questionResult.explanation && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-xs text-slate-300 leading-relaxed">
                          <p className="font-bold text-emerald-400 flex items-center gap-1.5 mb-0.5">
                            <HelpCircle className="w-3.5 h-3.5" /> Explanation:
                          </p>
                          <p>{questionResult.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit / Score Summary */}
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  {exerciseResult ? (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-white text-center">
                        <p className="text-xl font-heading font-black text-emerald-400">{exerciseResult.percentage}%</p>
                        <p className="text-[10px] text-slate-400 uppercase">Score</p>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${exerciseResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {exerciseResult.passed ? 'Super gemacht! You passed this exercise.' : 'Review mistakes and try again.'}
                        </p>
                        <p className="text-xs text-slate-400">
                          Earned {exerciseResult.score} of {exerciseResult.maxScore} points
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => submitExercise(exercise.id)}
                      disabled={submittingExercise || Object.keys(userAnswers).length === 0}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      {submittingExercise ? 'Checking...' : 'Check Answers & Submit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. BOTTOM ACTIONS & LESSON NAVIGATION */}
      <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {navigation?.prevLesson ? (
            <Link to={`/lessons/${navigation.prevLesson.id}`}>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-200 border border-[#2D385E] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Lesson
              </button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-3">
          {!completed && (
            <button
              type="button"
              onClick={markComplete}
              disabled={completing}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completing ? 'Completing...' : 'Mark as Completed'}</span>
            </button>
          )}

          {navigation?.nextLesson ? (
            <Link to={`/lessons/${navigation.nextLesson.id}`}>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Next Lesson</span> <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          ) : (
            course && (
              <Link to="/student/courses">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>Complete Unit & Return</span> <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonPlayerPage;
