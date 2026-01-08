import { NextRequest, NextResponse } from "next/server";
import { listDatasetsAPI } from "@/app/admin/actions/datasets";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
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
    // Return just the datasets array for simpler frontend consumption
    return NextResponse.json(result.datasets);
  } catch (error) {
    console.error("Error in GET /api/datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}
