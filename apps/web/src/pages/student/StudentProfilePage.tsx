import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
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
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Student Profile & Settings</h1>
        <p className="text-xs text-dark-muted">Manage your personal details, CEFR proficiency level, and study goals.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-card space-y-6">
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile and learning goals updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Managed by account credentials"
            />
            <Input
              label="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 151 12345678"
            />
          </div>

          <Input
            label="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Friedrichstraße 10, 10117 Berlin, Germany"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Current CEFR Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as any)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value={GermanLevel.BEGINNER}>Beginner (Pre-A1)</option>
                <option value={GermanLevel.A1}>A1 — Starter</option>
                <option value={GermanLevel.A2}>A2 — Elementary</option>
                <option value={GermanLevel.B1}>B1 — Intermediate</option>
                <option value={GermanLevel.B2}>B2 — Upper Intermediate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
                Daily Study Goal (Minutes)
              </label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value={15}>15 Minutes / Day (Casual)</option>
                <option value={25}>25 Minutes / Day (Standard)</option>
                <option value={45}>45 Minutes / Day (Intensive)</option>
                <option value={60}>60 Minutes / Day (Exam Prep)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Grammar & Vocabulary Explanation Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="en">English explanations (Default)</option>
              <option value="hi">English + Hindi explanations (हिंदी)</option>
              <option value="de">Deutsch immersiv (All German)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-dark uppercase tracking-wider">
              Primary Learning Goal
            </label>
            <textarea
              rows={3}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Preparing for Goethe-Zertifikat B1 exam for my master degree in Munich..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="font-bold shadow-md" isLoading={saving}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
