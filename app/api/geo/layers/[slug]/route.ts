import { NextRequest, NextResponse } from "next/server";
import { getLayerBySlug } from "@/app/admin/actions/layers";

/**
 * GET /api/geo/layers/[slug]
 * Public endpoint for getting a single published layer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeMaps: searchParams.get("includeMaps") === "true",
    };

    const layer = await getLayerBySlug(slug, options);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Only return published layers
    if (layer.status !== "published") {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json(layer);
  } catch (error) {
    console.error("Error in GET /api/geo/layers/[slug]:", error);
    return NextResponse.json({ error: "Failed to fetch layer" }, { status: 500 });
  }
}
