import { NextRequest, NextResponse } from "next/server";
import { getSeriesBySlugs } from "@/app/admin/actions/collections";

/**
 * GET /api/collections/[collectionSlug]/[seriesSlug]
 * Returns series details with volumes using slug-only lookup
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; seriesSlug: string }> }
) {
  try {
    const { slug: collectionSlug, seriesSlug } = await params;

    console.log(`[API] Fetching series: collection=${collectionSlug}, series=${seriesSlug}`);

    const series = await getSeriesBySlugs(collectionSlug, seriesSlug);

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('[API] Error fetching series:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch series' },
      { status: 500 }
    );
  }
}
