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
      { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
