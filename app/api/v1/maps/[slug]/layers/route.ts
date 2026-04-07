/**
 * Public v1 relation endpoint — `GET /api/v1/maps/{slug}/layers`
 *
 * Returns the ordered list of Layer records associated with a Dataset (map),
 * including the per-association display metadata (zIndex, isVisible,
 * isVisibleByDefault) under `association`. Special-cased because the v1
 * catch-all only resolves a single record, not its many-to-many edges.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300",
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const map = await prisma.dataset.findUnique({
      where: { slug },
      include: {
        layers: {
          include: { layer: true },
          orderBy: { zIndex: "asc" },
        },
      },
    });

    if (!map) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const data = map.layers.map((assoc) => ({
      ...assoc.layer,
      association: {
        zIndex: assoc.zIndex,
        isVisible: assoc.isVisible,
        isVisibleByDefault: assoc.isVisibleByDefault,
      },
    }));

    return NextResponse.json({ data }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error(`Error in GET /api/v1/maps/${slug}/layers:`, error);
    return NextResponse.json(
      { error: "Failed to fetch map layers" },
      { status: 500 }
    );
  }
}
