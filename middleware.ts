import createIntlMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const SKIP_INTL = ['/admin', '/api', '/uploads', '/login', '/_next'];

const securityHeaders = new Headers({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const skipIntl = SKIP_INTL.some(p => pathname.startsWith(p));
  const response = skipIntl
    ? NextResponse.next()
    : intlMiddleware(req as unknown as NextRequest);

  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
