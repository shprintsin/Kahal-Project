import { NextRequest, NextResponse } from "next/server";
import { listLayersAPI, createLayer } from "@/app/admin/actions/layers";

/**
 * GET /api/layers
 * List all layers with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      type: searchParams.get("type") || undefined,
      year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined,
      yearMin: searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined,
      yearMax: searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined,
      maturity: searchParams.get("maturity") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "name" | "minYear") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listLayersAPI(options);
    // Return with 'docs' key for consistency with other endpoints
    return NextResponse.json({
      docs: result.layers,
      ...result.pagination,
    });
  } catch (error) {
    console.error("Error in GET /api/layers:", error);
    return NextResponse.json({ error: "Failed to fetch layers" }, { status: 500 });
  }
}

/**
 * POST /api/layers
 * Create a new layer (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const layer = await createLayer(body);
    return NextResponse.json(layer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/layers:", error);
    return NextResponse.json({ error: "Failed to create layer" }, { status: 500 });
  }
}
