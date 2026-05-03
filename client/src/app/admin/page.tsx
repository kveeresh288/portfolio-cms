'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Cpu, LogOut, QrCode, Menu, X,
  ShieldCheck, Mail, Smartphone, ShieldOff, User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { MfaChannel } from '@/lib/types';
import ProjectTable from '@/components/admin/ProjectTable';
import SkillTable from '@/components/admin/SkillTable';
import ProfileEditor from '@/components/admin/ProfileEditor';

type Tab = 'overview' | 'projects' | 'skills' | 'profile';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>('email');
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [projectCount, setProjectCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);

  // TOTP setup
  const [qrCode, setQrCode] = useState('');
  const [totpConfirmCode, setTotpConfirmCode] = useState('');
  const [confirmingTotp, setConfirmingTotp] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.auth.me();
      setUserEmail(me.data?.email ?? '');
      setMfaChannel(me.data?.mfaChannel ?? 'email');
      setIsMfaEnabled(me.data?.isMfaEnabled ?? false);
    } catch {
      toast.error('Session expired — please log in again');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await api.auth.logout().catch(() => null);
    router.push('/admin/login');
    router.refresh();
  };

  const handleEnableEmailMfa = async () => {
    try {
      await api.auth.enableEmailMfa();
      setMfaChannel('email');
      setIsMfaEnabled(true);
      toast.success('Email OTP MFA enabled');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
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
      toast.success('Authenticator app MFA enabled');
      setQrCode('');
      setTotpConfirmCode('');
      setMfaChannel('totp');
      setIsMfaEnabled(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setConfirmingTotp(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Disable MFA? Your account will only require a password to log in.')) return;
    try {
      await api.auth.disableMfa();
      setIsMfaEnabled(false);
      toast.success('MFA disabled');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const NAV: { id: Tab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'skills', icon: Cpu, label: 'Skills' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
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
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64
        glass border-r border-white/10 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:flex md:shrink-0
      `}>
        <div className="p-5 border-b border-white/10 shrink-0">
          <p className="font-heading font-black text-gradient-cyan text-lg leading-none">KV.dev CMS</p>
          <p className="text-xs text-slate-500 mt-1 truncate">{userEmail}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                tab === id
                  ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* MFA status + security actions */}
        <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
          {/* MFA status indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl ${
            isMfaEnabled ? 'text-emerald-400 bg-emerald-400/5' : 'text-amber-400 bg-amber-400/5'
          }`}>
            {isMfaEnabled ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
            {isMfaEnabled
              ? `2FA: ${mfaChannel === 'email' ? 'Email OTP' : 'Authenticator'}`
              : '2FA: Not enabled'}
          </div>

          {/* MFA setup buttons */}
          {!isMfaEnabled && (
            <>
              <button onClick={handleEnableEmailMfa}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-amber-400 hover:bg-amber-400/10 transition-all border border-transparent">
                <Mail size={14} /> Enable Email OTP
              </button>
              <button onClick={handleSetupTotp}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-amber-400 hover:bg-amber-400/10 transition-all border border-transparent">
                <Smartphone size={14} /> Setup Authenticator
              </button>
            </>
          )}
          {isMfaEnabled && (
            <>
              {mfaChannel === 'email' && (
                <button onClick={handleSetupTotp}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-transparent">
                  <Smartphone size={14} /> Switch to Authenticator
                </button>
              )}
              {mfaChannel === 'totp' && (
                <button onClick={handleEnableEmailMfa}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-transparent">
                  <Mail size={14} /> Switch to Email OTP
                </button>
              )}
              <button onClick={handleDisableMfa}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all border border-transparent">
                <ShieldOff size={14} /> Disable MFA
              </button>
            </>
          )}

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all border border-transparent">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-white/10 px-4 sm:px-5 py-4 flex items-center gap-4 shrink-0">
          <button className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-heading font-bold text-white text-base sm:text-lg capitalize">
            {NAV.find((n) => n.id === tab)?.label}
          </h1>
        </header>

        <main className="flex-1 p-4 sm:p-5 md:p-6 overflow-auto">

          {/* TOTP QR panel */}
          <AnimatePresence>
            {qrCode && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass border border-amber-400/40 rounded-2xl p-5 mb-5 max-w-xs"
              >
                <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-2 text-sm">
                  <QrCode size={14} /> Scan with Authenticator App
                </h3>
                <p className="text-xs text-slate-500 mb-3">Use Google Authenticator or Authy</p>
                <img src={qrCode} alt="TOTP QR Code" className="w-40 h-40 rounded-xl mx-auto mb-3 border border-white/10" />
                <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={totpConfirmCode}
                  onChange={(e) => setTotpConfirmCode(e.target.value.replace(/\D/g, ''))} autoFocus
                  className="w-full text-center text-xl tracking-[0.4em] font-mono py-2.5 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-amber-400/60 transition-all mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleConfirmTotp} disabled={confirmingTotp || totpConfirmCode.length !== 6}
                    className="flex-1 py-2 rounded-lg bg-amber-400 text-bg text-sm font-semibold disabled:opacity-50">
                    {confirmingTotp ? 'Verifying…' : 'Confirm'}
                  </button>
                  <button onClick={() => { setQrCode(''); setTotpConfirmCode(''); }}
                    className="px-3 py-2 rounded-lg glass text-slate-400 text-sm">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
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

          {/* Always-mounted tables (hidden via CSS to avoid remounts) */}
          <div className={tab === 'projects' ? '' : 'hidden'}>
            <ProjectTable onCountChange={(total, featured) => { setProjectCount(total); setFeaturedCount(featured); }} />
          </div>
          <div className={tab === 'skills' ? '' : 'hidden'}>
            <SkillTable onCountChange={setSkillCount} />
          </div>
          {tab === 'profile' && <ProfileEditor />}
        </main>
      </div>
    </div>
  );
}
