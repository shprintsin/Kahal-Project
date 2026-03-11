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

  // Defaults
  const initialLang = (searchParams.get('lang') as 'original' | 'he' | 'en') || 'he';
  const initialSecLang = (searchParams.get('secLang') as 'original' | 'he' | 'en') || 'en';

  const [language, setLanguage] = useState<'original' | 'he' | 'en'>(initialLang);
  const [viewMode, setViewMode] = useState<'single' | 'side-by-side'>('single');
  const [secondaryLanguage, setSecondaryLanguage] = useState<'original' | 'he' | 'en'>(initialSecLang);

  // Sync from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('doc_lang') as any;
    const savedSecLang = localStorage.getItem('doc_sec_lang') as any;
    
    if (!searchParams.get('lang') && savedLang) setLanguage(savedLang);
    if (!searchParams.get('secLang') && savedSecLang) setSecondaryLanguage(savedSecLang);
  }, []);

  // Sync to URL & LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', language);
    params.set('secLang', secondaryLanguage);
    localStorage.setItem('doc_lang', language);
    localStorage.setItem('doc_sec_lang', secondaryLanguage);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [language, secondaryLanguage]);

  // Helper to get content
  const getContent = (page: any, lang: string) => {
    if (lang === 'he') return page.contentHe || page.content;
    if (lang === 'en') return page.contentEn || page.content;
    return page.content;
  };
  
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
      const el = window.document.getElementById(`page-wrapper-${index}`);
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
  }, [document.pages, viewMode]); // Re-observe when view mode changes

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const el = window.document.getElementById(`page-wrapper-${page - 1}`);
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        secondaryLanguage={secondaryLanguage}
        onSecondaryLanguageChange={setSecondaryLanguage}
      />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-8 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          className="flex flex-col items-center gap-8 px-4"
          style={{ 
            transform: viewMode === 'single' ? `scale(${zoom / 100})` : 'none', 
            transformOrigin: 'top center',
            width: viewMode === 'side-by-side' ? '100%' : 'auto'
          }}
        >
          {document.pages.map((page, index) => {
            // Render Window: 3 pages before and 3 pages after current page
            const RENDER_WINDOW = 3;
            const pageNum = index + 1;
            const shouldRender = Math.abs(currentPage - pageNum) <= RENDER_WINDOW;
            
            const getContent = (lang: string) => {
                if (lang === 'he') return page.contentHe;
                if (lang === 'en') return page.contentEn;
                return page.content;
            };

            return (
              <div 
                key={page.id} 
                id={`page-wrapper-${index}`}
                className={`transition-all duration-300 ${viewMode === 'side-by-side' ? 'w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8' : 'w-auto'}`}
              >
                  {/* Primary View */}
                  <DocumentPageRenderer 
                    page={page} 
                    isFirstPage={index === 0}
                    isLastPage={index === document.pages.length - 1}
                    shouldRenderContent={shouldRender}
                    contentOverride={getContent(language)}
                    viewMode={viewMode}
                  />

                  {/* Secondary View */}
                  {viewMode === 'side-by-side' && (
                     <DocumentPageRenderer 
                        page={page} 
                        isFirstPage={index === 0}
                        isLastPage={index === document.pages.length - 1}
                        shouldRenderContent={shouldRender}
                        contentOverride={getContent(secondaryLanguage)}
                        viewMode={viewMode}
                        isSecondary
                      />
                  )}
              </div>
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
