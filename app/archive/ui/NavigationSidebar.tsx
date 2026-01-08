'use client';

import { CollectionWithSeries } from '@/types/collections';
import { TreeNode } from '@/types/archive.types';
import { SidebarTree } from './SidebarTree';

interface NavigationSidebarProps {
  collections: CollectionWithSeries[];
  selectedCollectionSlug?: string | null;
  selectedSeriesSlug?: string | null;
  onSelectCollection?: (collectionSlug: string) => void;
  onSelectSeries?: (seriesSlug: string) => void;
}

export function NavigationSidebar({ 
  collections,
  selectedCollectionSlug,
  selectedSeriesSlug,
  onSelectCollection,
  onSelectSeries
}: NavigationSidebarProps) {
  // Build current path for highlighting
  let currentPath = '/archive';
  if (selectedCollectionSlug) {
    currentPath = `/archive/${selectedCollectionSlug}`;
    if (selectedSeriesSlug) {
      currentPath = `/archive/${selectedCollectionSlug}/${selectedSeriesSlug}`;
    }
  }

  // Convert collections to tree structure with links
  const treeNodes: TreeNode[] = collections.map(col => ({
    id: col.id,
    type: 'collection',
    label: (col.nameI18n as any)?.he || (col.nameI18n as any)?.en || col.name,
    count: col.series?.length || col.seriesCount || 0,
    href: `/archive/${col.id}`,
    children: (col.series || []).map(series => ({
      id: series.slug,
      type: 'series',
      label: (series.nameI18n as any)?.he || (series.nameI18n as any)?.en || series.slug,
      count: series.volumes?.length || series.volumeCount || 0,
      href: `/archive/${col.id}/${series.slug}`,
    })),
  }));

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-right">ארכיון</h2>
      <SidebarTree 
        nodes={treeNodes}
        currentPath={currentPath}
      />
    </div>
  );
}
