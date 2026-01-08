import { NextRequest, NextResponse } from "next/server";
import { getPlaceByGeocode } from "@/app/admin/actions/places";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ geocode: string }> }
) {
  try {
    const { geocode } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      includeAdministrative: searchParams.get("includeAdministrative") === "true",
      includeArtifacts: searchParams.get("includeArtifacts") === "true",
    };

    const place = await getPlaceByGeocode(geocode, options);

    if (!place) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error("Error in GET /api/places/[geocode]:", error);
    return NextResponse.json(
      { error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}
