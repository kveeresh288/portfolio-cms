'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { MfaChannel } from '@/lib/types';

type Step = 'credentials' | 'email-otp' | 'totp';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>('email');
  const [sessionToken, setSessionToken] = useState('');
  const [preAuthToken, setPreAuthToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Step 1 — password check
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('All fields required'); return; }
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      const d = res.data!;
      if (!d.requiresMfa) {
        toast.success('Logged in — set up MFA from the dashboard');
        router.push('/admin');
        router.refresh();
        return;
      }
      setMfaChannel(d.mfaChannel!);
      if (d.mfaChannel === 'email') {
        setSessionToken(d.sessionToken!);
        setStep('email-otp');
        toast.success('Code sent to your email');
      } else {
        setPreAuthToken(d.preAuthToken!);
        setStep('totp');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2a — email OTP
  const handleEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await api.auth.verifyEmailOtp(sessionToken, code);
      toast.success('Welcome back!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Step 2b — TOTP
  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await api.auth.verifyTotp(preAuthToken, code);
      toast.success('Welcome back!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Resend email OTP
  const handleResend = async () => {
    setResending(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.data?.sessionToken) setSessionToken(res.data.sessionToken);
      toast.success('New code sent to your email');
      setCode('');
    } catch {
      toast.error('Could not resend — please go back and try again');
    } finally {
      setResending(false);
    }
  };

  const stepIcon = step === 'credentials' ? Lock : ShieldCheck;
  const StepIcon = stepIcon;

  const STEP_TITLES: Record<Step, { title: string; sub: string }> = {
    credentials: { title: 'Admin Access', sub: 'Enter your credentials to access the CMS' },
    'email-otp': { title: 'Check Your Email', sub: `We sent a 6-digit code to ${email}` },
    totp: { title: 'Authenticator Code', sub: 'Open your authenticator app and enter the code' },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm sm:max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl glass mb-4 glow-cyan">
            <StepIcon size={26} className="text-cyan-400" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            {STEP_TITLES[step].title}
          </h1>
          <p className="text-slate-400 text-sm mt-2 px-4">{STEP_TITLES[step].sub}</p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-7 border border-white/10">

          {/* Step 1: credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" placeholder="admin@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 outline-none border border-white/10 focus:border-cyan-400/60 transition-all text-sm" />
              </div>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 glass rounded-xl text-white placeholder-slate-500 outline-none border border-white/10 focus:border-cyan-400/60 transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan">
                {loading ? 'Verifying…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Step 2a: email OTP */}
          {step === 'email-otp' && (
            <form onSubmit={handleEmailOtp} className="space-y-4">
              <div>
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  placeholder="000000" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus
                  className="w-full text-center text-2xl sm:text-3xl tracking-[0.5em] font-mono py-4 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-cyan-400/60 transition-all" />
                <p className="text-xs text-slate-500 text-center mt-2">Expires in 5 minutes</p>
              </div>
              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan">
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <button type="button" onClick={() => { setStep('credentials'); setCode(''); }}
                  className="hover:text-slate-300 transition-colors">← Back</button>
                <button type="button" onClick={handleResend} disabled={resending}
                  className="flex items-center gap-1 hover:text-slate-300 transition-colors disabled:opacity-50">
                  <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Step 2b: TOTP */}
          {step === 'totp' && (
            <form onSubmit={handleTotp} className="space-y-4">
              <div>
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  placeholder="000000" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus
                  className="w-full text-center text-2xl sm:text-3xl tracking-[0.5em] font-mono py-4 glass rounded-xl text-white placeholder-slate-600 outline-none border border-white/10 focus:border-cyan-400/60 transition-all" />
                <p className="text-xs text-slate-500 text-center mt-2">Code refreshes every 30 seconds</p>
              </div>
              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan">
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => { setStep('credentials'); setCode(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1">
                ← Back to login
              </button>
            </form>
          )}
        </div>

        {/* MFA method indicator */}
        {step !== 'credentials' && (
          <p className="text-center text-xs text-slate-600 mt-4">
            Using {mfaChannel === 'email' ? 'Email OTP' : 'Authenticator App'} · Change method in dashboard
          </p>
        )}
      </motion.div>
    </div>
  );
}
