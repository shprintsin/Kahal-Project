import { NextRequest, NextResponse } from "next/server";
import { getPostTranslations } from "@/app/admin/actions/posts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const translations = await getPostTranslations(slug);

    if (!translations) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(translations);
  } catch (error) {
    console.error("Error in GET /api/posts/[slug]/translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}
