import { NextResponse } from "next/server";
import { listCollectionsWithSeries } from "@/app/admin/actions/collections";

export async function GET() {
  try {
    const response = await listCollectionsWithSeries();
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error in /api/collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
