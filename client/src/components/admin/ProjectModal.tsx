'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  /** Parent calls api.projects.create / update inside here and rethrows on failure */
  onSave: (data: Partial<Project>) => Promise<void>;
}

const EMPTY = {
  title: '',
  description: '',
  imageUrl: '',
  githubUrl: '',
  liveUrl: '',
  tags: '',
  featured: false,
  order: 0,
};

type FormState = typeof EMPTY;
type FieldErrors = Partial<Record<keyof FormState, string>>;

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Required';
  if (!form.description.trim()) errors.description = 'Required';
  if (!form.imageUrl.trim()) {
    errors.imageUrl = 'Required';
  } else if (!isUrl(form.imageUrl)) {
    errors.imageUrl = 'Must be a valid URL (include https://)';
  }
  if (form.githubUrl && !isUrl(form.githubUrl)) {
    errors.githubUrl = 'Must be a valid URL';
  }
  if (form.liveUrl && !isUrl(form.liveUrl)) {
    errors.liveUrl = 'Must be a valid URL';
  }
  if (form.order < 0) errors.order = 'Must be 0 or greater';
  return errors;
}

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        githubUrl: project.githubUrl ?? '',
        liveUrl: project.liveUrl ?? '',
        tags: project.tags.join(', '),
        featured: project.featured,
        order: project.order,
      });
    } else {
      setForm(EMPTY);
    }
    setFieldErrors({});
    setServerError('');
  }, [project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear field error on change
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setServerError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed — please try again');
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    'w-full glass px-4 py-2.5 rounded-xl text-white text-sm placeholder-slate-500 outline-none border transition-all focus:ring-1 focus:ring-cyan-400/20';
  const inputClass = (field: keyof FormState) =>
    `${inputBase} ${
      fieldErrors[field]
        ? 'border-red-400/50 focus:border-red-400/60'
        : 'border-white/10 focus:border-cyan-400/60'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg glass rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 glass z-10">
          <h2 className="font-heading font-bold text-white text-lg">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          {/* Server error banner */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Title */}
          <Field label="Title" required error={fieldErrors.title}>
            <input
              type="text"
              placeholder="My Awesome Project"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={inputClass('title')}
            />
          </Field>

          {/* Description */}
          <Field label="Description" required error={fieldErrors.description}>
            <textarea
              placeholder="What does this project do?"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={`${inputClass('description')} resize-none`}
            />
          </Field>

          {/* Image URL */}
          <Field label="Image URL" required error={fieldErrors.imageUrl}>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              className={inputClass('imageUrl')}
            />
            {form.imageUrl && isUrl(form.imageUrl) && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              </div>
            )}
          </Field>

          {/* GitHub + Live URL */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub URL" error={fieldErrors.githubUrl}>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={form.githubUrl}
                onChange={(e) => set('githubUrl', e.target.value)}
                className={inputClass('githubUrl')}
              />
            </Field>
            <Field label="Live URL" error={fieldErrors.liveUrl}>
              <input
                type="url"
                placeholder="https://..."
                value={form.liveUrl}
                onChange={(e) => set('liveUrl', e.target.value)}
                className={inputClass('liveUrl')}
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags" hint="comma separated" error={fieldErrors.tags}>
            <input
              type="text"
              placeholder="React, Node.js, MongoDB"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className={inputClass('tags')}
            />
          </Field>

          {/* Order + Featured */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <Field label="Display order" error={fieldErrors.order}>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => set('order', Number(e.target.value))}
                className={inputClass('order')}
              />
            </Field>
            <div className="pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Featured
                </span>
              </label>
              <p className="text-xs text-slate-600 mt-1 ml-6">Show in the featured row</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl glass glass-hover text-slate-400 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-bg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed glow-cyan transition-all"
            >
              {saving ? 'Saving…' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tiny form field wrapper ───────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-slate-600 font-normal">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
