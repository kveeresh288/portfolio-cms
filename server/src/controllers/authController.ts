import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const signToken = (id: string, email: string) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (!user.isTotpEnabled) {
      // No MFA set up yet — issue a full JWT immediately.
      // Wrap in data:{} so the client can read res.data.requiresMfa consistently.
      const token = signToken(String(user._id), user.email);
      res
        .cookie('token', token, COOKIE_OPTIONS)
        .json({ success: true, data: { requiresMfa: false } });
      return;
    }

    // MFA enabled — return a short-lived pre-auth token; client must verify TOTP.
    const preAuthToken = jwt.sign(
      { id: String(user._id), email: user.email, preAuth: true },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
    res.json({ success: true, data: { requiresMfa: true, preAuthToken } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/verify-totp
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

    const user = await User.findById(payload.id).select('+totpSecret');
    if (!user?.totpSecret) {
      res.status(400).json({ success: false, message: 'TOTP not configured for this account' });
      return;
    }

    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid TOTP code — try again' });
      return;
    }

    const token = signToken(String(user._id), user.email);
    res.cookie('token', token, COOKIE_OPTIONS).json({ success: true });
  } catch (err) {
    console.error('[verifyTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/setup-totp  (protected)
export const setupTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `Portfolio CMS (${user.email})`,
      length: 32,
    });

    user.totpSecret = secret.base32;
    user.isTotpEnabled = false;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);
    // Wrap in data:{} so the client can read res.data.qrCode
    res.json({ success: true, data: { qrCode: qrCodeDataUrl, secret: secret.base32 } });
  } catch (err) {
    console.error('[setupTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/confirm-totp  (protected)
export const confirmTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { totpCode } = req.body;
    const user = await User.findById(req.user!.id).select('+totpSecret');
    if (!user?.totpSecret) {
      res.status(400).json({ success: false, message: 'Call /setup-totp first' });
      return;
    }

    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!valid) {
      res.status(400).json({ success: false, message: 'Invalid TOTP code — please try again' });
      return;
    }

    user.isTotpEnabled = true;
    await user.save();
    res.json({ success: true, message: 'TOTP MFA enabled successfully' });
  } catch (err) {
    console.error('[confirmTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/logout  (protected)
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' }).json({
    success: true,
    message: 'Logged out',
  });
};

// GET /api/auth/me  (protected)
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('email isTotpEnabled');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    // Wrap in data:{} so the client can read res.data.email / res.data.isTotpEnabled
    res.json({ success: true, data: { email: user.email, isTotpEnabled: user.isTotpEnabled } });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
