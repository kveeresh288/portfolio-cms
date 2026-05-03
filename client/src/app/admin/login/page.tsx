'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Step = 'credentials' | 'totp';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [preAuthToken, setPreAuthToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('All fields required'); return; }
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.data?.requiresMfa && res.data.preAuthToken) {
        setPreAuthToken(res.data.preAuthToken);
        setStep('totp');
        toast.success('Enter your authenticator code');
      } else {
        toast.success('Logged in successfully');
        router.push('/admin');
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await api.auth.verifyTotp(preAuthToken, totpCode);
      toast.success('Welcome back!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4 glow-cyan">
            {step === 'totp' ? (
              <ShieldCheck size={28} className="text-cyan-400" />
            ) : (
              <Lock size={28} className="text-cyan-400" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-black text-white">
            {step === 'totp' ? 'Two-Factor Auth' : 'Admin Access'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {step === 'totp'
              ? 'Open your authenticator app and enter the 6-digit code'
              : 'Enter your credentials to access the CMS'}
          </p>
        </div>

        <div className="glass rounded-2xl p-7 border border-white/10">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 outline-none border border-white/10 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  autoComplete="username"
                />
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 glass rounded-xl text-white placeholder-slate-500 outline-none border border-white/10 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTotp} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-500 text-center mt-2">
                  Code refreshes every 30 seconds
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('credentials'); setTotpCode(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
