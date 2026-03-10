import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { DocumentPage } from '@/types/document';

interface DocumentPageRendererProps {
  page: DocumentPage;
  isFirstPage?: boolean;
  isLastPage?: boolean;

  shouldRenderContent?: boolean;
  contentOverride?: string | null;
  viewMode?: 'single' | 'side-by-side';
  isSecondary?: boolean;
}

// Simple heuristic to detect if text is primarily Hebrew
function isHebrew(text: string): boolean {
  if (!text) return false;
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text.slice(0, 100));
}

export const DocumentPageRenderer = React.memo(function DocumentPageRenderer({ 
  page, 
  isFirstPage, 
  isLastPage,
  shouldRenderContent = true,
  contentOverride,
  viewMode = 'single',
  isSecondary = false
}: DocumentPageRendererProps) {
  const contentToRender = contentOverride || page.content;
  const isRtl = isHebrew(contentToRender);
  const isSplit = viewMode === 'side-by-side';

  return (
    <div 
      id={!isSecondary ? `page-${page.index}` : undefined} 
      className={cn(
        "relative w-full mx-auto bg-white overflow-hidden transition-shadow",
        isSplit 
            ? "border border-gray-200 rounded-lg p-6 min-h-[400px]" 
            : "max-w-[180mm] shadow-md mb-6 p-[15mm] min-h-[250mm] hover:shadow-lg",
        "print:shadow-none print:mb-0 print:break-after-page",
        isRtl ? "dir-rtl" : "dir-ltr"
      )}
      dir={isRtl ? "rtl" : "ltr"}
      style={{ fontFamily: "'Times New Roman', Georgia, 'Noto Serif Hebrew', serif" }}
    >
      {/* Page Header / Number */}
      <div className="absolute top-3 left-3 right-3 flex justify-between text-[10px] text-gray-400 select-none font-sans">
        <span>{page.filename || 'Untitled'}</span>
        <span>Page {page.index + 1} {isSecondary ? '(Secondary)' : ''}</span>
      </div>

      {shouldRenderContent ? (
        <div className={cn(
          "prose prose-sm max-w-none relative mt-4",
          isRtl ? "prose-rtl text-right" : "text-left"
        )}
        style={{ 
          fontFamily: "'Times New Roman', Georgia, 'Noto Serif Hebrew', serif",
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          hyphens: 'auto',
          width: '100%',
        }}
        >
          <style jsx global>{`
            .pdf-content {
              counter-reset: para;
            }
            .pdf-content p {
              position: relative;
              counter-increment: para;
              margin-bottom: 0.75em;
              line-height: 1.7;
            }
            .pdf-content p::before {
              content: counter(para);
              position: absolute;
              ${isRtl ? 'right: -2em;' : 'left: -2em;'}
              top: 0;
              font-size: 0.65em;
              color: #bbb;
              user-select: none;
              width: 1.5em;
              text-align: ${isRtl ? 'left' : 'right'};
              font-family: sans-serif;
            }
            .pdf-content h1, .pdf-content h2, .pdf-content h3 {
              font-family: 'Times New Roman', Georgia, serif;
            }
            .pdf-content table {
              font-size: 0.9em;
              border-collapse: collapse;
              width: 100%;
            }
            .pdf-content th, .pdf-content td {
              border: 1px solid #ddd;
              padding: 0.5em;
            }
          `}</style>
          <div className="pdf-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
              components={{
                p: ({ node, children, ...props }) => <p {...props}>{children}</p>,
                img: ({ node, ...props }) => <img {...props} className="max-w-full h-auto mx-auto" />,
              }}
            >
              {contentToRender}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        /* Skeleton / Placeholder when not visible */
        <div className="flex items-center justify-center p-20 text-gray-100">
           <div className="text-4xl animate-pulse">...</div>
        </div>
      )}

      {/* Page Footer */}
      <div className="absolute bottom-3 left-3 right-3 text-center text-[10px] text-gray-300 select-none font-sans">
        {page.bookmark && <span className="font-medium text-gray-400">{page.bookmark}</span>}
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.page.id === next.page.id && 
    prev.page.content === next.page.content && 
    prev.shouldRenderContent === next.shouldRenderContent &&
    prev.contentOverride === next.contentOverride &&
    prev.viewMode === next.viewMode &&
    prev.isSecondary === next.isSecondary
  );
});
