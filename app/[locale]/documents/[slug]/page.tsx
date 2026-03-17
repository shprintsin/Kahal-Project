import React from 'react';
import { notFound } from 'next/navigation';
import { getDocumentBySlug } from '@/app/admin/actions/documents';
import { DocumentViewer } from '../ui/DocumentViewer';
import { DocumentSidebar } from '../ui/DocumentSidebar';
import { SetEditUrl } from '@/components/ui/admin-toolbar';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getDocumentBySlug(slug);
  const document = result.success ? result.data : null;

  if (!document) {
    notFound();
  }

  return (
    <div className="flex w-full h-full bg-gray-50 overflow-hidden">
      <SetEditUrl url={`/admin/documents/${document.id}`} />
      <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shrink-0">
         <DocumentSidebar document={document} />
      </div>

      {/* Center: Viewer */}
      <div className="flex-1 h-full relative overflow-y-auto">
         <DocumentViewer document={document} />
      </div>
    </div>
  );
}
