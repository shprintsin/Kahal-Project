/**
 * @deprecated Use `GET /api/v1/datasets` instead. Kept as a thin wrapper
 * for backward compatibility — emits a `Deprecation: true` header. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listDatasetsAPI } from "@/app/admin/actions/datasets";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/datasets", "/api/v1/datasets");
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      maturity: searchParams.get("maturity") || undefined,
      yearMin: searchParams.get("yearMin")
        ? parseInt(searchParams.get("yearMin")!)
        : undefined,
      yearMax: searchParams.get("yearMax")
        ? parseInt(searchParams.get("yearMax")!)
        : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "title") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listDatasetsAPI(options);
    return NextResponse.json(result.datasets, {
      headers: deprecationHeaders("/api/v1/datasets"),
    });
  } catch (error) {
    console.error("Error in GET /api/datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}
