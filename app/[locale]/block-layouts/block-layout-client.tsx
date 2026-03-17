'use client';

import { ContentBlocks } from '@/components/ui/content-blocks';
import type { ContentBlocksProps } from '@/components/ui/content-blocks';

export type { ContentBlocksProps as BlockLayoutProps };

export default function BlockLayoutClient(props: ContentBlocksProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6 w-full px-4 sm:px-6 lg:w-10/12 mx-auto py-10">
        <ContentBlocks {...props} />
      </div>
    </div>
  );
}
