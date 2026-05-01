'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ParsedDocument,
  DOCUMENT_V2_LOCALES,
  DocumentV2Locale,
  chapterDomId,
  resolveI18nString,
} from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import { ReadingCanvas } from './ReadingCanvas';
import { InspectorTabs } from './InspectorTabs';
import { ViewerToolbar } from './ViewerToolbar';
import { useActiveChapter } from '../lib/use-active-chapter';

interface DocumentReaderProps {
  doc: ParsedDocument;
}

function isLocale(v: string | null): v is DocumentV2Locale {
  return !!v && (DOCUMENT_V2_LOCALES as readonly string[]).includes(v);
}

/**
 * Per-document content of the docs-v2 segment: the centre column (toolbar +
 * reading canvas) and the right-side inspector. The persistent chrome (top
 * bar, library rail, route layout) lives in `DocsV2Shell` one level up.
 */
export function DocumentReader({ doc }: DocumentReaderProps) {
  const routeLocale = useLocale() as Locale;
  const t = useTranslations('documentsV2');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Available languages: source + every translation lang seen across chapters.
  const availableLanguages = useMemo<DocumentV2Locale[]>(() => {
    const langs = new Set<DocumentV2Locale>([doc.meta.sourceLang]);
    for (const ch of doc.chapters) {
      for (const lang of Object.keys(ch.translations)) {
        if (isLocale(lang)) langs.add(lang);
      }
    }
    return [...langs];
  }, [doc]);

  const urlLangRaw = searchParams.get('lang');
  const translationLang: DocumentV2Locale =
    isLocale(urlLangRaw) && availableLanguages.includes(urlLangRaw)
      ? urlLangRaw
      : availableLanguages.find((l) => l !== doc.meta.sourceLang) ?? doc.meta.sourceLang;

  const showOnlyJews = searchParams.get('mention_jews') === 'true';
  const visibleChapters = useMemo(
    () => (showOnlyJews ? doc.chapters.filter((c) => c.mentionJews) : doc.chapters),
    [doc.chapters, showOnlyJews],
  );

  const chapterSlugs = useMemo(() => visibleChapters.map((c) => c.slug), [visibleChapters]);
  const activeSlug = useActiveChapter(canvasRef, chapterSlugs);
  const urlChapter = searchParams.get('chapter');
  const currentChapterSlug = urlChapter ?? activeSlug ?? chapterSlugs[0] ?? null;

  const [zoom, setZoom] = useState(100);

  const docLocale = routeLocale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;
  const title = resolveI18nString(doc.meta.nameI18n, docLocale, docFallback);
  const isRtl = docLocale === 'he' || docLocale === 'yi';

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang) => ({
        value: lang,
        label:
          lang === doc.meta.sourceLang
            ? t('toolbarLanguageOriginalShort', { lang: t(`lang.${lang}`) })
            : t(`lang.${lang}`),
        isOriginal: lang === doc.meta.sourceLang,
      })),
    [availableLanguages, doc.meta.sourceLang, t],
  );

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateParams = useCallback(
    (mutator: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      mutator(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const handleLanguageChange = useCallback(
    (lang: DocumentV2Locale) => {
      updateParams((p) => {
        if (lang === doc.meta.sourceLang) p.delete('lang');
        else p.set('lang', lang);
      });
    },
    [doc.meta.sourceLang, updateParams],
  );

  const handleToggleMentionJews = useCallback(() => {
    updateParams((p) => {
      if (p.get('mention_jews') === 'true') p.delete('mention_jews');
      else p.set('mention_jews', 'true');
      p.delete('chapter');
    });
  }, [updateParams]);

  const scrollToChapter = useCallback((slug: string) => {
    const container = canvasRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`#${CSS.escape(chapterDomId(slug))}`);
    if (!el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = container.scrollTop + (elRect.top - containerRect.top) - 32;
    container.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleJumpToChapter = useCallback(
    (slug: string) => {
      updateParams((p) => p.set('chapter', slug));
      // Schedule the scroll for after the URL param→state propagates.
      requestAnimationFrame(() => scrollToChapter(slug));
    },
    [scrollToChapter, updateParams],
  );

  // Initial scroll: if the URL named a chapter on first load, jump to it
  // once the canvas is mounted.
  useEffect(() => {
    if (!urlChapter) return;
    const id = requestAnimationFrame(() => scrollToChapter(urlChapter));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll → URL: keep `?chapter=` in sync with the active section.
  useEffect(() => {
    if (!activeSlug) return;
    if (activeSlug === urlChapter) return;
    const id = window.setTimeout(() => {
      updateParams((p) => p.set('chapter', activeSlug));
    }, 250);
    return () => window.clearTimeout(id);
  }, [activeSlug, urlChapter, updateParams]);

  const currentIndex =
    chapterSlugs.findIndex((s) => s === currentChapterSlug) >= 0
      ? chapterSlugs.findIndex((s) => s === currentChapterSlug) + 1
      : 1;
  const totalVisible = Math.max(1, chapterSlugs.length);

  const handlePrev = useCallback(() => {
    const idx = chapterSlugs.findIndex((s) => s === currentChapterSlug);
    const target = chapterSlugs[Math.max(0, idx - 1)] ?? chapterSlugs[0];
    if (target) handleJumpToChapter(target);
  }, [chapterSlugs, currentChapterSlug, handleJumpToChapter]);

  const handleNext = useCallback(() => {
    const idx = chapterSlugs.findIndex((s) => s === currentChapterSlug);
    const target =
      chapterSlugs[Math.min(chapterSlugs.length - 1, idx + 1)] ??
      chapterSlugs[chapterSlugs.length - 1];
    if (target) handleJumpToChapter(target);
  }, [chapterSlugs, currentChapterSlug, handleJumpToChapter]);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ViewerToolbar
          currentIndex={currentIndex}
          totalChapters={totalVisible}
          onPrev={handlePrev}
          onNext={handleNext}
          zoom={zoom}
          onZoomChange={setZoom}
          language={translationLang}
          languageOptions={languageOptions}
          onLanguageChange={handleLanguageChange}
          mentionJewsActive={showOnlyJews}
          onToggleMentionJews={handleToggleMentionJews}
          labels={{
            chapter: t('toolbarChapter'),
            of: t('toolbarOf'),
            prev: t('toolbarPrevChapter'),
            next: t('toolbarNextChapter'),
            zoomIn: t('toolbarZoomIn'),
            zoomOut: t('toolbarZoomOut'),
            language: t('toolbarLanguage'),
            mentionJews: t('toolbarMentionJews'),
          }}
        />
        <ReadingCanvas
          ref={canvasRef}
          chapters={visibleChapters}
          sourceLang={doc.meta.sourceLang}
          translationLang={translationLang}
          displayLocale={docLocale}
          fallbackLocale={docFallback}
          isRtl={isRtl}
          zoom={zoom}
          labels={{
            chapter: t('toolbarChapter'),
            mentionsJews: t('mentionsJews'),
            noTranslation: t('noTranslation'),
          }}
        />
      </div>
      <div className="hidden md:contents">
        <InspectorTabs
          title={title || doc.meta.slug}
          meta={doc.meta}
          chapters={visibleChapters}
          activeSlug={currentChapterSlug}
          onJumpToChapter={handleJumpToChapter}
          displayLocale={docLocale}
          fallbackLocale={docFallback}
          labels={{
            contents: t('inspectorContents'),
            details: t('inspectorDetails'),
            citation: t('citation'),
            url: t('url'),
            dateRange: t('dateRange'),
            chaptersCount: (n: number) => t('inspectorChaptersCount', { n }),
          }}
        />
      </div>
    </>
  );
}
