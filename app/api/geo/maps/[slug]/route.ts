/**
 * @deprecated Use `GET /api/v1/maps/{slug}` instead. Identical to
 * `/api/maps/{slug}` but historically served with public CORS + cache
 * headers. Kept as a thin wrapper for backward compatibility. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getMapBySlug } from "@/app/admin/actions/maps";
import { deprecationHeaders, warnDeprecated } from "../../../_deprecated";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/geo/maps/[slug]", "/api/v1/maps/[slug]");
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

    return NextResponse.json(map, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin":
          process.env.NEXTAUTH_URL || "http://localhost:3000",
        ...deprecationHeaders("/api/v1/maps/[slug]"),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/geo/maps/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch map" },
      { status: 500 }
    );
  }
}
