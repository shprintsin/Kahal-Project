/**
 * @deprecated Use `GET /api/v1/categories/{slug}` instead. Kept as a thin
 * wrapper for backward compatibility — emits a `Deprecation: true` header.
 * See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/app/admin/actions/categories";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/categories/[slug]", "/api/v1/categories/[slug]");
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeContent: searchParams.get("includeContent") === "true",
      contentType: (searchParams.get("contentType") as "posts" | "series" | "datasets" | "maps") || undefined,
    };

    const category = await getCategoryBySlug(slug, options);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, {
      headers: deprecationHeaders("/api/v1/categories/[slug]"),
    });
  } catch (error) {
    console.error("Error in GET /api/categories/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
