'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Skill, CATEGORY_LABELS, SkillCategory } from '@/lib/types';
import { api } from '@/lib/api';

interface SkillTableProps {
  onCountChange?: (count: number) => void;
}

const CATEGORIES: SkillCategory[] = ['frontend', 'backend', 'database', 'devops', 'tools', 'other'];
const EMPTY = { name: '', category: 'frontend' as SkillCategory, iconName: '', proficiency: 80, order: 0 };

function SkillSkeleton() {
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-white/10 flex justify-between">
        <div className="h-5 w-28 bg-white/5 rounded" />
        <div className="h-7 w-24 bg-white/5 rounded-lg" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="px-5 py-3.5 border-b border-white/5 flex items-center gap-4">
          <div className="h-4 w-24 bg-white/5 rounded flex-1" />
          <div className="h-5 w-20 bg-white/5 rounded-full hidden sm:block" />
          <div className="h-3 w-32 bg-white/5 rounded hidden md:block" />
          <div className="h-8 w-8 bg-white/5 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function SkillTable({ onCountChange }: SkillTableProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.skills.list();
      const data = res.data ?? [];
      setSkills(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.iconName.trim()) {
      toast.error('Name and icon name are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.skills.create(form);
      const updated = [...skills, res.data!];
      setSkills(updated);
      onCountChange?.(updated.length);
      toast.success('Skill added');
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    setDeletingId(id);
    try {
      await api.skills.delete(id);
      const updated = skills.filter((s) => s._id !== id);
      setSkills(updated);
      onCountChange?.(updated.length);
      toast.success('Skill deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <SkillSkeleton />;

  if (error) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button onClick={fetchSkills} className="text-sm text-cyan-400 underline underline-offset-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
        <span className="font-semibold text-white text-sm">Skills ({skills.length})</span>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSkills}
            className="p-2 rounded-xl glass glass-hover text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 text-bg font-semibold hover:from-cyan-300 transition-all"
          >
            <Plus size={12} /> Add Skill
          </button>
        </div>
      </div>

      {/* Inline create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-5 border-b border-white/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/[0.02]"
        >
          <input
            type="text"
            placeholder="Skill name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="glass rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-cyan-400/60 transition-all"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SkillCategory }))}
            className="glass rounded-xl px-3 py-2 text-sm text-white border border-white/10 outline-none focus:border-cyan-400/60 bg-bg transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Icon name (e.g. React) *"
            value={form.iconName}
            onChange={(e) => setForm((f) => ({ ...f, iconName: e.target.value }))}
            className="glass rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-cyan-400/60 transition-all"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-8 shrink-0">{form.proficiency}%</span>
            <input
              type="range"
              min={1}
              max={100}
              value={form.proficiency}
              onChange={(e) => setForm((f) => ({ ...f, proficiency: Number(e.target.value) }))}
              className="flex-1 accent-cyan-400"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-bg text-xs font-semibold disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? '…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Proficiency</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500 text-sm">
                  No skills yet — click Add Skill to get started.
                </td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-slate-500 text-xs ml-2 hidden sm:inline">{skill.iconName}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 capitalize">
                      {CATEGORY_LABELS[skill.category]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2 max-w-[160px]">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{skill.proficiency}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(skill._id)}
                        disabled={deletingId === skill._id}
                        className="p-2 rounded-lg glass glass-hover text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === skill._id ? (
                          <span className="w-3.5 h-3.5 block rounded-full border border-red-400 border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-600">
        {skills.length} skill{skills.length !== 1 ? 's' : ''} across{' '}
        {Array.from(new Set(skills.map((s) => s.category))).length} categories
      </div>
    </div>
  );
}
