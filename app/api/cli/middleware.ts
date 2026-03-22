import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf-8');
  const bBuf = Buffer.from(b, 'utf-8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Validate Bearer token for CLI API routes.
 * Compares against CLI_API_KEY environment variable using timing-safe comparison.
 */
export function authenticateCli(req: NextRequest): NextResponse | null {
  const expectedKey = process.env.CLI_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: 'CLI_API_KEY not configured on server' },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7);
  if (!safeCompare(token, expectedKey)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  return null; // auth passed
}
