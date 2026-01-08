import { NextRequest, NextResponse } from "next/server";
import { getMapBySlug } from "@/app/admin/actions/maps";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeLayers: false, // Don't include layers, just config
      includeResources: false,
    };

    const map = await getMapBySlug(slug, options);

    if (!map) {
      return NextResponse.json(
        { error: "Map not found" },
        { status: 404 }
      );
    }

    // Return only the config
    return NextResponse.json({
      config: map.config,
      globalStyleConfig: map.globalStyleConfig
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error("Error in GET /api/geo/maps/[slug]/config:", error);
    return NextResponse.json(
      { error: "Failed to fetch map config" },
      { status: 500 }
    );
  }
}
