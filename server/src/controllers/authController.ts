import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (id: string, email: string) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

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
      const token = signToken(String(user._id), user.email);
      res.cookie('token', token, COOKIE_OPTIONS).json({
        success: true,
        requiresMfa: false,
        message: 'Logged in. Set up TOTP from the dashboard for added security.',
      });
      return;
    }

    // Issue a short-lived pre-auth token; the client must verify TOTP to get a full token
    const preAuthToken = jwt.sign(
      { id: String(user._id), email: user.email, preAuth: true },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
    res.json({ success: true, requiresMfa: true, preAuthToken });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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

// Protected — requires a valid (non-preAuth) JWT
export const setupTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `Portfolio Admin (${user.email})`,
      length: 32,
    });

    // Save the unconfirmed secret; confirmTotp will set isTotpEnabled = true
    user.totpSecret = secret.base32;
    user.isTotpEnabled = false;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ success: true, qrCode: qrCodeDataUrl, secret: secret.base32 });
  } catch (err) {
    console.error('[setupTotp]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Protected — confirm the user has scanned and validated the QR code
export const confirmTotp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { totpCode } = req.body;
    const user = await User.findById(req.user!.id).select('+totpSecret');
    if (!user?.totpSecret) {
      res.status(400).json({ success: false, message: 'Run /setup-totp first' });
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

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' }).json({
    success: true,
    message: 'Logged out',
  });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
