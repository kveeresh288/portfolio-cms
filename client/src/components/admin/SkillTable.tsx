'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Skill, CATEGORY_LABELS, SkillCategory } from '@/lib/types';
import { api } from '@/lib/api';

interface SkillTableProps {
  skills: Skill[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const CATEGORIES: SkillCategory[] = ['frontend', 'backend', 'database', 'devops', 'tools', 'other'];

const EMPTY_SKILL = { name: '', category: 'frontend' as SkillCategory, iconName: '', proficiency: 80, order: 0 };

export default function SkillTable({ skills, onDelete, onRefresh }: SkillTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_SKILL);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.iconName) { toast.error('Name and icon name are required'); return; }
    setSaving(true);
    try {
      await api.skills.create(form);
      toast.success('Skill added');
      setForm(EMPTY_SKILL);
      setShowForm(false);
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Skills ({skills.length})</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 text-bg font-semibold"
          >
            <Plus size={12} /> Add Skill
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="p-5 border-b border-white/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Skill name"
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
              placeholder="Icon name (e.g. React)"
              value={form.iconName}
              onChange={(e) => setForm((f) => ({ ...f, iconName: e.target.value }))}
              className="glass rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-cyan-400/60 transition-all"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 whitespace-nowrap">{form.proficiency}%</label>
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
                className="px-3 py-2 rounded-lg bg-cyan-400 text-bg text-xs font-semibold whitespace-nowrap"
              >
                {saving ? '...' : 'Add'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Name</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold hidden md:table-cell">Proficiency</th>
                <th className="text-right px-5 py-3 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">No skills yet</td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-white">{skill.name}</span>
                      <span className="text-slate-500 text-xs ml-2">{skill.iconName}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-slate-400 capitalize">
                        {CATEGORY_LABELS[skill.category]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-24">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{skill.proficiency}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => onDelete(skill._id)}
                          className="p-2 rounded-lg glass glass-hover text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
