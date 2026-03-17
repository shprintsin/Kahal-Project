'use client';

import React from 'react';
import { DocumentWithPages } from '@/types/document';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Calendar, Globe, FileText, ExternalLink, Scale } from 'lucide-react';

interface DocumentSidebarProps {
  document: DocumentWithPages;
}

export function DocumentSidebar({ document }: DocumentSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white text-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-base text-gray-800 line-clamp-3" dir="auto">
          {document.title}
        </h2>
        {document.titleEn && document.titleEn !== document.title && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{document.titleEn}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Metadata Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Document Info
            </h3>

            {/* Description */}
            {document.description && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Description</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed pl-5" dir="auto">
                  {document.description}
                </p>
              </div>
            )}

            {/* Year */}
            {document.year && (
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{document.year}</span>
              </div>
            )}

            {/* Language */}
            {document.lang && (
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700 uppercase">{document.lang}</span>
              </div>
            )}

            {/* Category */}
            {document.category && (
              <div className="flex items-center gap-2 text-xs">
                <Book className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{document.category}</span>
              </div>
            )}

            {/* Volume */}
            {document.volume && (
              <div className="flex items-center gap-2 text-xs">
                <Book className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">Volume: {document.volume}</span>
              </div>
            )}

            {/* Reference */}
            {document.reference && (
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{document.reference}</span>
              </div>
            )}

            {/* Reference URL */}
            {document.referenceUrl && (
              <div className="flex items-center gap-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                <a 
                  href={document.referenceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  View Source
                </a>
              </div>
            )}

            {/* License */}
            {document.license && (
              <div className="flex items-center gap-2 text-xs">
                <Scale className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{document.license}</span>
              </div>
            )}
          </div>

          {/* Page Count */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total Pages</span>
              <span className="font-medium text-gray-700">{document.pages.length}</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
