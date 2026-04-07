import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import prisma from '@/lib/prisma';

export type CliAuthSuccess = {
  ok: true;
  keyId: string;
  scopes: string[];
};

const ENV_KEY_DEFAULT_SCOPES = ['cli:deploy', 'cli:pull', 'cms:write'];

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf-8');
  const bBuf = Buffer.from(b, 'utf-8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function unauthorized(message: string, status = 401): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Validate Bearer token for CLI API routes.
 *
 * Auth lookup order:
 *   1. SHA-256(token) match against an unrevoked ApiKey row in the DB.
 *      If found, lastUsedAt is updated fire-and-forget and the row's
 *      scopes are returned.
 *   2. Fallback: timing-safe compare against the SHT_API_KEY env var.
 *      Returns the default deploy/pull/cms:write scope set on match.
 *      The env-var path is kept for backward compat with field CLIs
 *      and can be removed once all CLIs have been migrated to ApiKey.
 *
 * Returns NextResponse on auth failure (401/403/500), or a CliAuthSuccess
 * object describing the authenticated principal on success.
 */
export async function authenticateCli(
  req: NextRequest,
): Promise<NextResponse | CliAuthSuccess> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return unauthorized('Missing or invalid Authorization header', 401);
  }

  // 1. Try DB-backed ApiKey lookup.
  try {
    const hashedKey = hashToken(token);
    const row = await prisma.apiKey.findFirst({
      where: { hashedKey, revokedAt: null },
      select: { id: true, scopes: true },
    });
    if (row) {
      // Fire-and-forget lastUsedAt update — never block the request on this.
      prisma.apiKey
        .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
        .catch((err) => {
          console.warn('[cli-auth] failed to update lastUsedAt:', err);
        });
      return { ok: true, keyId: row.id, scopes: row.scopes };
    }
  } catch (err) {
    // Don't fail closed if the DB lookup explodes — log and fall through to
    // the env-var fallback so a temporary DB hiccup doesn't lock out the CLI.
    console.warn('[cli-auth] ApiKey DB lookup failed, falling back to env:', err);
  }

  // 2. Env-var fallback.
  const expectedKey = process.env.SHT_API_KEY;
  if (!expectedKey) {
    return unauthorized('SHT_API_KEY not configured on server', 500);
  }
  if (safeCompare(token, expectedKey)) {
    return { ok: true, keyId: 'env', scopes: [...ENV_KEY_DEFAULT_SCOPES] };
  }

  return unauthorized('Invalid API key', 403);
}
