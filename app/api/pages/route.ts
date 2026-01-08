import { NextRequest, NextResponse } from "next/server";
import { listPagesAPI } from "@/app/admin/actions/pages";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      language: searchParams.get("language") || undefined,
      template: searchParams.get("template") || undefined,
      showInMenu: searchParams.has("showInMenu") ? searchParams.get("showInMenu") === "true" : undefined,
      parentId: searchParams.has("parentId") ? searchParams.get("parentId") || null : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "title" | "menuOrder") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
    };

    const result = await listPagesAPI(options);
    // Return just the pages array for simpler frontend consumption
    return NextResponse.json(result.pages);
  } catch (error) {
    console.error("Error in GET /api/pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
