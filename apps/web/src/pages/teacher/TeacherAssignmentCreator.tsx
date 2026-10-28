import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { GermanLevel } from '@deutschwelt/shared';
import { PenTool, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export function TeacherAssignmentCreator() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(GermanLevel.A1);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [maxPoints, setMaxPoints] = useState(100);
  const [instructions, setInstructions] = useState('');
  const [rubricCriteria, setRubricCriteria] = useState([
    { name: 'Task Completion', description: 'All required points addressed', maxPoints: 40 },
    { name: 'Grammar & Syntax', description: 'Accurate verb position and case endings', maxPoints: 40 },
    { name: 'Vocabulary & Style', description: 'Appropriate level-specific words', maxPoints: 20 }
  ]);
  const [saving, setSaving] = useState(false);

  const addRubricRow = () => {
    setRubricCriteria(prev => [...prev, { name: '', description: '', maxPoints: 20 }]);
  };

  const removeRubricRow = (idx: number) => {
    setRubricCriteria(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRubric = (idx: number, field: string, value: any) => {
    const updated = [...rubricCriteria];
    (updated[idx] as any)[field] = value;
    setRubricCriteria(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res: any = await api.post('/teacher/assignments', {
        title,
        description,
        level,
        dueDate: new Date(dueDate).toISOString(),
        maxPoints: Number(maxPoints),
        instructions,
        rubricCriteria
      });

      if (res.success) {
        navigate('/teacher/submissions');
      }
    } catch (e) {
      console.error('Error creating assignment:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Writing Assignment</h1>
        <p className="text-xs text-slate-400">Publish a new German writing task with custom rubric assessment criteria.</p>
      </div>

      <div className="bg-[#0B1325] rounded-3xl p-8 border border-white/10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Assignment Title"
            placeholder="e.g. Schreibaufgabe: Eine kurze E-Mail an das Hotel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#070D1A] px-4 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              >
                <option value={GermanLevel.A1} className="bg-[#0B1325] text-slate-100">A1 Beginner</option>
                <option value={GermanLevel.A2} className="bg-[#0B1325] text-slate-100">A2 Elementary</option>
                <option value={GermanLevel.B1} className="bg-[#0B1325] text-slate-100">B1 Intermediate</option>
                <option value={GermanLevel.B2} className="bg-[#0B1325] text-slate-100">B2 Advanced</option>
              </select>
            </div>

            <Input
              label="Submission Deadline"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />

            <Input
              label="Max Points"
              type="number"
              value={maxPoints}
              onChange={(e) => setMaxPoints(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Brief Overview
            </label>
            <input
              type="text"
              placeholder="e.g. Write a formal inquiry email to book a room at a hotel in Munich..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-white/10 bg-[#070D1A] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Detailed Instructions & Prompts
            </label>
            <textarea
              rows={4}
              placeholder="List the required points for the student to write about..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#070D1A] p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              required
            />
          </div>

          {/* Rubric Criteria Builder */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Grading Rubric Criteria</h3>
              <button
                type="button"
                onClick={addRubricRow}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Criterion
              </button>
            </div>

            <div className="space-y-3">
              {rubricCriteria.map((r, i) => (
                <div key={i} className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Criterion Name"
                      value={r.name}
                      onChange={(e) => updateRubric(i, 'name', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-white/10 bg-[#070D1A] text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={r.description}
                      onChange={(e) => updateRubric(i, 'description', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-white/10 bg-[#070D1A] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Max Pts"
                      value={r.maxPoints}
                      onChange={(e) => updateRubric(i, 'maxPoints', Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl border border-white/10 bg-[#070D1A] text-xs text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeRubricRow(i)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md" isLoading={saving}>
            Publish Assignment to Students
          </Button>
        </form>
      </div>
    </div>
  );
}
