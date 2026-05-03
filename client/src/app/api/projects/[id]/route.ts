import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

const ALLOWED = ['title','description','imageUrl','githubUrl','liveUrl','tags','featured','order'];
const pick = (b: Record<string,unknown>) => Object.fromEntries(Object.entries(b).filter(([k]) => ALLOWED.includes(k)));

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const data = pick(await req.json());
    const project = await Project().findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error('[PUT /api/projects/[id]]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const project = await Project().findByIdAndDelete(params.id);
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('[DELETE /api/projects/[id]]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
