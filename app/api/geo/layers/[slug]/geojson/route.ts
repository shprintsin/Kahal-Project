import { NextRequest, NextResponse } from "next/server";
import { getLayerBySlug } from "@/app/admin/actions/layers";

/**
 * GET /api/geo/layers/[slug]/geojson
 * Serve GeoJSON data for a layer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const layer = await getLayerBySlug(slug);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Only serve published layers
    if (layer.status !== "published") {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Handle different source types
    if (layer.sourceType === "database" && layer.geoJsonData) {
      // Serve GeoJSON from database
      return NextResponse.json(layer.geoJsonData, {
        headers: {
          "Content-Type": "application/geo+json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      });
    } else if (layer.sourceType === "url" && layer.sourceUrl) {
      // Redirect to external URL
      return NextResponse.redirect(layer.sourceUrl);
    } else {
      return NextResponse.json(
        { error: "GeoJSON data not available for this layer" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/geo/layers/[slug]/geojson:", error);
    return NextResponse.json({ error: "Failed to fetch GeoJSON" }, { status: 500 });
  }
}
