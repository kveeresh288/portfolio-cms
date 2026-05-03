'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Cpu, LogOut, QrCode, Menu, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import ProjectTable from '@/components/admin/ProjectTable';
import SkillTable from '@/components/admin/SkillTable';

type Tab = 'overview' | 'projects' | 'skills';

export default function AdminDashboardPage() {
  const router = useRouter();

  // ── Layout ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [userEmail, setUserEmail] = useState('');
  const [isTotpEnabled, setIsTotpEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Overview counts — filled by ProjectTable / SkillTable callbacks ────────
  const [projectCount, setProjectCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);

  // ── TOTP setup ─────────────────────────────────────────────────────────────
  const [qrCode, setQrCode] = useState('');
  const [totpConfirmCode, setTotpConfirmCode] = useState('');
  const [confirmingTotp, setConfirmingTotp] = useState(false);

  // ── Bootstrap: only fetch session info — tables fetch their own data ───────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.auth.me();
      setUserEmail(me.data?.email ?? '');
      setIsTotpEnabled(me.data?.isTotpEnabled ?? false);
    } catch {
      toast.error('Session expired — please log in again');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

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
      toast.success('TOTP 2FA enabled!');
      setQrCode('');
      setTotpConfirmCode('');
      setIsTotpEnabled(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setConfirmingTotp(false);
    }
  };

  const NAV_ITEMS = [
    { id: 'overview' as Tab, icon: LayoutDashboard, label: 'Overview' },
    { id: 'projects' as Tab, icon: FolderKanban, label: 'Projects' },
    { id: 'skills' as Tab, icon: Cpu, label: 'Skills' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ── Sidebar ───────────────────────────────────────────────────────────
          mobile: fixed, slides in/out via transform
          desktop (md+): static in the flex row
      ──────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          glass border-r border-white/10
          flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:flex md:shrink-0
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <p className="font-heading font-black text-gradient-cyan text-lg leading-none">KV.dev CMS</p>
          <p className="text-xs text-slate-500 mt-1 truncate">{userEmail}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
          {!isTotpEnabled && (
            <button
              onClick={handleSetupTotp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-400/10 transition-all border border-transparent"
            >
              <QrCode size={16} />
              Enable 2FA
            </button>
          )}
          {isTotpEnabled && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-400">
              <ShieldCheck size={14} />
              2FA Active
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all border border-transparent"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="glass border-b border-white/10 px-5 py-4 flex items-center gap-4 shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-heading font-bold text-white text-lg capitalize">
            {NAV_ITEMS.find((n) => n.id === tab)?.label}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-6 overflow-auto">

          {/* TOTP setup panel — shows as an overlay card above all tab content */}
          <AnimatePresence>
            {qrCode && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass border border-amber-400/40 rounded-2xl p-6 mb-6 max-w-xs"
              >
                <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-2 text-sm">
                  <QrCode size={15} /> Scan QR with Authenticator App
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Google Authenticator or Authy, then enter the 6-digit code below.
                </p>
                <img
                  src={qrCode}
                  alt="TOTP QR Code"
                  className="w-44 h-44 rounded-xl mx-auto mb-4 border border-white/10"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={totpConfirmCode}
                  onChange={(e) => setTotpConfirmCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-[0.4em] font-mono py-2.5 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-amber-400/60 transition-all mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmTotp}
                    disabled={confirmingTotp || totpConfirmCode.length !== 6}
                    className="flex-1 py-2 rounded-lg bg-amber-400 text-bg text-sm font-semibold disabled:opacity-50 transition-opacity"
                  >
                    {confirmingTotp ? 'Verifying…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => { setQrCode(''); setTotpConfirmCode(''); }}
                    className="px-4 py-2 rounded-lg glass text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Overview ─────────────────────────────────────────────────────
              ProjectTable and SkillTable are ALWAYS mounted (hidden via CSS)
              so their onCountChange fires immediately on page load.
              This keeps the overview stats accurate without an extra fetch.
          ──────────────────────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Projects', value: projectCount, color: 'text-cyan-400', glow: 'from-cyan-400/10 to-transparent' },
                { label: 'Featured', value: featuredCount, color: 'text-amber-400', glow: 'from-amber-400/10 to-transparent' },
                { label: 'Skills', value: skillCount, color: 'text-purple-400', glow: 'from-purple-400/10 to-transparent' },
              ].map(({ label, value, color, glow }) => (
                <div key={label} className="glass rounded-2xl p-6 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-radial ${glow} opacity-60`} />
                  <p className="relative text-slate-400 text-sm">{label}</p>
                  <p className={`relative font-heading text-5xl font-black mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Always rendered — CSS controls visibility to avoid unmount/remount on tab switch */}
          <div className={tab === 'projects' ? '' : 'hidden'}>
            <ProjectTable
              onCountChange={(total, featured) => {
                setProjectCount(total);
                setFeaturedCount(featured);
              }}
            />
          </div>

          <div className={tab === 'skills' ? '' : 'hidden'}>
            <SkillTable onCountChange={setSkillCount} />
          </div>

        </main>
      </div>
    </div>
  );
}
