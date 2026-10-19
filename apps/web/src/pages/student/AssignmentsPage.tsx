import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  PenTool,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Send,
  Award
} from 'lucide-react';

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/assignments');
      if (res.success) {
        setAssignments(res.assignments);
        if (res.assignments.length > 0) {
          const first = res.assignments[0];
          setSelectedAssignment(first);
          setSubmissionText(first.submission?.content || '');
        }
      }
    } catch (e) {
      console.error('Error fetching assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSelect = (a: any) => {
    setSelectedAssignment(a);
    setSubmissionText(a.submission?.content || '');
    setStatusMessage(null);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedAssignment || !submissionText.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res: any = await api.post(`/assignments/${selectedAssignment.id}/submissions`, {
        content: submissionText,
        isDraft
      });

      if (res.success) {
        setStatusMessage(res.message);
        // Refresh local assignment state
        const updated = assignments.map(a =>
          a.id === selectedAssignment.id ? { ...a, submission: res.submission } : a
        );
        setAssignments(updated);
        setSelectedAssignment((prev: any) => ({ ...prev, submission: res.submission }));
      }
    } catch (e: any) {
      console.error('Error submitting assignment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-2">
        <Badge variant="default" className="uppercase font-bold tracking-wider text-[10px]">
          Written Expression & Homework
        </Badge>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">
          Writing Tasks & Assignments
        </h1>
        <p className="text-xs text-dark-muted">
          Draft and submit formal emails, essays, and descriptions for rubric-based grading by certified instructors.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : assignments.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-navy">No pending assignments</h3>
          <p className="text-xs text-dark-muted mt-1">Your teacher has not published new tasks at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Assignment List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark-muted">Task List</h3>
            {assignments.map(a => {
              const isSelected = selectedAssignment?.id === a.id;
              const hasSubmitted = a.submission?.status === 'SUBMITTED' || a.submission?.status === 'GRADED';

              return (
                <button
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-navy bg-navy text-white shadow-md'
                      : 'border-gray-200 bg-white text-dark hover:border-navy-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isSelected ? 'bg-germanRed text-white' : 'bg-gray-100 text-dark'}`}>
                      {a.level}
                    </span>
                    <span className={`text-[11px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-snug">{a.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/30 text-xs">
                    <span className={isSelected ? 'text-gray-300' : 'text-dark-muted'}>Max: {a.maxPoints} pts</span>
                    {hasSubmitted ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {a.submission?.status}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[11px]">Pending</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Assignment Editor & Feedback */}
          {selectedAssignment && (
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 sm:p-8 border-gray-200 bg-white space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-germanRed">
                      Writing Assignment ({selectedAssignment.level})
                    </span>
                    <span className="text-xs text-dark-muted font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Deadline: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-navy mt-1">{selectedAssignment.title}</h2>
                  <p className="text-sm text-dark-muted mt-2">{selectedAssignment.description}</p>
                </div>

                {/* Instructions Box */}
                <div className="p-4 rounded-xl bg-ivory/60 border border-gray-200 text-xs space-y-1.5">
                  <p className="font-bold text-navy">Aufgabenstellung (Instructions):</p>
                  <p className="text-dark whitespace-pre-line leading-relaxed">{selectedAssignment.instructions}</p>
                </div>

                {/* Rubric Criteria */}
                {selectedAssignment.rubricCriteria && selectedAssignment.rubricCriteria.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Grading Rubric</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedAssignment.rubricCriteria.map((r: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                          <p className="font-bold text-navy">{r.name}</p>
                          <p className="text-dark-muted text-[11px] mt-0.5">{r.description}</p>
                          <span className="text-[10px] text-germanRed font-bold block mt-1">{r.maxPoints} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Writing Submission Editor */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-dark uppercase tracking-wider">
                      Your Written Response (Deutsch)
                    </label>
                    <span className="text-dark-muted font-mono">{submissionText.length} characters</span>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Sehr geehrte Damen und Herren, ich schreibe Ihnen bezüglich..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy leading-relaxed font-sans"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmit(true)}
                      isLoading={submitting}
                    >
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleSubmit(false)}
                      isLoading={submitting}
                      disabled={submissionText.trim().length < 10}
                      className="font-bold shadow-md"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Submit for Teacher Grading
                    </Button>
                  </div>
                </div>

                {/* Teacher Feedback Card if Graded */}
                {selectedAssignment.submission?.status === 'GRADED' && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-700" /> Instructor Evaluation
                      </span>
                      <span className="font-mono text-sm font-extrabold text-emerald-800 bg-white px-3 py-0.5 rounded border border-emerald-300">
                        Score: {selectedAssignment.submission.score} / {selectedAssignment.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-xs text-dark whitespace-pre-line leading-relaxed">
                      {selectedAssignment.submission.teacherFeedback}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
