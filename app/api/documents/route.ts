import { NextResponse } from "next/server";
import { getAllDocumentsWithPages, getDocumentsMetadata } from "@/app/admin/actions/documents";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metadataOnly = searchParams.get('metadataOnly') === 'true';

    // console.log(`[API] Fetching documents ${metadataOnly ? '(metadata only)' : '(full)'}...`);
    
    let documents;
    if (metadataOnly) {
        documents = await getDocumentsMetadata();
    } else {
        documents = await getAllDocumentsWithPages();
    }
    
    // console.log('[API] Success! Got', documents.length, 'documents');
    return NextResponse.json(documents);
  } catch (error) {
    console.error('[API] Error in /api/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
