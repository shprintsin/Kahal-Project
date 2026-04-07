import { NextRequest, NextResponse } from 'next/server';
import { authenticateCli } from '../middleware';
import { deployMap } from './handlers/deploy-map';
import { deployLayer } from './handlers/deploy-layer';
import { deployData } from './handlers/deploy-data';

export const dynamic = 'force-dynamic';

/**
 * Unified CLI deploy action endpoint.
 *
 * Body shape: { action: string, data: object }
 *
 * Supported actions:
 *   - "map.deploy"     -> deployMap(data)
 *   - "layer.deploy"   -> deployLayer(data)
 *   - "dataset.deploy" -> deployData(data)
 *
 * Mirrors the /api/cms action envelope so the field-deployed CLI can talk to
 * a single endpoint instead of one URL per content type. The legacy per-type
 * routes (deploy/map, deploy/layer, deploy/data) still work — they're thin
 * wrappers that call the same handlers — and will be removed once all CLIs
 * have moved to this endpoint.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateCli(req);
  if (auth instanceof NextResponse) return auth;

  let body: { action?: unknown; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body is not valid JSON' },
      { status: 400 },
    );
  }

  const action = typeof body.action === 'string' ? body.action : undefined;
  const data = body.data;

  if (!action) {
    return NextResponse.json(
      { ok: false, error: 'missing action field' },
      { status: 400 },
    );
  }

  try {
    switch (action) {
      case 'map.deploy': {
        const result = await deployMap(data);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
      }
      case 'layer.deploy': {
        const result = await deployLayer(data);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
      }
      case 'dataset.deploy': {
        const result = await deployData(data);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
      }
      default:
        return NextResponse.json(
          { ok: false, error: `unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error('[cli-deploy] handler error:', err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
