import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User, OtpSession } from '@/lib/serverModels';
import { signToken, setAuthCookie } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { sessionToken, otp } = await req.json();
    if (!sessionToken || !otp) return NextResponse.json({ success: false, message: 'sessionToken and otp required' }, { status: 400 });

    const session = await OtpSession().findOne({ sessionToken, channel: 'email' });
    if (!session) return NextResponse.json({ success: false, message: 'Session not found or expired' }, { status: 401 });
    if (session.verified) return NextResponse.json({ success: false, message: 'Session already used' }, { status: 401 });
    if (session.attempts >= 5) return NextResponse.json({ success: false, message: 'Too many attempts — please log in again' }, { status: 429 });

    const valid = await bcrypt.compare(otp, session.otpHash);
    session.attempts += 1;
    if (!valid) {
      await session.save();
      return NextResponse.json({ success: false, message: `Invalid code. ${5 - session.attempts} attempt(s) left` }, { status: 401 });
    }

    session.verified = true;
    await session.save();
    const user = await User().findById(session.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const token = signToken(String(user._id), user.email);
    const res = NextResponse.json({ success: true });
    return setAuthCookie(res, token);
  } catch (err) {
    console.error('[POST /api/auth/verify-email-otp]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
