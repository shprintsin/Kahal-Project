import { NextRequest, NextResponse } from "next/server";
import { listPlacesAPI } from "@/app/admin/actions/places";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get("search") || undefined,
      countryCode: searchParams.get("countryCode") || undefined,
      admin1: searchParams.get("admin1") || undefined,
      bounds: searchParams.get("bounds") || undefined,
      hasCoordinates: searchParams.get("hasCoordinates") === "true",
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
    };

    const result = await listPlacesAPI(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}
