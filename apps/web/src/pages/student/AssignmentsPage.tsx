import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
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
    <div className="space-y-7 sm:space-y-8 pb-16 font-sans">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <PenTool className="w-3 h-3" />
            Written Expression & Homework
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
          Writing Tasks & Assignments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Draft and submit formal emails, essays, and descriptions for rubric-based grading by certified instructors.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl bg-[#0B1325] border border-[rgba(255,255,255,0.08)]" />
      ) : assignments.length === 0 ? (
        <div className="p-16 text-center bg-[#0B1325] rounded-3xl border border-[rgba(255,255,255,0.08)]">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No pending assignments</h3>
          <p className="text-xs text-slate-400 mt-1">Your teacher has not published new tasks at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left: Assignment List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Task List</h3>
            {assignments.map(a => {
              const isSelected = selectedAssignment?.id === a.id;
              const hasSubmitted = a.submission?.status === 'SUBMITTED' || a.submission?.status === 'GRADED';

              return (
                <button
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-[#16233B] text-white shadow-xl shadow-black/40 ring-1 ring-emerald-500/30'
                      : 'border-[rgba(255,255,255,0.08)] bg-[#0B1325] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-[#0B0F21] text-emerald-400 border border-[rgba(255,255,255,0.08)]'}`}>
                      {a.level}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">{a.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.08)] text-xs">
                    <span className="text-slate-400">Max: {a.maxPoints} pts</span>
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
              <div className="p-6 sm:p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#0B1325] shadow-xl shadow-black/40 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Writing Assignment ({selectedAssignment.level})
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-heading font-black text-white mt-1.5">{selectedAssignment.title}</h2>
                  <p className="text-sm text-slate-300 mt-2">{selectedAssignment.description}</p>
                </div>

                {/* Instructions Box */}
                <div className="p-4 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-xs space-y-1.5">
                  <p className="font-bold text-emerald-400">Aufgabenstellung (Instructions):</p>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">{selectedAssignment.instructions}</p>
                </div>

                {/* Rubric Criteria */}
                {selectedAssignment.rubricCriteria && selectedAssignment.rubricCriteria.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Grading Rubric</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedAssignment.rubricCriteria.map((r: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-2xl bg-[#0B0F21] border border-[rgba(255,255,255,0.08)] text-xs">
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{r.description}</p>
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">{r.maxPoints} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Writing Submission Editor */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-300 uppercase tracking-wider">
                      Your Written Response (Deutsch)
                    </label>
                    <span className="text-slate-400 font-mono">{submissionText.length} characters</span>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Sehr geehrte Damen und Herren, ich schreibe Ihnen bezüglich..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans transition-all"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-[#1A2238] hover:bg-[#253050] text-slate-300 border border-[#2D385E] text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmit(false)}
                      disabled={submitting || submissionText.trim().length < 10}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Teacher Grading
                    </button>
                  </div>
                </div>

                {/* Teacher Feedback Card if Graded */}
                {selectedAssignment.submission?.status === 'GRADED' && (
                  <div className="p-5 rounded-2xl bg-[#0B0F21] border border-emerald-500/30 space-y-2 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" /> Instructor Evaluation
                      </span>
                      <span className="font-mono text-sm font-extrabold text-emerald-300 bg-emerald-500/10 px-3 py-0.5 rounded-lg border border-emerald-500/20">
                        Score: {selectedAssignment.submission.score} / {selectedAssignment.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                      {selectedAssignment.submission.teacherFeedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignmentsPage;
