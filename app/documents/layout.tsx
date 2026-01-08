import React from 'react';
import { getDocumentsMetadata } from '@/app/admin/actions/documents';
import { DocumentsClientLayout } from './client-layout';

// This is a Server Component layout
export const dynamic = 'force-dynamic';
export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch documents on the server to pass to the client sidebar
  let documents: any[] = [];
  try {
    documents = await getDocumentsMetadata();
  } catch (error) {
    console.warn("Failed to fetch documents metadata during build/render:", error);
    documents = [];
  }

  return (
    <DocumentsClientLayout documents={documents}>
      {children}
    </DocumentsClientLayout>
  );
}
