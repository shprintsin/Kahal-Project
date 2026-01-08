import { NextRequest, NextResponse } from "next/server";
import { getPageHierarchy } from "@/app/admin/actions/pages";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      status: searchParams.get("status") || undefined,
      language: searchParams.get("language") || undefined,
    };

    const result = await getPageHierarchy(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/pages/hierarchy:", error);
    return NextResponse.json(
      { error: "Failed to fetch page hierarchy" },
      { status: 500 }
    );
  }
}
