/**
 * @deprecated Use `GET /api/v1/pages/{slug}` instead. Kept as a thin
 * wrapper for backward compatibility — emits a `Deprecation: true` header.
 * See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPageBySlug } from "@/app/admin/actions/pages";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/pages/[slug]", "/api/v1/pages/[slug]");
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      includeChildren: searchParams.get("includeChildren") === "true",
    };

    const page = await getPageBySlug(slug, options);

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page, {
      headers: deprecationHeaders("/api/v1/pages/[slug]"),
    });
  } catch (error) {
    console.error("Error in GET /api/pages/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
