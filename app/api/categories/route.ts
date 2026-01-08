import { NextRequest, NextResponse } from "next/server";
import { listCategoriesAPI } from "@/app/admin/actions/categories";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get("search") || undefined,
      sort: (searchParams.get("sort") as "title" | "createdAt" | "usageCount") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listCategoriesAPI(options);
    // Return just the categories array for simpler frontend consumption
    return NextResponse.json(result.categories);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
