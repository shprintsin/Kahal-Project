/**
 * Public v1 single-record endpoint — `GET /api/v1/{type}/{slug}`
 *
 * Mirror of the catch-all list endpoint: resolves the URL slug against the
 * content-type registry, dispatches to a typed action helper if available,
 * and otherwise falls back to a generic `prisma.<model>.findUnique({ slug })`.
 *
 * Response: `{ data }` with `Cache-Control: public, max-age=300`, or 404 when
 * the record does not exist.
 */

import { NextRequest, NextResponse } from "next/server";
import { getContentType } from "@/app/admin/system/content-type-registry";
import prisma from "@/lib/prisma";
import { getHandlers } from "../../_dispatch";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300",
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params;

  const contentType = getContentType(type);
  // "maps" is not a registered content type — it shares the Dataset model.
  if (!contentType && type !== "maps") {
    return NextResponse.json(
      { error: `unknown content type: ${type}` },
      { status: 404 }
    );
  }

  const searchParams = req.nextUrl.searchParams;

  // 1. Preferred path: typed dispatch handler delegating to an action helper.
  const handler = getHandlers[type];
  if (handler) {
    try {
      const record = await handler(slug, searchParams);
      if (!record) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json(
        { data: record },
        { headers: PUBLIC_CACHE_HEADERS }
      );
    } catch (error) {
      console.error(`Error in GET /api/v1/${type}/${slug}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch ${type}` },
        { status: 500 }
      );
    }
  }

  // 2. Fallback: generic prisma findUnique. Top-level fields only.
  if (!contentType) {
    return NextResponse.json(
      { error: `no get handler for ${type}` },
      { status: 404 }
    );
  }

  const modelKey =
    contentType.model.charAt(0).toLowerCase() + contentType.model.slice(1);
  // See [type]/route.ts for an explanation of the `as any` cast.
  const model = (prisma as unknown as Record<string, unknown>)[modelKey] as
    | { findUnique: (args: unknown) => Promise<unknown | null> }
    | undefined;

  if (!model) {
    return NextResponse.json(
      { error: `prisma model not found: ${contentType.model}` },
      { status: 500 }
    );
  }

  try {
    const record = await model.findUnique({ where: { slug } });
    if (!record) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(
      { data: record },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/${type}/${slug} (generic):`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${type}` },
      { status: 500 }
    );
  }
}
