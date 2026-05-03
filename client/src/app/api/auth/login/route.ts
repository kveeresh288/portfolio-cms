import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User, OtpSession } from '@/lib/serverModels';
import { signToken, setAuthCookie } from '@/lib/serverAuth';
import { sendOtpEmail } from '@/lib/serverEmail';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });

    const user = await User().findOne({ email }).select('+mfaSecret');
    if (!user || !(await user.comparePassword(password)))
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });

    if (!user.isMfaEnabled) {
      const token = signToken(String(user._id), user.email);
      const res = NextResponse.json({ success: true, data: { requiresMfa: false } });
      return setAuthCookie(res, token);
    }

    if (user.mfaChannel === 'email') {
      const otp = String(crypto.randomInt(100000, 999999));
      const otpHash = await bcrypt.hash(otp, 10);
      const sessionToken = crypto.randomBytes(32).toString('hex');
      await OtpSession().create({ sessionToken, userId: user._id, otpHash, channel: 'email', expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
      await sendOtpEmail(user.email, otp);
      return NextResponse.json({ success: true, data: { requiresMfa: true, mfaChannel: 'email', sessionToken } });
    }

    const preAuthToken = jwt.sign({ id: String(user._id), email: user.email, preAuth: true }, process.env.JWT_SECRET!, { expiresIn: '5m' });
    return NextResponse.json({ success: true, data: { requiresMfa: true, mfaChannel: 'totp', preAuthToken } });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
