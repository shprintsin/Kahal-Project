'use client';

import { BreadcrumbItem } from '@/types/archive.types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6" dir="rtl">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href ? (
            <Link 
              href={item.href}
              className={`hover:text-emerald-900 transition-colors ${
                item.isActive ? 'text-emerald-900 font-semibold' : ''
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.isActive ? 'text-emerald-900 font-semibold' : ''}>
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <ChevronLeft className="w-4 h-4 mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
