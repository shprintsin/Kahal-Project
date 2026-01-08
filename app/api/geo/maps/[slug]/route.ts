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

    return NextResponse.json(map, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error("Error in GET /api/geo/maps/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch map" },
      { status: 500 }
    );
  }
}
