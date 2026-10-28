import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
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
        setExerciseResult(res.result);
        if (res.result.passed) {
          markComplete();
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
      const res: any = await api.post(`/lessons/${lessonId}/complete`, { timeSpentSeconds: 900 });
      if (res.success) {
        setCompleted(true);
      }
    } catch (e) {
      console.error('Error marking complete:', e);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-bold text-navy">Lesson Not Found</h2>
        <Link to="/courses">
          <Button variant="primary">Return to Courses</Button>
        </Link>
      </div>
    );
  }

  const { unit, exercises, contentBlocks, navigation } = lesson;
  const course = unit?.course;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. TOP NAVIGATION & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center text-xs text-dark-muted gap-1.5 flex-wrap">
          <Link to="/courses" className="hover:text-dark">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          {course && (
            <>
              <Link to={`/courses/${course.slug}`} className="hover:text-dark font-medium truncate max-w-xs">
                {course.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </>
          )}
          <span className="font-semibold text-dark truncate">{lesson.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {completed && (
            <Badge variant="success" className="text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
            </Badge>
          )}
          <span className="text-xs text-dark-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-germanRed" /> {lesson.durationMinutes} min
          </span>
        </div>
      </div>

      {/* 2. LESSON TITLE HEADER */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-germanRed">
          {unit?.title || 'Lesson Unit'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm text-dark-muted">{lesson.description}</p>
      </div>

      {/* 3. CONTENT BLOCKS */}
      <div className="space-y-8">
        {contentBlocks && contentBlocks.length > 0 ? (
          contentBlocks.map((block: any) => (
            <div key={block.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtle space-y-4">
              {block.title && (
                <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-germanRed" />
                  {block.title}
                </h3>
              )}

              {/* Render Rich / Markdown Text Content */}
              <div className="prose prose-navy max-w-none text-sm text-dark leading-relaxed whitespace-pre-line">
                {block.content}
              </div>

              {/* Listening Transcript Option */}
              {block.transcript && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-xs font-bold text-navy hover:text-germanRed flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4 text-germanRed" />
                    {showTranscript ? 'Hide Audio Transcript' : 'Show German Audio Transcript'}
                  </button>
                  {showTranscript && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-dark font-mono leading-relaxed whitespace-pre-line">
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
            <Card key={exercise.id} className="border-navy-200 bg-white overflow-hidden shadow-card">
              <div className="bg-navy p-6 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-germanRed-300" />
                    <span className="text-xs uppercase font-bold tracking-wider text-germanRed-300">Practice Engine</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1">{exercise.title}</h3>
                  <p className="text-xs text-gray-300 mt-0.5">{exercise.description}</p>
                </div>
                <Badge variant="outline" className="text-white border-navy-700 bg-navy-800 text-xs">
                  Pass: {exercise.passingScore}%
                </Badge>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-8">
                {exercise.questions?.map((q: any, qIdx: number) => {
                  const questionResult = exerciseResult?.breakdown?.find((b: any) => b.questionId === q.id);

                  return (
                    <div key={q.id} className="space-y-3 pb-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-muted">
                            Question {qIdx + 1} ({q.points} pts)
                          </span>
                          <p className="text-base font-bold text-navy whitespace-pre-line">{q.prompt}</p>
                          {q.instructions && (
                            <p className="text-xs text-dark-muted italic">{q.instructions}</p>
                          )}
                        </div>

                        {/* Result Badge after submission */}
                        {questionResult && (
                          <div className="shrink-0">
                            {questionResult.isCorrect ? (
                              <Badge variant="success" className="text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{questionResult.pointsEarned} pts)
                              </Badge>
                            ) : (
                              <Badge variant="germanRed" className="text-xs flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect (0 pts)
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Multiple Choice / True-False Options */}
                      {q.options && q.options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.options.map((opt: any) => {
                            const isSelected = userAnswers[q.id] === opt.label;
                            let btnStyle = 'border-gray-200 bg-white text-dark hover:border-navy hover:bg-gray-50';

                            if (isSelected) {
                              btnStyle = 'border-navy bg-navy-50 text-navy font-bold ring-2 ring-navy/20';
                            }

                            if (questionResult) {
                              if (opt.label === questionResult.correctAnswer) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isSelected && !questionResult.isCorrect) {
                                btnStyle = 'border-red-400 bg-red-50 text-red-900';
                              }
                            }

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                disabled={Boolean(exerciseResult)}
                                onClick={() => handleOptionSelect(q.id, opt.label)}
                                className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt.label}</span>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-navy bg-navy text-white' : 'border-gray-300'}`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
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
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                          />
                        </div>
                      )}

                      {/* Explanation after submission */}
                      {questionResult && questionResult.explanation && (
                        <div className="mt-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-dark leading-relaxed">
                          <p className="font-bold text-navy flex items-center gap-1.5 mb-0.5">
                            <HelpCircle className="w-3.5 h-3.5 text-germanRed" /> Explanation:
                          </p>
                          <p>{questionResult.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit / Score Summary */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {exerciseResult ? (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-navy text-white text-center">
                        <p className="text-xl font-extrabold">{exerciseResult.percentage}%</p>
                        <p className="text-[10px] text-gray-300 uppercase">Score</p>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${exerciseResult.passed ? 'text-emerald-600' : 'text-germanRed'}`}>
                          {exerciseResult.passed ? 'Super gemacht! You passed this exercise.' : 'Review mistakes and try again.'}
                        </p>
                        <p className="text-xs text-dark-muted">
                          Earned {exerciseResult.score} of {exerciseResult.maxScore} points
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      className="font-bold w-full sm:w-auto shadow-md"
                      onClick={() => submitExercise(exercise.id)}
                      isLoading={submittingExercise}
                      disabled={Object.keys(userAnswers).length === 0}
                    >
                      Check Answers & Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 5. BOTTOM ACTIONS & LESSON NAVIGATION */}
      <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {navigation?.prevLesson ? (
            <Link to={`/lessons/${navigation.prevLesson.id}`}>
              <Button variant="outline" size="md">
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous Lesson
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-3">
          {!completed && (
            <Button
              variant="outline"
              size="md"
              onClick={markComplete}
              isLoading={completing}
              className="font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Mark as Completed
            </Button>
          )}

          {navigation?.nextLesson ? (
            <Link to={`/lessons/${navigation.nextLesson.id}`}>
              <Button variant="secondary" size="md" className="font-bold shadow-md">
                Next Lesson <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            course && (
              <Link to={`/courses/${course.slug}`}>
                <Button variant="primary" size="md" className="font-bold">
                  Complete Unit & Return <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
