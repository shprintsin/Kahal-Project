/**
 * @deprecated Use `GET /api/v1/posts/{slug}` instead. Kept as a thin
 * wrapper for backward compatibility — emits a `Deprecation: true` header.
 * See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/app/admin/actions/posts";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/posts/[slug]", "/api/v1/posts/[slug]");
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, {
      headers: deprecationHeaders("/api/v1/posts/[slug]"),
    });
  } catch (error) {
    console.error("Error in GET /api/posts/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
