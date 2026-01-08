"use client";

import { useState, useRef } from 'react';
import { useViewer } from '@/contexts/ViewerContext';
import { Search } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { IVolumeEntry } from '@/types/collections';

interface RSidebarProps {
  volume: IVolumeEntry;
}

export default function RSidebar({ volume }: RSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { state, setCurrentPage, totalPages } = useViewer();
  const { open, setOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useClickOutside(sidebarRef as React.RefObject<HTMLElement>, () => {
    if (open) {
      setOpen(false);
    }
  }, open);

  return (
    <Sidebar ref={sidebarRef} side="right" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Search className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Search</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Search in Collection</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative px-2">
              <SidebarInput
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {searchQuery && (
          <SidebarGroup>
            <SidebarGroupLabel>Search Results</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-48">
                <div className="p-3 text-sm text-gray-600">
                  No results found for "{searchQuery}"
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
