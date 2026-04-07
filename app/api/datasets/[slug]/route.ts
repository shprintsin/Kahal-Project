/**
 * @deprecated Use `GET /api/v1/datasets/{slug}` instead. Kept as a thin
 * wrapper for backward compatibility — emits a `Deprecation: true` header.
 * See A-4.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDatasetBySlug } from "@/app/admin/actions/datasets";
import { deprecationHeaders, warnDeprecated } from "../../_deprecated";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  warnDeprecated("/api/datasets/[slug]", "/api/v1/datasets/[slug]");
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeResources: searchParams.get("includeResources") === "true",
    };

    const dataset = await getDatasetBySlug(slug, options);

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dataset, {
      headers: deprecationHeaders("/api/v1/datasets/[slug]"),
    });
  } catch (error) {
    console.error("Error in GET /api/datasets/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    );
  }
}
