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
      includeLayers: searchParams.get("includeLayers") !== "false", // Default true
      includeResources: searchParams.get("includeResources") === "true",
    };

    const map = await getMapBySlug(slug, options);

    if (!map) {
      return NextResponse.json(
        { error: "Map not found" },
        { status: 404 }
      );
    }

    // Add geoJsonUrl to each layer
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    const enhancedMap = {
      ...map,
      layers: map.layers?.map((layer: any) => ({
        ...layer,
        geoJsonUrl: `${baseUrl}/api/geo/geojson/${layer.id}`
      }))
    };

    return NextResponse.json(enhancedMap);
  } catch (error) {
    console.error("Error in GET /api/maps/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch map" },
      { status: 500 }
    );
  }
}
