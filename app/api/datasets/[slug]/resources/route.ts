import { NextRequest, NextResponse } from "next/server";
import { getDatasetResourcesBySlug } from "@/app/admin/actions/datasets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      format: searchParams.get("format") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await getDatasetResourcesBySlug(slug, options);

    if (!result) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/datasets/[slug]/resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset resources" },
      { status: 500 }
    );
  }
}
