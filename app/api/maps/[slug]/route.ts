/**
 * @deprecated Use `GET /api/v1/maps/{slug}` instead. Kept as a thin
 * wrapper for backward compatibility — emits a `Deprecation: true` header.
 * See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getMapBySlug } from "@/app/admin/actions/maps";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/maps/[slug]", "/api/v1/maps/[slug]");
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeLayers: searchParams.get("includeLayers") !== "false",
      includeResources: searchParams.get("includeResources") === "true",
    };

    const map = await getMapBySlug(slug, options);

    if (!map) {
      return NextResponse.json(
        { error: "Map not found" },
        { status: 404 }
      );
    }

    // Add geoJsonUrl to each layer for legacy clients
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const enhancedMap = {
      ...map,
      layers: map.layers?.map((layer: any) => ({
        ...layer,
        geoJsonUrl: `${baseUrl}/api/geo/geojson/${layer.id}`,
      })),
    };

    return NextResponse.json(enhancedMap, {
      headers: deprecationHeaders("/api/v1/maps/[slug]"),
    });
  } catch (error) {
    console.error("Error in GET /api/maps/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch map" },
      { status: 500 }
    );
  }
}
