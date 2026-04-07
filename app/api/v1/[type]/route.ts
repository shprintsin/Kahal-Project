/**
 * Public v1 list endpoint — `GET /api/v1/{type}`
 *
 * One handler that resolves the URL slug against the content-type registry
 * (`app/admin/system/content-type-registry`) and dispatches to the matching
 * action helper from `app/admin/actions/*`. This collapses ~10 near-duplicate
 * old routes into a single registry-driven entry point.
 *
 * Response: `{ data, pagination? }` with `Cache-Control: public, max-age=300`.
 *
 * If a content type is registered but has no entry in `_dispatch`, the
 * handler falls back to a generic `prisma.<model>.findMany` so newly added
 * registry types work without code changes (top-level fields only).
 */

import { NextRequest, NextResponse } from "next/server";
import { getContentType } from "@/app/admin/system/content-type-registry";
import prisma from "@/lib/prisma";
import { listHandlers } from "../_dispatch";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300",
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  const contentType = getContentType(type);
  // Special case: "maps" is not a registered content type — it shares the
  // Dataset model. The dispatch table handles it directly so the URL stays
  // friendly (/api/v1/maps).
  if (!contentType && type !== "maps") {
    return NextResponse.json(
      { error: `unknown content type: ${type}` },
      { status: 404 }
    );
  }

  const searchParams = req.nextUrl.searchParams;

  // 1. Preferred path: a typed dispatch handler that delegates to the
  //    existing admin action helper for this content type.
  const handler = listHandlers[type];
  if (handler) {
    try {
      const { items, pagination } = await handler(searchParams);
      return NextResponse.json(
        { data: items, ...(pagination ? { pagination } : {}) },
        { headers: PUBLIC_CACHE_HEADERS }
      );
    } catch (error) {
      console.error(`Error in GET /api/v1/${type}:`, error);
      return NextResponse.json(
        { error: `Failed to list ${type}` },
        { status: 500 }
      );
    }
  }

  // 2. Fallback: generic prisma findMany using the registry's `model` field.
  //    Only top-level scalar fields are returned. Used for content types that
  //    don't have a dedicated action helper yet.
  if (!contentType) {
    return NextResponse.json(
      { error: `no list handler for ${type}` },
      { status: 404 }
    );
  }

  const modelKey =
    contentType.model.charAt(0).toLowerCase() + contentType.model.slice(1);
  // Prisma's runtime client exposes models as `prisma.<camelCaseName>` but
  // its TypeScript types do not support indexed access. The `as any` is the
  // standard escape hatch — see https://github.com/prisma/prisma/issues/5273.
  const model = (prisma as unknown as Record<string, unknown>)[modelKey] as
    | {
        findMany: (args: unknown) => Promise<unknown[]>;
        count: (args: unknown) => Promise<number>;
      }
    | undefined;

  if (!model) {
    return NextResponse.json(
      { error: `prisma model not found: ${contentType.model}` },
      { status: 500 }
    );
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
  );

  // Only filter by status if the model actually has one. The registry knows.
  const where: Record<string, unknown> = {};
  const hasStatus = contentType.fields.some((f) => f.type === "status");
  if (hasStatus) {
    where.status = "published";
  }

  // Order by `updatedAt` if available, otherwise `createdAt`. Many taxonomy
  // models (Tag, Region, Category, Period) only have `createdAt`.
  const fieldKeys = contentType.fields.map((f) => f.key);
  const orderBy = fieldKeys.includes("updatedAt")
    ? { updatedAt: "desc" as const }
    : fieldKeys.includes("createdAt")
      ? { createdAt: "desc" as const }
      : undefined;

  try {
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        ...(orderBy ? { orderBy } : {}),
      }),
      model.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/${type} (generic):`, error);
    return NextResponse.json(
      { error: `Failed to list ${type}` },
      { status: 500 }
    );
  }
}
