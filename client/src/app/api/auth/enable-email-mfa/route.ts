import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const user = await User().findById(auth.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    user.mfaChannel = 'email';
    user.isMfaEnabled = true;
    await user.save();
    return NextResponse.json({ success: true, message: 'Email OTP MFA enabled' });
  } catch (err) {
    console.error('[POST /api/auth/enable-email-mfa]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
