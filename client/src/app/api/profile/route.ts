import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SiteProfile } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function GET() {
  try {
    await connectDB();
    let profile = await SiteProfile().findOne();
    if (!profile) profile = await SiteProfile().create({});
    return NextResponse.json({ success: true, data: profile }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (err) {
    console.error('[GET /api/profile]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const body = await req.json();
    let profile = await SiteProfile().findOne();
    if (!profile) profile = new (SiteProfile())({});
    const { hero, about, contact, social } = body;
    if (hero) Object.assign(profile.hero, hero);
    if (about) Object.assign(profile.about, about);
    if (contact) Object.assign(profile.contact, contact);
    if (social) Object.assign(profile.social, social);
    await profile.save();
    return NextResponse.json({ success: true, data: profile });
  } catch (err) {
    console.error('[PUT /api/profile]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
