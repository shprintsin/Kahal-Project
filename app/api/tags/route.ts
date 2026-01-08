import { NextRequest, NextResponse } from "next/server";
import { listTagsAPI } from "@/app/admin/actions/tags";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get("search") || undefined,
      sort: (searchParams.get("sort") as "name" | "createdAt" | "usageCount") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listTagsAPI(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
