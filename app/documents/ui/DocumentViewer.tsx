'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentWithPages } from '@/types/document';
import { DocumentPageRenderer } from './DocumentPageRenderer';
import { ViewerToolbar } from './ViewerToolbar';

interface DocumentViewerProps {
  document: DocumentWithPages;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [language, setLanguage] = useState<'original' | 'he' | 'en'>('original');
  
  // Initialize from URL
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 1 && page <= document.pages.length) {
        setCurrentPage(page);
        // Scroll to page on mount
        setTimeout(() => {
          const el = window.document.getElementById(`page-${page - 1}`);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  // Track current page via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    document.pages.forEach((page, index) => {
      const el = window.document.getElementById(`page-${index}`);
      if (el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                setCurrentPage(index + 1);
              }
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [document.pages]);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const el = window.document.getElementById(`page-${page - 1}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ViewerToolbar
        currentPage={currentPage}
        totalPages={document.pages.length}
        zoom={zoom}
        onPageChange={handlePageChange}
        onZoomChange={handleZoomChange}
        language={language}
        onLanguageChange={setLanguage}
      />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-8 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          className="flex flex-col items-center"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {document.pages.map((page, index) => {
            // Render Window: 3 pages before and 3 pages after current page
            const RENDER_WINDOW = 3;
            const pageNum = index + 1;
            const shouldRender = Math.abs(currentPage - pageNum) <= RENDER_WINDOW;
            
            let contentOverride = null;
            if (language === 'he' && page.contentHe) contentOverride = page.contentHe;
            if (language === 'en' && page.contentEn) contentOverride = page.contentEn;

            return (
              <DocumentPageRenderer 
                key={page.id} 
                page={page} 
                isFirstPage={index === 0}
                isLastPage={index === document.pages.length - 1}
                shouldRenderContent={shouldRender}
                contentOverride={contentOverride}
              />
            );
          })}
        </div>
        
        {document.pages.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            This document has no content pages.
          </div>
        )}
      </div>
    </div>
  );
}
