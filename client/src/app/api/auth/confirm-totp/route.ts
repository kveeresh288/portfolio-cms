import { NextRequest, NextResponse } from 'next/server';
import { verify as totpVerify } from 'otplib';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const { totpCode } = await req.json();
    const user = await User().findById(auth.id).select('+mfaSecret');
    if (!user?.mfaSecret) return NextResponse.json({ success: false, message: 'Call /setup-totp first' }, { status: 400 });

    const valid = await totpVerify({ secret: user.mfaSecret, token: totpCode });
    if (!valid) return NextResponse.json({ success: false, message: 'Invalid code — try again' }, { status: 400 });

    user.mfaChannel = 'totp';
    user.isMfaEnabled = true;
    await user.save();
    return NextResponse.json({ success: true, message: 'TOTP MFA enabled' });
  } catch (err) {
    console.error('[POST /api/auth/confirm-totp]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
