import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/app/admin/actions/categories";

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
      contentType: (searchParams.get("contentType") as "posts" | "series" | "datasets" | "maps") || undefined,
    };

    const category = await getCategoryBySlug(slug, options);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error in GET /api/categories/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
