import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const user = await User().findById(auth.id).select('email mfaChannel isMfaEnabled');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { email: user.email, mfaChannel: user.mfaChannel, isMfaEnabled: user.isMfaEnabled } });
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
