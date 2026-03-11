import { NextResponse } from "next/server";
import { getAllDocumentsWithPages, getDocumentsMetadata } from "@/app/admin/actions/documents";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metadataOnly = searchParams.get('metadataOnly') === 'true';

    
    let documents;
    if (metadataOnly) {
        documents = await getDocumentsMetadata();
    } else {
        documents = await getAllDocumentsWithPages();
    }
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('[API] Error in /api/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
