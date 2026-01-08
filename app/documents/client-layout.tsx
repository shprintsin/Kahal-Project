'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LibrarySidebar } from './ui/LibrarySidebar';
import { Document } from '@/types/document';
import { Loader2 } from 'lucide-react';

interface DocumentsClientLayoutProps {
  children: React.ReactNode;
  documents: Document[];
}

export function DocumentsClientLayout({ children, documents }: DocumentsClientLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const docSlug = searchParams.get('doc'); // Actually, route param [slug] is better but user wants ?doc= style?
  // Wait, if we use /documents/[slug], we don't need ?doc=. 
  // The plan said: "clicking a doc navigates to /documents/[slug]".
  // So selectedSlug should be derived from the path, but `useSelectedLayoutSegment` is tricky in a layout if it's dynamic.
  // Actually, I can just use `window.location` or assume the child page handles selection highlighting.
  // But the Sidebar is HERE in the layout.
  // Let's pass the selection handler to navigate to /documents/[slug].

  const handleSelectDocument = (slug: string) => {
    router.push(`/documents/${slug}`);
  };

  // Extract selected slug from URL if possible, or maybe just rely on highlighting matching slug.
  // We can't easily get the [slug] param in a layout component in Next.js app dir easily without props.params which layout receives?
  // Layout receives params! 
  // Actually, `layout.tsx` doesn't receive `params` prop with the route params of children in the same way.
  // But simpler: The child is what renders. The sidebar is always there.

  // Let's check `searchParams` for now or better, let's use the URL. 
  // Since we are pushing `/documents/${slug}`, we can match it.
  
  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-gray-100 overflow-hidden" dir="ltr">
        {/* Main Content Area (Center + Left Sidebar if doc selected) */}
        <div className="flex-1 h-full relative overflow-y-auto">
             {children}
        </div>

        {/* Right Sidebar: Library Search */}
        <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shrink-0">
             <LibrarySidebar 
                documents={documents}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedSlug={undefined} // We can fix highlighting later or use a Client Component hook to read the path
                onSelectDocument={handleSelectDocument}
             />
        </div>
    </div>
  );
}
