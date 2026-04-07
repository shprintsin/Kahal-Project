/**
 * @deprecated Use `GET /api/v1/tags` instead. Kept as a thin wrapper for
 * backward compatibility — emits a `Deprecation: true` header. See A-4.
 *
 * NOTE: Returns the full `{ tags, total }` envelope (not just the array)
 * for legacy parity. The v1 endpoint uses the standard `{ data }` shape.
 */
import { NextRequest, NextResponse } from "next/server";
import { listTagsAPI } from "@/app/admin/actions/tags";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/tags", "/api/v1/tags");
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
    return NextResponse.json(result, {
      headers: deprecationHeaders("/api/v1/tags"),
    });
  } catch (error) {
    console.error("Error in GET /api/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
