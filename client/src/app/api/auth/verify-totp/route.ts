import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verify as totpVerify } from 'otplib';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/serverModels';
import { signToken, setAuthCookie, JwtPayload } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { preAuthToken, totpCode } = await req.json();
    if (!preAuthToken || !totpCode) return NextResponse.json({ success: false, message: 'preAuthToken and totpCode required' }, { status: 400 });

    let payload: JwtPayload;
    try { payload = jwt.verify(preAuthToken, process.env.JWT_SECRET!) as JwtPayload; }
    catch { return NextResponse.json({ success: false, message: 'Session expired — please log in again' }, { status: 401 }); }

    if (!payload.preAuth) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const user = await User().findById(payload.id).select('+mfaSecret');
    if (!user?.mfaSecret) return NextResponse.json({ success: false, message: 'TOTP not configured' }, { status: 400 });

    const valid = await totpVerify({ secret: user.mfaSecret, token: totpCode });
    if (!valid) return NextResponse.json({ success: false, message: 'Invalid authenticator code — try again' }, { status: 401 });

    const token = signToken(String(user._id), user.email);
    const res = NextResponse.json({ success: true });
    return setAuthCookie(res, token);
  } catch (err) {
    console.error('[POST /api/auth/verify-totp]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
