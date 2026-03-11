import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listLayersAPI, createLayer } from "@/app/admin/actions/layers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseIntSafe = (val: string | null) => {
      if (!val) return undefined;
      const n = parseInt(val);
      return isNaN(n) ? undefined : n;
    };

    const options = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      tagSlug: searchParams.get("tag") || undefined,
      regionId: searchParams.get("regionId") || undefined,
      regionSlug: searchParams.get("region") || undefined,
      type: searchParams.get("type") || undefined,
      year: parseIntSafe(searchParams.get("year")),
      yearMin: parseIntSafe(searchParams.get("yearMin")),
      yearMax: parseIntSafe(searchParams.get("yearMax")),
      maturity: searchParams.get("maturity") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseIntSafe(searchParams.get("page")),
      limit: parseIntSafe(searchParams.get("limit")),
      sort: (searchParams.get("sort") as "createdAt" | "updatedAt" | "name" | "minYear") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      lang: searchParams.get("lang") || undefined,
    };

    const result = await listLayersAPI(options);
    return NextResponse.json({
      docs: result.layers,
      ...result.pagination,
    });
  } catch (error) {
    console.error("Error in GET /api/layers:", error);
    return NextResponse.json({ error: "Failed to fetch layers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const layer = await createLayer(body);
    return NextResponse.json(layer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/layers:", error);
    return NextResponse.json({ error: "Failed to create layer" }, { status: 500 });
  }
}
