import React from 'react';
import { notFound } from 'next/navigation';
import { getDocumentBySlug } from '@/lib/api';
import { ArchiveLayout } from '@/app/archive/ui/ArchiveLayout';
import { DocumentViewer } from '@/app/documents/ui/DocumentViewer';
import { DocumentSidebar } from '@/app/documents/ui/DocumentSidebar';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  return (
    <div className="flex w-full h-full bg-gray-50 overflow-hidden">
      {/* Left Sidebar: Outline / Bookmarks */}
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
