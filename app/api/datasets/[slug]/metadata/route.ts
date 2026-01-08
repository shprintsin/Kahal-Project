import { NextRequest, NextResponse } from "next/server";
import { getDatasetMetadataBySlug } from "@/app/admin/actions/datasets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
    };

    const metadata = await getDatasetMetadataBySlug(slug, options);

    if (!metadata) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error in GET /api/datasets/[slug]/metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset metadata" },
      { status: 500 }
    );
  }
}
