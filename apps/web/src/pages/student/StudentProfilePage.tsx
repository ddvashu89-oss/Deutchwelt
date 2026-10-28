import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { GermanLevel } from '@deutschwelt/shared';
import { User, CheckCircle2, ShieldCheck, Target, Globe } from 'lucide-react';

export function StudentProfilePage() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [currentLevel, setCurrentLevel] = useState(user?.studentProfile?.currentLevel || 'A1');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.studentProfile?.dailyGoalMinutes || 25);
  const [learningGoal, setLearningGoal] = useState(user?.studentProfile?.learningGoal || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.studentProfile?.preferredLanguage || 'en');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res: any = await api.patch('/student/profile', {
        firstName,
        lastName,
        phone,
        address,
        currentLevel,
        dailyGoalMinutes: Number(dailyGoalMinutes),
        learningGoal,
        preferredLanguage
      });

      if (res.success) {
        setSuccess(true);
        await refreshUser();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 sm:space-y-8 pb-16 font-sans">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <User className="w-3 h-3" />
            Account & Preferences
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
          Student Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal details, CEFR proficiency level, and study goals.
        </p>
      </div>

      <div className="bg-[#0B1325] rounded-3xl p-6 sm:p-8 border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/40 space-y-6">
        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile and learning goals updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21]/60 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 block">Managed by account credentials</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 151 12345678"
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Residential Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Friedrichstraße 10, 10117 Berlin, Germany"
              className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current CEFR Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={GermanLevel.BEGINNER}>Beginner (Pre-A1)</option>
                <option value={GermanLevel.A1}>A1 — Starter</option>
                <option value={GermanLevel.A2}>A2 — Elementary</option>
                <option value={GermanLevel.B1}>B1 — Intermediate</option>
                <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Daily Study Goal (Minutes)
              </label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="flex h-11 w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={15}>15 Minutes / Day (Casual)</option>
                <option value={25}>25 Minutes / Day (Standard)</option>
                <option value={45}>45 Minutes / Day (Intensive)</option>
                <option value={60}>60 Minutes / Day (Exam Prep)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Grammar & Vocabulary Explanation Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="en">English explanations (Default)</option>
              <option value="hi">English + Hindi explanations (हिंदी)</option>
              <option value="de">Deutsch immersiv (All German)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Primary Learning Goal
            </label>
            <textarea
              rows={3}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Preparing for Goethe-Zertifikat B1 exam for my master degree in Munich..."
              className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0F21] p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentProfilePage;
