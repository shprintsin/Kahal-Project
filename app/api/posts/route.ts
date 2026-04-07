/**
 * @deprecated Use `GET /api/v1/posts` instead. Kept as a thin wrapper for
 * backward compatibility — emits a `Deprecation: true` header. See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { listPostsAPI } from "@/app/admin/actions/posts";
import { deprecationHeaders, warnDeprecated } from "../_deprecated";

export async function GET(request: NextRequest) {
  warnDeprecated("/api/posts", "/api/v1/posts");
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      language: searchParams.get("language") || undefined,
      translationGroup: searchParams.get("translationGroup") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "title") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
    };

    const result = await listPostsAPI(options);
    return NextResponse.json(result.posts, {
      headers: deprecationHeaders("/api/v1/posts"),
    });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
