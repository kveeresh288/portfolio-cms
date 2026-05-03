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
    user.isMfaEnabled = false;
    await user.save();
    return NextResponse.json({ success: true, message: 'MFA disabled' });
  } catch (err) {
    console.error('[POST /api/auth/disable-mfa]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
