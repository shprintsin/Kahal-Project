import { NextResponse } from "next/server";
import { listCollectionsWithSeries } from "@/app/admin/actions/collections";

export async function GET() {
  try {
    // console.log('[API] Fetching collections with series...');
    const response = await listCollectionsWithSeries();
    // console.log('[API] Success! Got', response.length, 'collections');
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error in /api/collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
