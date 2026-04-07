/**
 * @deprecated Use `GET /api/v1/categories` instead. Kept as a thin wrapper
 * for backward compatibility — emits a `Deprecation: true` header. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listCategoriesAPI } from "@/app/admin/actions/categories";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/categories", "/api/v1/categories");
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get("search") || undefined,
      sort: (searchParams.get("sort") as "title" | "createdAt" | "usageCount") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listCategoriesAPI(options);
    return NextResponse.json(result.categories, {
      headers: deprecationHeaders("/api/v1/categories"),
    });
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
