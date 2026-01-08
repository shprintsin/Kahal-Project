import { NextRequest, NextResponse } from "next/server";
import { getTagBySlug } from "@/app/admin/actions/tags";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeContent: searchParams.get("includeContent") === "true",
    };

    const tag = await getTagBySlug(slug, options);

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error in GET /api/tags/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}
