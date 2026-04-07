/**
 * @deprecated Use `GET /api/v1/layers` instead. Near-duplicate of
 * `/api/layers` (filters to status=published only). Kept as a thin wrapper
 * for backward compatibility. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listLayersAPI } from "@/app/admin/actions/layers";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

/**
 * GET /api/geo/layers
 * Public endpoint for listing published layers.
 */
export async function GET(request: NextRequest) {
  warnDeprecated("/api/geo/layers", "/api/v1/layers?status=published");
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: "published",
      categorySlug: searchParams.get("category") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      type: searchParams.get("type") || undefined,
      year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined,
      yearMin: searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined,
      yearMax: searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined,
      maturity: searchParams.get("maturity") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "name" | "minYear") || "createdAt",
      order: (searchParams.get("order") as "asc" | "desc") || "desc",
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listLayersAPI(options);

    return NextResponse.json(result.layers, {
      headers: deprecationHeaders("/api/v1/layers?status=published"),
    });
  } catch (error) {
    console.error("Error in GET /api/geo/layers:", error);
    return NextResponse.json({ error: "Failed to fetch layers" }, { status: 500 });
  }
}
