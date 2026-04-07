/**
 * @deprecated Use `GET /api/v1/maps` instead. This route is kept as a thin
 * wrapper for backward compatibility and emits a `Deprecation: true` header
 * + a one-time `console.warn` on every cold call. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listMapsAPI } from "@/app/admin/actions/maps";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/maps", "/api/v1/maps");
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
    return NextResponse.json(result.maps, {
      headers: deprecationHeaders("/api/v1/maps"),
    });
  } catch (error) {
    console.error("Error in GET /api/maps:", error);
    return NextResponse.json(
      { error: "Failed to fetch maps" },
      { status: 500 }
    );
  }
}
