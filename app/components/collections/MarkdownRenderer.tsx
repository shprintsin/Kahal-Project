"use client";

import { useState, useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

interface MarkdownRendererProps {
  content: string;
  pageLabel: string;
}

/**
 * Markdown renderer using unified/remark for proper HTML conversion
 */
export default function MarkdownRenderer({ 
  content,
  pageLabel
}: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse markdown to HTML
  useEffect(() => {
    let cancelled = false;
    
    const parseMarkdown = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Parse markdown to HTML using unified
        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(content);
        
        const html = String(file);
        
        if (!cancelled) {
          setHtmlContent(html);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error parsing markdown:', err);
          setError(err instanceof Error ? err.message : 'Failed to parse content');
          setIsLoading(false);
        }
      }
    };

    parseMarkdown();
    
    return () => {
      cancelled = true;
    };
  }, [content]);

  // Detect language from content (simple heuristic)
  const detectLanguage = (): 'rtl' | 'ltr' => {
    // Check for Hebrew/Yiddish characters
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(content) ? 'rtl' : 'ltr';
  };

  const dir = detectLanguage();
  const textAlign = dir === 'rtl' ? 'right' : 'left';
  
  // Use serif fonts that match historical document typography
  const fontFamily = dir === 'rtl'
    ? '"Frank Ruhl Libre", "Times New Roman", serif' 
    : '"Playfair Display", "Georgia", "Times New Roman", serif';

  if (error) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-medium">שגיאה בטעינת התוכן</p>
        <p className="text-sm mt-2">{error}</p>
        <p className="text-xs mt-4 text-gray-400">{pageLabel}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      style={{
        fontFamily,
        textAlign,
        fontSize: '14px',
        lineHeight: '1.6',
      }}
      className="prose prose-sm max-w-none markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
