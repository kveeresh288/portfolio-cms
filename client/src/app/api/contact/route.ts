import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/serverEmail';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name?.trim() || !email?.trim() || !message?.trim())
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 });

    await sendContactEmail({ name, email }, message);
    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('[POST /api/contact]', err);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
