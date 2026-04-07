// @deprecated — prefer POST /api/cli/deploy with { action: "map.deploy", data }
//
// This route exists only as a backward-compat shim for field-deployed CLI
// clients that still hit the old per-type URL. It calls the extracted
// deployMap handler directly so behaviour is identical to the unified
// action endpoint, just with a different request envelope. Remove once all
// CLIs have been migrated to /api/cli/deploy.

import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../../middleware';
import { deployMap } from '../handlers/deploy-map';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const result = await deployMap(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    console.error('[cli-deploy/map shim] handler error:', err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
