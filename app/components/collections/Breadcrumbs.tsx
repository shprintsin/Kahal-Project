"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  collectionId: string;
  volumeId: string;
}

export default function Breadcrumbs({ collectionId, volumeId }: BreadcrumbsProps) {
  return (
    <div className="bg-gray-100 px-8 py-3 border-b border-gray-300">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Link href="/collections" className="hover:text-gray-900 transition-colors">
          Collections
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/collections/${collectionId}`}
          className="hover:text-gray-900 transition-colors"
        >
          {collectionId}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">
          Volume {volumeId}
        </span>
      </div>
    </div>
  );
}
