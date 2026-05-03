'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Pencil, Trash2, Star, StarOff, Plus, Search, RefreshCw, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Project } from '@/lib/types';
import { api } from '@/lib/api';
import ProjectModal from './ProjectModal';

interface ProjectTableProps {
  /** Called whenever projects change; passes total count and featured count */
  onCountChange?: (total: number, featured: number) => void;
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-white/10 flex gap-3">
        <div className="h-9 flex-1 max-w-xs bg-white/5 rounded-xl" />
        <div className="h-9 w-8 bg-white/5 rounded-xl" />
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-white/5 flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-44 bg-white/5 rounded" />
            <div className="h-3 w-72 bg-white/5 rounded" />
          </div>
          <div className="h-6 w-24 bg-white/5 rounded-full hidden md:block" />
          <div className="h-6 w-20 bg-white/5 rounded-full hidden lg:block" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-white/5 rounded-lg" />
            <div className="h-8 w-8 bg-white/5 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProjectTable({ onCountChange }: ProjectTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.projects.list();
      const data = res.data ?? [];
      setProjects(data);
      onCountChange?.(data.length, data.filter((p) => p.featured).length);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load projects';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSave = async (data: Partial<Project>) => {
    if (editingProject) {
      // UPDATE  →  PUT /api/projects/:id
      const res = await api.projects.update(editingProject._id, data);
      setProjects((prev) => prev.map((p) => (p._id === editingProject._id ? res.data! : p)));
      toast.success('Project updated');
    } else {
      // CREATE  →  POST /api/projects
      const res = await api.projects.create(
        data as Omit<Project, '_id' | 'createdAt' | 'updatedAt'>
      );
      const updated = [res.data!, ...projects];
      setProjects(updated);
      onCountChange?.(updated.length, updated.filter((p) => p.featured).length);
      toast.success('Project created');
    }
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeletingId(project._id);
    try {
      // DELETE  →  DELETE /api/projects/:id
      await api.projects.delete(project._id);
      const updated = projects.filter((p) => p._id !== project._id);
      setProjects(updated);
      onCountChange?.(updated.length, updated.filter((p) => p.featured).length);
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    setTogglingId(project._id);
    try {
      // Inline PATCH-style update  →  PUT /api/projects/:id  { featured: !current }
      const res = await api.projects.update(project._id, { featured: !project.featured });
      const updated = projects.map((p) => (p._id === project._id ? res.data! : p));
      setProjects(updated);
      onCountChange?.(updated.length, updated.filter((p) => p.featured).length);
      toast.success(res.data?.featured ? 'Marked as featured' : 'Removed from featured');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setShowModal(true);
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-400 mb-4 text-sm">{error}</p>
        <button
          onClick={fetchProjects}
          className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <>
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by title or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm glass rounded-xl text-white placeholder-slate-500 border border-white/10 outline-none focus:border-cyan-400/60 transition-all"
            />
          </div>

          <button
            onClick={fetchProjects}
            className="p-2 rounded-xl glass glass-hover text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-bg font-semibold hover:from-cyan-300 hover:to-teal-300 transition-all"
          >
            <Plus size={13} /> New Project
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-14 text-center text-slate-500 text-sm">
              {search ? `No projects match "${search}"` : 'No projects yet — click New Project to add one.'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Tags
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Featured
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Title + description */}
                    <td className="px-5 py-4 max-w-[260px]">
                      <p className="font-medium text-white leading-snug">{project.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    </td>

                    {/* Tags */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs text-slate-600 px-1">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Featured toggle — direct API call, no page reload */}
                    <td className="px-5 py-4 hidden lg:table-cell text-center">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        disabled={togglingId === project._id}
                        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
                          project.featured
                            ? 'bg-amber-400/15 text-amber-400 border-amber-400/30 hover:bg-amber-400/25'
                            : 'bg-white/5 text-slate-500 border-white/10 hover:text-amber-400 hover:border-amber-400/30'
                        }`}
                      >
                        {togglingId === project._id ? (
                          <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                        ) : project.featured ? (
                          <>
                            <Star size={10} fill="currentColor" /> Featured
                          </>
                        ) : (
                          <>
                            <StarOff size={10} /> Not featured
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit / Delete — per-row loading state */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          title="Edit"
                          className="p-2 rounded-lg glass glass-hover text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          disabled={deletingId === project._id}
                          title="Delete"
                          className="p-2 rounded-lg glass glass-hover text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deletingId === project._id ? (
                            <span className="w-3.5 h-3.5 block rounded-full border border-red-400 border-t-transparent animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer status bar */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
          <span>
            {search
              ? `${filtered.length} of ${projects.length} project${projects.length !== 1 ? 's' : ''}`
              : `${projects.length} project${projects.length !== 1 ? 's' : ''} total`}
          </span>
          <span>{projects.filter((p) => p.featured).length} featured</span>
        </div>
      </div>

      {/* Modal is co-located here — not in the parent page */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
