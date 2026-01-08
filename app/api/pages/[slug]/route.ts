import { NextRequest, NextResponse } from "next/server";
import { getPageBySlug } from "@/app/admin/actions/pages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error in GET /api/pages/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
