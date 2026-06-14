import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Proxy middleware for Next.js 16+
 * Handles authentication redirection synchronously to avoid Edge Runtime CJS issues.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 1. Protected routes: redirect to login if no access token or refresh token
  if (pathname.startsWith('/dashboard') && !accessToken && !refreshToken) {
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }

  // 2. Auth routes: redirect to dashboard if already logged in
  if (pathname.startsWith('/auth') && accessToken) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Original matcher from boilerplate
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
