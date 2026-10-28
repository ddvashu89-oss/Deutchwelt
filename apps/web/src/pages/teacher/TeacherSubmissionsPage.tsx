import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  PenTool,
  Mic,
  Award,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Volume2
} from 'lucide-react';

export function TeacherSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'writing' | 'speaking'>('writing');
  const [writingSubmissions, setWritingSubmissions] = useState<any[]>([]);
  const [speakingAttempts, setSpeakingAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/teacher/submissions');
      if (res.success) {
        setWritingSubmissions(res.writing);
        setSpeakingAttempts(res.speaking);
      }
    } catch (e) {
      console.error('Error fetching submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openGradingModal = (item: any) => {
    setSelectedItem(item);
    setScore(item.score || 85);
    setFeedback(item.teacherFeedback || 'Sehr gut gearbeitet! Achten Sie auf die Großschreibung der Nomen und die Verbstellung im Nebensatz.');
  };

  const submitGrade = async () => {
    if (!selectedItem) return;
    setSubmittingGrade(true);

    try {
      if (activeTab === 'writing') {
        await api.post(`/teacher/submissions/${selectedItem.id}/grade`, {
          score: Number(score),
          teacherFeedback: feedback
        });
      } else {
        await api.post(`/teacher/speaking/${selectedItem.id}/grade`, {
          score: Number(score),
          teacherFeedback: feedback
        });
      }

      setSelectedItem(null);
      fetchSubmissions();
    } catch (e) {
      console.error('Error submitting grade:', e);
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="default" className="uppercase font-bold tracking-wider text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Faculty Grading Suite
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Student Submissions Review Queue
          </h1>
          <p className="text-xs text-slate-400">
            Assess written texts and listen to audio recordings submitted by students.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('writing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'writing'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Writing ({writingSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('speaking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'speaking'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Speaking ({speakingAttempts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl bg-white/5" />
      ) : activeTab === 'writing' ? (
        /* WRITING SUBMISSIONS */
        <div className="space-y-4">
          {writingSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-[#0B1325] rounded-3xl border border-white/10">
              <p className="text-xs text-slate-400">No writing submissions in queue.</p>
            </div>
          ) : (
            writingSubmissions.map(sub => (
              <Card key={sub.id} className="p-6 border-white/10 bg-[#0B1325] space-y-4 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{sub.assignment?.title || 'Writing Assignment'}</h3>
                    <p className="text-xs text-slate-400">
                      Student: <span className="font-semibold text-slate-200">{sub.user?.firstName} {sub.user?.lastName}</span> ({sub.user?.email}) • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'}>
                    {sub.status}
                  </Badge>
                </div>

                <div className="p-4 bg-[#070D1A] rounded-2xl border border-white/10 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {sub.content}
                </div>

                {sub.status === 'GRADED' && (
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs">
                    <span className="font-bold text-emerald-400">Graded: {sub.score} points</span>
                    <p className="text-slate-300 mt-0.5">{sub.teacherFeedback}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="secondary" size="sm" onClick={() => openGradingModal(sub)}>
                    {sub.status === 'GRADED' ? 'Edit Evaluation' : 'Evaluate & Grade'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* SPEAKING ATTEMPTS */
        <div className="space-y-4">
          {speakingAttempts.length === 0 ? (
            <div className="p-12 text-center bg-[#0B1325] rounded-3xl border border-white/10">
              <p className="text-xs text-slate-400">No speaking attempts in queue.</p>
            </div>
          ) : (
            speakingAttempts.map(att => (
              <Card key={att.id} className="p-6 border-white/10 bg-[#0B1325] space-y-4 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{att.prompt?.title || 'Speaking Prompt'}</h3>
                    <p className="text-xs text-slate-400">
                      Student: <span className="font-semibold text-slate-200">{att.user?.firstName} {att.user?.lastName}</span> ({att.user?.email}) • Submitted: {new Date(att.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={att.status === 'GRADED' ? 'success' : 'warning'}>
                    {att.status}
                  </Badge>
                </div>

                {/* Audio player */}
                {att.audioUrl && (
                  <div className="p-3 bg-[#070D1A] rounded-2xl border border-white/10 flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    <audio src={att.audioUrl} controls className="w-full h-8" />
                  </div>
                )}

                {att.transcriptText && (
                  <div className="p-3 bg-[#070D1A] rounded-2xl border border-white/10 text-xs text-slate-300">
                    <span className="font-bold text-white block mb-0.5">Student Note / Transcript:</span>
                    <p>{att.transcriptText}</p>
                  </div>
                )}

                {att.status === 'GRADED' && (
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs">
                    <span className="font-bold text-emerald-400">Graded: {att.score} / 100</span>
                    <p className="text-slate-300 mt-0.5">{att.teacherFeedback}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="secondary" size="sm" onClick={() => openGradingModal(att)}>
                    {att.status === 'GRADED' ? 'Edit Evaluation' : 'Evaluate & Grade'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* GRADING MODAL DIALOG */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Grade Student Submission"
        description="Provide a numeric score and qualitative teacher feedback."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {selectedItem?.audioUrl && (
            <div className="p-3 bg-[#070D1A] rounded-2xl border border-white/10">
              <p className="text-xs font-bold text-white mb-1.5">Audio Recording Preview:</p>
              <audio src={selectedItem.audioUrl} controls className="w-full h-8" />
            </div>
          )}

          {selectedItem?.content && (
            <div className="p-3 bg-[#070D1A] rounded-2xl border border-white/10 text-xs whitespace-pre-line max-h-48 overflow-y-auto text-slate-200">
              <p className="font-bold text-white mb-1">Student Essay:</p>
              <p>{selectedItem.content}</p>
            </div>
          )}

          <Input
            label="Total Score (0 – 100)"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Instructor Written Feedback & Correction Notes
            </label>
            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Highlight strengths, point out specific grammar/vocabulary improvements, and encourage the student..."
              className="w-full rounded-2xl border border-white/10 bg-[#070D1A] p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={submitGrade} isLoading={submittingGrade}>
              Submit Official Grade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
