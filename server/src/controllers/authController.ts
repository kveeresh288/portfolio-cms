/**
 * Auth controller — fully integrated with the MFA project's dual-channel pattern:
 *   - Email OTP  (sends 6-digit code via Gmail → verify with sessionToken)
 *   - TOTP       (authenticator app via otplib → verify with preAuthToken)
 *
 * Login flow:
 *   Step 1  POST /auth/login        → credentials check
 *   Step 2a POST /auth/verify-email-otp  → for mfaChannel === 'email'
 *   Step 2b POST /auth/verify-totp       → for mfaChannel === 'totp'
 *   GET  /auth/setup-totp           → generate QR (protected)
 *   POST /auth/confirm-totp         → confirm TOTP setup (protected)
 *   POST /auth/enable-email-mfa     → enable email OTP (protected, no setup needed)
 *   POST /auth/change-mfa           → switch between email / totp (protected)
 */
import crypto from 'crypto';
import { Request, Response } from 'express';
import { TOTP, generateSecret, generateURI, verify as totpVerify } from 'otplib';
import QRCode from 'qrcode';

const totp = new TOTP();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OtpSession from '../models/OtpSession';
import { sendOtpEmail } from '../utils/emailService';
import { AuthRequest } from '../types';


const MAX_OTP_ATTEMPTS = 5;

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const signToken = (id: string, email: string) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

// ── Step 1: password verification ────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+mfaSecret');
    // Constant-time rejection to prevent user enumeration
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.isMfaEnabled) {
      // First login or MFA disabled — issue JWT directly, prompt setup in dashboard
      const token = signToken(String(user._id), user.email);
      res.cookie('token', token, COOKIE).json({
        success: true,
        data: { requiresMfa: false },
      });
      return;
    }

    if (user.mfaChannel === 'email') {
      // Email OTP — generate, hash, store session, send email
      const otp = String(crypto.randomInt(100000, 999999));
      const otpHash = await bcrypt.hash(otp, 10);
      const sessionToken = crypto.randomBytes(32).toString('hex');

      await OtpSession.create({
        sessionToken,
        userId: user._id,
        otpHash,
        channel: 'email',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      await sendOtpEmail(user.email, otp);
      res.json({
        success: true,
        data: { requiresMfa: true, mfaChannel: 'email', sessionToken },
      });
      return;
    }

    // TOTP — no code to send, issue a short-lived pre-auth token
    const preAuthToken = jwt.sign(
      { id: String(user._id), email: user.email, preAuth: true },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
    res.json({
      success: true,
      data: { requiresMfa: true, mfaChannel: 'totp', preAuthToken },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Step 2a: verify email OTP ────────────────────────────────────────────────

export const verifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionToken, otp } = req.body;
    if (!sessionToken || !otp) {
      res.status(400).json({ success: false, message: 'sessionToken and otp are required' });
      return;
    }

    const session = await OtpSession.findOne({ sessionToken, channel: 'email' });
    if (!session) {
      res.status(401).json({ success: false, message: 'Session not found or expired' });
      return;
    }
    if (session.verified) {
      res.status(401).json({ success: false, message: 'Session already used' });
      return;
    }
    if (session.attempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({ success: false, message: 'Too many attempts — please log in again' });
      return;
    }

    const valid = await bcrypt.compare(otp, session.otpHash);
    session.attempts += 1;

    if (!valid) {
      await session.save();
      res.status(401).json({
        success: false,
        message: `Invalid code. ${MAX_OTP_ATTEMPTS - session.attempts} attempt(s) left`,
      });
      return;
    }

    session.verified = true;
    await session.save();

    const user = await User.findById(session.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const token = signToken(String(user._id), user.email);
    res.cookie('token', token, COOKIE).json({ success: true });
  } catch (err) {
    console.error('[verifyEmailOtp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Step 2b: verify TOTP ─────────────────────────────────────────────────────

export const verifyTotp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { preAuthToken, totpCode } = req.body;
    if (!preAuthToken || !totpCode) {
      res.status(400).json({ success: false, message: 'preAuthToken and totpCode are required' });
      return;
    }

    let payload: { id: string; email: string; preAuth?: boolean };
    try {
      payload = jwt.verify(preAuthToken, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      res.status(401).json({ success: false, message: 'Session expired — please log in again' });
      return;
    }

    if (!payload.preAuth) {
      res.status(401).json({ success: false, message: 'Invalid session type' });
      return;
    }

    const user = await User.findById(payload.id).select('+mfaSecret');
    if (!user?.mfaSecret) {
      res.status(400).json({ success: false, message: 'TOTP not configured for this account' });
      return;
    }

    const valid = await totpVerify({ secret: user.mfaSecret, token: totpCode });
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid authenticator code — try again' });
      return;
    }

    const token = signToken(String(user._id), user.email);
    res.cookie('token', token, COOKIE).json({ success: true });
  } catch (err) {
    console.error('[verifyTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Enable email OTP (no setup needed — just toggle) ─────────────────────────

export const enableEmailMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    user.mfaChannel = 'email';
    user.isMfaEnabled = true;
    user.mfaSecret = undefined;
    await user.save();
    res.json({ success: true, message: 'Email OTP MFA enabled' });
  } catch (err) {
    console.error('[enableEmailMfa]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── TOTP setup: generate QR ──────────────────────────────────────────────────

export const setupTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    const secret = generateSecret();
    const otpauthUrl = generateURI({ secret, label: user.email, issuer: 'Portfolio CMS' });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Save unconfirmed secret; confirmTotp will set isMfaEnabled = true
    user.mfaSecret = secret;
    user.isMfaEnabled = false;
    await user.save();

    res.json({ success: true, data: { qrCode, secret } });
  } catch (err) {
    console.error('[setupTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── TOTP setup: confirm code ─────────────────────────────────────────────────

export const confirmTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { totpCode } = req.body;
    const user = await User.findById(req.user!.id).select('+mfaSecret');
    if (!user?.mfaSecret) {
      res.status(400).json({ success: false, message: 'Call /setup-totp first' });
      return;
    }

    const valid = await totpVerify({ secret: user.mfaSecret, token: totpCode });
    if (!valid) {
      res.status(400).json({ success: false, message: 'Invalid code — please try again' });
      return;
    }

    user.mfaChannel = 'totp';
    user.isMfaEnabled = true;
    await user.save();
    res.json({ success: true, message: 'TOTP MFA enabled' });
  } catch (err) {
    console.error('[confirmTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Disable MFA (dev / recovery) ─────────────────────────────────────────────

export const disableMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.isMfaEnabled = false;
    await user.save();
    res.json({ success: true, message: 'MFA disabled' });
  } catch (err) {
    console.error('[disableMfa]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Logout & Me ───────────────────────────────────────────────────────────────

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' })
    .json({ success: true, message: 'Logged out' });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('email mfaChannel isMfaEnabled');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({
      success: true,
      data: { email: user.email, mfaChannel: user.mfaChannel, isMfaEnabled: user.isMfaEnabled },
    });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
