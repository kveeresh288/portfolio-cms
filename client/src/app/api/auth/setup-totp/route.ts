import { NextRequest, NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const user = await User().findById(auth.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const secret = generateSecret();
    const otpauthUrl = generateURI({ secret, label: user.email, issuer: 'Portfolio CMS' });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    user.mfaSecret = secret;
    user.isMfaEnabled = false;
    await user.save();

    return NextResponse.json({ success: true, data: { qrCode, secret } });
  } catch (err) {
    console.error('[GET /api/auth/setup-totp]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
