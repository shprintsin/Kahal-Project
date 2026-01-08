import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/app/admin/actions/places";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const options = {
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      countryCode: searchParams.get("countryCode") || undefined,
    };

    const result = await searchPlaces(q, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/places/search:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
