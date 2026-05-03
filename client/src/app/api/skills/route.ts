import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Skill } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function GET() {
  try {
    await connectDB();
    const skills = await Skill().find().sort({ category: 1, order: 1 });
    return NextResponse.json({ success: true, data: skills });
  } catch (err) {
    console.error('[GET /api/skills]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const skill = await Skill().create(await req.json());
    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skills]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
