import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/serverModels';
import { requireAuth } from '@/lib/serverAuth';

const ALLOWED = ['title','description','imageUrl','githubUrl','liveUrl','tags','featured','order'];
const pick = (b: Record<string,unknown>) => Object.fromEntries(Object.entries(b).filter(([k]) => ALLOWED.includes(k)));

export async function GET() {
  try {
    await connectDB();
    const projects = await Project().find().sort({ featured: -1, order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const data = pick(await req.json());
    if (!data.title || !data.description || !data.imageUrl)
      return NextResponse.json({ success: false, message: 'title, description and imageUrl are required' }, { status: 400 });
    const project = await Project().create(data);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/projects]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
