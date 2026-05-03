/**
 * Server-side auth utilities for Next.js Route Handlers.
 */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

export function signToken(id: string, email: string): string {
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  const cookieParts = [
    `token=${token}`,
    `Path=${COOKIE.path}`,
    `Max-Age=${COOKIE.maxAge}`,
    `SameSite=${COOKIE.sameSite}`,
    `HttpOnly`,
    ...(COOKIE.secure ? ['Secure'] : []),
  ];
  response.headers.set('Set-Cookie', cookieParts.join('; '));
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.headers.set('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  return response;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('token')?.value ?? null;
}

export interface JwtPayload {
  id: string;
  email: string;
  preAuth?: boolean;
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

/** Use in protected Route Handlers. Returns { id, email } or a 401 Response. */
export function requireAuth(req: NextRequest): { id: string; email: string } | NextResponse {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const payload = verifyToken(token);
    if (payload.preAuth) return NextResponse.json({ success: false, message: 'MFA verification required' }, { status: 401 });
    return { id: payload.id, email: payload.email };
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
  }
}
