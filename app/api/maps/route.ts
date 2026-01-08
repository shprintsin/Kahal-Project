import { NextRequest, NextResponse } from "next/server";
import { listMapsAPI } from "@/app/admin/actions/maps";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      year: searchParams.get("year")
        ? parseInt(searchParams.get("year")!)
        : undefined,
      yearMin: searchParams.get("yearMin")
        ? parseInt(searchParams.get("yearMin")!)
        : undefined,
      yearMax: searchParams.get("yearMax")
        ? parseInt(searchParams.get("yearMax")!)
        : undefined,
      period: searchParams.get("period") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "title" | "year") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listMapsAPI(options);
    // Return just the maps array for simpler frontend consumption
    return NextResponse.json(result.maps);
  } catch (error) {
    console.error("Error in GET /api/maps:", error);
    return NextResponse.json(
      { error: "Failed to fetch maps" },
      { status: 500 }
    );
  }
}
