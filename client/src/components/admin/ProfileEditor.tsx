'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, RefreshCw, User, Phone, Share2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { SiteProfile } from '@/lib/types';

type Section = 'hero' | 'about' | 'contact' | 'social';

const SECTIONS: { id: Section; icon: typeof User; label: string }[] = [
  { id: 'hero', icon: User, label: 'Hero' },
  { id: 'about', icon: BookOpen, label: 'About' },
  { id: 'contact', icon: Phone, label: 'Contact' },
  { id: 'social', icon: Share2, label: 'Social' },
];

const input = 'w-full glass px-4 py-2.5 rounded-xl text-white text-sm placeholder-slate-500 outline-none border border-white/10 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition-all';
const textarea = `${input} resize-none`;
const label = 'block text-xs text-slate-400 mb-1.5 font-medium';

export default function ProfileEditor() {
  const [section, setSection] = useState<Section>('hero');
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.profile.get();
      setProfile(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const save = async (patch: Partial<SiteProfile>) => {
    setSaving(true);
    try {
      const res = await api.profile.update(patch);
      if (res.data) setProfile(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-8 animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="glass rounded-2xl p-10 text-center border border-white/10">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-4">{error || 'Profile not found'}</p>
        <button onClick={fetchProfile} className="text-sm text-cyan-400 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(({ id, icon: Icon, label: lbl }) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              section === id
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'glass glass-hover text-slate-400'
            }`}>
            <Icon size={14} /> {lbl}
          </button>
        ))}
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      {section === 'hero' && (
        <HeroForm profile={profile} onSave={(h) => save({ hero: h })} saving={saving} />
      )}

      {/* ── About ────────────────────────────────────────────────────────────── */}
      {section === 'about' && (
        <AboutForm profile={profile} onSave={(a) => save({ about: a })} saving={saving} />
      )}

      {/* ── Contact ──────────────────────────────────────────────────────────── */}
      {section === 'contact' && (
        <ContactForm profile={profile} onSave={(c) => save({ contact: c })} saving={saving} />
      )}

      {/* ── Social ───────────────────────────────────────────────────────────── */}
      {section === 'social' && (
        <SocialForm profile={profile} onSave={(s) => save({ social: s })} saving={saving} />
      )}
    </div>
  );
}

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-bg text-sm font-semibold disabled:opacity-60 transition-all glow-cyan">
      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

function HeroForm({ profile, onSave, saving }: { profile: SiteProfile; onSave: (h: SiteProfile['hero']) => void; saving: boolean }) {
  const [form, setForm] = useState(profile.hero);
  useEffect(() => setForm(profile.hero), [profile]);
  const s = <K extends keyof typeof form>(k: K) => (v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-white">Hero Section</h3>
      <div>
        <p className={label}>Display Name *</p>
        <input className={input} value={form.name} onChange={(e) => s('name')(e.target.value)} placeholder="Your full name" />
      </div>
      <div>
        <p className={label}>Availability Badge</p>
        <input className={input} value={form.badge} onChange={(e) => s('badge')(e.target.value)} placeholder="Open to opportunities..." />
      </div>
      <div>
        <p className={label}>Subtitle</p>
        <textarea className={textarea} rows={3} value={form.subtitle} onChange={(e) => s('subtitle')(e.target.value)} placeholder="Your one-liner bio" />
      </div>
      <div>
        <p className={label}>Roles <span className="text-slate-600">(one per line — displayed in animated ticker)</span></p>
        <textarea className={textarea} rows={5}
          value={form.roles.join('\n')}
          onChange={(e) => s('roles')(e.target.value.split('\n').map(r => r.trim()).filter(Boolean))}
          placeholder={'Data Engineer Intern\nFull-Stack Developer\nDSA & Problem Solver'} />
      </div>
      <SaveBtn saving={saving} onClick={() => onSave(form)} />
    </div>
  );
}

function AboutForm({ profile, onSave, saving }: { profile: SiteProfile; onSave: (a: SiteProfile['about']) => void; saving: boolean }) {
  const [bio, setBio] = useState(profile.about.bio.join('\n\n'));
  useEffect(() => setBio(profile.about.bio.join('\n\n')), [profile]);

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-white">About Section</h3>
      <div>
        <p className={label}>Bio <span className="text-slate-600">(separate paragraphs with a blank line)</span></p>
        <textarea className={textarea} rows={10} value={bio} onChange={(e) => setBio(e.target.value)}
          placeholder="Write your bio here. Separate paragraphs with a blank line." />
      </div>
      <SaveBtn saving={saving} onClick={() => onSave({ bio: bio.split('\n\n').map(p => p.trim()).filter(Boolean) })} />
    </div>
  );
}

function ContactForm({ profile, onSave, saving }: { profile: SiteProfile; onSave: (c: SiteProfile['contact']) => void; saving: boolean }) {
  const [form, setForm] = useState(profile.contact);
  useEffect(() => setForm(profile.contact), [profile]);
  const s = <K extends keyof typeof form>(k: K) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const fields: { key: keyof SiteProfile['contact']; label: string; placeholder: string; type?: string }[] = [
    { key: 'email', label: 'Email Address', placeholder: 'you@email.com', type: 'email' },
    { key: 'phone', label: 'Phone Number', placeholder: '+91 00000 00000' },
    { key: 'workLocation', label: 'Work Location', placeholder: 'HSR Layout, Bangalore' },
    { key: 'workMapsUrl', label: 'Google Maps URL (work)', placeholder: 'https://maps.app.goo.gl/...', type: 'url' },
    { key: 'college', label: 'College / Education', placeholder: 'AIET · Moodbidri, Mangalore' },
  ];

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-white">Contact Information</h3>
      {fields.map(({ key, label: lbl, placeholder, type }) => (
        <div key={key}>
          <p className={label}>{lbl}</p>
          <input className={input} type={type || 'text'} value={form[key]}
            onChange={(e) => s(key)(e.target.value)} placeholder={placeholder} />
        </div>
      ))}
      <SaveBtn saving={saving} onClick={() => onSave(form)} />
    </div>
  );
}

function SocialForm({ profile, onSave, saving }: { profile: SiteProfile; onSave: (s: SiteProfile['social']) => void; saving: boolean }) {
  const [form, setForm] = useState(profile.social);
  useEffect(() => setForm(profile.social), [profile]);
  const s = <K extends keyof typeof form>(k: K) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const fields: { key: keyof SiteProfile['social']; label: string; placeholder: string }[] = [
    { key: 'github', label: 'GitHub Profile URL', placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/username' },
    { key: 'resume', label: 'Resume PDF URL', placeholder: 'https://drive.google.com/...' },
  ];

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-white">Social Links</h3>
      {fields.map(({ key, label: lbl, placeholder }) => (
        <div key={key}>
          <p className={label}>{lbl}</p>
          <input className={input} type="url" value={form[key]}
            onChange={(e) => s(key)(e.target.value)} placeholder={placeholder} />
        </div>
      ))}
      <SaveBtn saving={saving} onClick={() => onSave(form)} />
    </div>
  );
}
