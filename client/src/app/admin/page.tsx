'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Cpu, LogOut, QrCode, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Skill } from '@/lib/types';
import ProjectTable from '@/components/admin/ProjectTable';
import SkillTable from '@/components/admin/SkillTable';

type Tab = 'overview' | 'projects' | 'skills';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth / user state
  const [userEmail, setUserEmail] = useState('');
  const [isTotpEnabled, setIsTotpEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Counts for the overview cards — ProjectTable reports its own count back via onCountChange
  const [projectCount, setProjectCount] = useState(0);

  // Skills (managed here because SkillTable still receives them as props)
  const [skills, setSkills] = useState<Skill[]>([]);

  // TOTP setup flow
  const [qrCode, setQrCode] = useState('');
  const [totpConfirmCode, setTotpConfirmCode] = useState('');
  const [confirmingTotp, setConfirmingTotp] = useState(false);

  // ── Bootstrap: verify session and load skills ──────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [me, sk] = await Promise.all([api.auth.me(), api.skills.list()]);
      setUserEmail(me.data?.email ?? '');
      setIsTotpEnabled(me.data?.isTotpEnabled ?? false);
      setSkills(sk.data ?? []);
    } catch {
      toast.error('Session expired — please log in again');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Auth handlers ──────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await api.auth.logout().catch(() => null);
    router.push('/admin/login');
    router.refresh();
  };

  const handleSetupTotp = async () => {
    try {
      const res = await api.auth.setupTotp();
      if (res.data?.qrCode) setQrCode(res.data.qrCode);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate QR code');
    }
  };

  const handleConfirmTotp = async () => {
    if (totpConfirmCode.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setConfirmingTotp(true);
    try {
      await api.auth.confirmTotp(totpConfirmCode);
      toast.success('TOTP MFA enabled!');
      setQrCode('');
      setTotpConfirmCode('');
      setIsTotpEnabled(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setConfirmingTotp(false);
    }
  };

  // ── Skill handlers (SkillTable still uses callback props) ──────────────────

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await api.skills.delete(id);
      setSkills((s) => s.filter((x) => x._id !== id));
      toast.success('Skill deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  // ── Nav config ─────────────────────────────────────────────────────────────

  const NAV_ITEMS = [
    { id: 'overview' as Tab, icon: LayoutDashboard, label: 'Overview' },
    { id: 'projects' as Tab, icon: FolderKanban, label: 'Projects' },
    { id: 'skills' as Tab, icon: Cpu, label: 'Skills' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-white/10 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-5 border-b border-white/10">
          <p className="font-heading font-black text-gradient-cyan text-lg">KV.dev CMS</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{userEmail}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          {!isTotpEnabled && (
            <button
              onClick={handleSetupTotp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-400/10 transition-all"
            >
              <QrCode size={16} />
              Enable 2FA
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-white/10 px-6 py-4 flex items-center gap-4">
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-heading font-bold text-white capitalize">
            {NAV_ITEMS.find((n) => n.id === tab)?.label}
          </h1>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* TOTP setup panel */}
          {qrCode && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border border-amber-400/30 rounded-2xl p-6 mb-6 max-w-sm"
            >
              <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                <QrCode size={16} /> Scan with Authenticator App
              </h3>
              <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48 rounded-xl mx-auto mb-4" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code to confirm"
                value={totpConfirmCode}
                onChange={(e) => setTotpConfirmCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-xl tracking-widest font-mono py-2.5 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-amber-400/60 transition-all mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmTotp}
                  disabled={confirmingTotp}
                  className="flex-1 py-2 rounded-lg bg-amber-400 text-bg text-sm font-semibold disabled:opacity-60"
                >
                  {confirmingTotp ? 'Verifying…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setQrCode('')}
                  className="px-4 py-2 rounded-lg glass text-slate-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Overview — project count comes from ProjectTable via onCountChange */}
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { label: 'Projects', value: projectCount, color: 'text-cyan-400' },
                { label: 'Skills', value: skills.length, color: 'text-purple-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass rounded-2xl p-6">
                  <p className="text-slate-400 text-sm">{label}</p>
                  <p className={`font-heading text-4xl font-black mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/*
            ProjectTable is now fully self-contained:
            - Fetches GET /api/projects on mount
            - Handles POST / PUT / DELETE internally via api.projects.*
            - Owns its search bar, loading skeleton, and ProjectModal
            - Reports count changes up via onCountChange
          */}
          {tab === 'projects' && (
            <ProjectTable onCountChange={setProjectCount} />
          )}

          {tab === 'skills' && (
            <SkillTable
              skills={skills}
              onDelete={handleDeleteSkill}
              onRefresh={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
