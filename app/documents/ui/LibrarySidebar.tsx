'use client';

import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/types/document';

interface LibrarySidebarProps {
  documents: Document[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSlug?: string;
  onSelectDocument: (slug: string) => void;
}

export function LibrarySidebar({
  documents,
  searchQuery,
  setSearchQuery,
  selectedSlug,
  onSelectDocument,
}: LibrarySidebarProps) {

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return documents;
    const lowerQuery = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      (doc.slug && doc.slug.toLowerCase().includes(lowerQuery)) ||
      (doc.description && doc.description.toLowerCase().includes(lowerQuery))
    );
  }, [documents, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg text-gray-800 mb-4 text-right">Library</h2>
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dir-rtl"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No documents found.
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.slug)}
                className={cn(
                  "w-full text-right p-3 rounded-md hover:bg-gray-100 transition-colors group border border-transparent",
                  selectedSlug === doc.slug ? "bg-blue-50 border-blue-200" : ""
                )}
              >
                <div className="font-medium text-gray-900 line-clamp-2">
                  {doc.title}
                </div>
                {doc.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {doc.description}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 mt-2 flex justify-between">
                   <span suppressHydrationWarning>{new Date(doc.createdAt).toLocaleDateString()}</span>
                   <span className="uppercase">{doc.lang}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
