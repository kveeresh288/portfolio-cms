import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Skill } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const skill = await Skill().findByIdAndUpdate(params.id, await req.json(), { new: true, runValidators: true });
    if (!skill) return NextResponse.json({ success: false, message: 'Skill not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: skill });
  } catch (err) {
    console.error('[PUT /api/skills/[id]]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const skill = await Skill().findByIdAndDelete(params.id);
    if (!skill) return NextResponse.json({ success: false, message: 'Skill not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    console.error('[DELETE /api/skills/[id]]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
