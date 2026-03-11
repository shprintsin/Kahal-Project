import { NextRequest, NextResponse } from "next/server";
import { getCollectionDetail } from "@/app/admin/actions/collections";

/**
 * GET /api/collections/[slug]
 * Returns collection details with series using slug lookup only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const collection = await getCollectionDetail(slug);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    return NextResponse.json(collection);
  } catch (error) {
    console.error('[API] Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}
