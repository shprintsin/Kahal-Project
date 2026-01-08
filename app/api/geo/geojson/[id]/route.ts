import { NextRequest, NextResponse } from "next/server";
import { getLayer } from "@/app/admin/actions/layers";

/**
 * GET /api/geo/geojson/[id]
 * Serve GeoJSON data for a layer by ID
 * Used by frontend Map components that reference layers by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const layer = await getLayer(id);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Only serve published layers, UNLESS it's requested from a trusted context?
    // For now, mirroring public API behavior: only published.
    // If the frontend map viewer uses this for previewing non-published layers (e.g. via token), it might need adjustment.
    // But getLayer checks permission? No, it's public.
    // Actually, getLayer is a server action suitable for public use if filtered.
    // app/api/routes are public.
    if (layer.status !== "published") {
       // If developing locally or preview mode, maybe allow?
       // For now strict.
       return NextResponse.json({ error: "Layer not found or not published" }, { status: 404 });
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
    console.error("Error in GET /api/geo/geojson/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch GeoJSON" }, { status: 500 });
  }
}
