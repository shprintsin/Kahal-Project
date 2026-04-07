/**
 * @deprecated Use `GET /api/v1/pages` instead. Kept as a thin wrapper for
 * backward compatibility — emits a `Deprecation: true` header. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listPagesAPI } from "@/app/admin/actions/pages";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/pages", "/api/v1/pages");
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
    return NextResponse.json(result.pages, {
      headers: deprecationHeaders("/api/v1/pages"),
    });
  } catch (error) {
    console.error("Error in GET /api/pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
