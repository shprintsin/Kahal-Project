import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ViewerProvider } from '@/contexts/ViewerContext';
import VolumeViewer from './VolumeViewer';
import type { Volume } from '@/types/collections';

interface PageProps {
  params: Promise<{
    collectionId: string;
    volumeId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageRange?: string;
  }>;
}

async function getVolumeData(
  collectionId: string,
  volumeId: string
): Promise<Volume | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/collections/${collectionId}/volumes/${volumeId}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching volume:', error);
    return null;
  }
}

export default async function VolumePage({ params, searchParams }: PageProps) {
  const { collectionId, volumeId } = await params;
  const { page, pageRange } = await searchParams;
  
  const volume = await getVolumeData(collectionId, volumeId);
  
  if (!volume) {
    notFound();
  }

  // const initialPage = page ? parseInt(page, 10) : 1;
  
  // Parse page range if provided (format: "5-10")
  // let initialPageRange;
  // if (pageRange) {
  //   const match = pageRange.match(/^(\d+)-(\d+)$/);
  //   if (match) {
  //     const start = parseInt(match[1], 10);
  //     const end = parseInt(match[2], 10);
  //     if (start <= end) {
  //       initialPageRange = { start, end };
  //     }
  //   }
  // }

  return (
    <>
    
    <p>

{/* {JSON.stringify(volume)} */}

    </p>
    </>
    // <ViewerProvider 
    //   initialPage={initialPage}
    //   initialPageRange={initialPageRange}
    // >
    //   <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
    //     <VolumeViewer 
    //       volume={volume}
    //       collectionId={collectionId}
    //       volumeId={volumeId}
    //     />
    //   </Suspense>
    // </ViewerProvider>
  );
}


// "use client";

// import { useEffect } from 'react';
// import { useViewer } from '@/contexts/ViewerContext';
// import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
// import { usePageNavigation } from '@/hooks/usePageNavigation';
// import TopToolbar from '@/app/components/collections/TopToolbar';
// import RSidebar from '@/app/components/collections/LeftSidebar';
// import LSidebar from '@/app/components/collections/RightSidebar';
// import MainCanvas from '@/app/components/collections/MainCanvas';
// import VolumeDetailsSection from '@/app/components/collections/VolumeDetailsSection';
// import { SidebarProvider, SidebarTrigger } from '@/app/components/ui/sidebar';

// export default function VolumeViewer({ 
//   volume, 
//   collectionId, 
//   volumeId 
// }) {
//   const { setTotalPages } = useViewer();
  
//   // Initialize total pages
//   useEffect(() => {
//     setTotalPages(volume.total_pages || volume.pages.length);
//   }, [volume, setTotalPages]);

//   // Enable keyboard shortcuts
//   useKeyboardShortcuts();

//   // Enable page navigation with URL sync
//   usePageNavigation({ collectionId, volumeId });

//   return (
//     <SidebarProvider defaultOpen={false}>
//       <div className="flex flex-col min-h-screen w-full bg-[#f4f4f4]">
//         {/* Top Toolbar */}
//         <TopToolbar 
//           collectionId={collectionId}
//           volumeId={volumeId}
//           volumeTitle={volume.metadata.title}
//         />

//         {/* Main Content Area */}
//         <div className="flex flex-1 overflow-hidden">
//           {/* Left Sidebar - */}
//           <LSidebar volume={volume} />

//           {/* Main Canvas */}
//           <MainCanvas volume={volume} />

//           {/* Right Sidebar - Hidden by default */}
//           <RSidebar volume={volume} />
//         </div>

//         {/* Volume Details Section - Below Viewer */}
//         <VolumeDetailsSection 
//           volume={volume}
//           collectionId={collectionId}
//           volumeId={volumeId}
//         />
//       </div>
//     </SidebarProvider>
//   );
// }
