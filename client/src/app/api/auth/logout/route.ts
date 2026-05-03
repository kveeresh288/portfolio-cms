import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/serverAuth';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  return clearAuthCookie(res);
}
