'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ParsedDocumentV2,
  DOCUMENT_V2_LOCALES,
  DocumentV2Locale,
  resolveI18nString,
} from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';
import { ReadingCanvas } from './ReadingCanvas';
import { InspectorTabs } from './InspectorTabs';
import { DocumentSearchBar, type SearchScope } from './DocumentSearchBar';
import { SearchHighlightStyles } from './SearchHighlightStyles';
import { SearchResultsPanel, type SearchResult } from './SearchResultsPanel';
import { ViewerToolbar } from './ViewerToolbar';
import { HighlightContextMenu } from './HighlightContextMenu';
import { useHighlights } from '../lib/highlights/use-highlights';
import { useActivePage } from '../lib/use-active-page';
import { useActiveHeading } from '../lib/use-active-heading';
import { useDocumentSearch } from '../lib/use-document-search';
import { useAlignPageNumbers } from '../lib/use-align-page-numbers';

interface DocumentReaderProps {
  doc: ParsedDocumentV2;
}

/**
 * Per-document content of the docs-v2 segment: the centre column (toolbar +
 * reading canvas) and the right-side inspector. The persistent chrome (top
 * bar, library rail, route layout) lives in `DocsV2Shell` one level up.
 *
 * Returns two top-level grid siblings via a fragment so the layout's
 * `grid-cols-[280px _ 1fr _ 320px]` slots them into columns 2 and 3.
 */
export function DocumentReader({ doc }: DocumentReaderProps) {
  const routeLocale = useLocale() as Locale;
  const t = useTranslations('documentsV2');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Submitted-query search state. The query persists across renders so highlights stay
  // until the user clears or submits a new search.
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('doc');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMarkOpen, setSearchMarkOpen] = useState('«MARK»');
  const [searchMarkClose, setSearchMarkClose] = useState('«/MARK»');
  // The redesigned toolbar gates the in-doc search bar behind a ⌕ toggle. The bar
  // stays open while results are showing or the user has typed a query, so closing
  // it from the toggle clears state to match the visual disappearance.
  const [searchOpen, setSearchOpen] = useState(false);

  // Build the set of available languages: the original (`meta.lang`) + every translation that
  // shipped a sibling file. Order: original first, then translations in declaration order.
  const availableLanguages = useMemo<DocumentV2Locale[]>(() => {
    const langs = [doc.meta.lang, ...doc.translations.map((tr) => tr.lang)];
    return Array.from(new Set(langs));
  }, [doc.meta.lang, doc.translations]);

  const urlLangRaw = searchParams.get('lang');
  const isLocale = (v: string | null): v is DocumentV2Locale =>
    !!v && (DOCUMENT_V2_LOCALES as readonly string[]).includes(v);
  const selectedLang: DocumentV2Locale =
    isLocale(urlLangRaw) && availableLanguages.includes(urlLangRaw)
      ? urlLangRaw
      : doc.meta.lang;

  // Pick the variant for the selected language. Original lives directly on `doc`; translations
  // live in `doc.translations`. Search/scroll/active-page all key off the active variant.
  const activeView = useMemo(() => {
    if (selectedLang === doc.meta.lang) {
      return { markdown: doc.markdown, toc: doc.toc, markers: doc.markers };
    }
    const tr = doc.translations.find((t) => t.lang === selectedLang);
    return tr
      ? { markdown: tr.markdown, toc: tr.toc, markers: tr.markers }
      : { markdown: doc.markdown, toc: doc.toc, markers: doc.markers };
  }, [selectedLang, doc]);

  const totalPages = Math.max(1, activeView.markers.length);

  const { activePageNumber } = useActivePage(canvasRef, activeView.markers);
  const activeHeading = useActiveHeading(canvasRef, activeView.toc);
  useDocumentSearch(canvasRef, searchQuery, activeView.markdown);
  useAlignPageNumbers(canvasRef, activeView.markdown);

  const [zoom, setZoom] = useState(100);

  // ID of the highlight whose inline note editor should auto-focus in the
  // Notes panel — set by the context menu's "Add note" action and cleared
  // once the editor commits or is dismissed.
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null);

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang) => ({
        value: lang,
        label:
          lang === doc.meta.lang
            ? t('toolbarLanguageOriginalShort', { lang: t(`lang.${lang}`) })
            : t(`lang.${lang}`),
        isOriginal: lang === doc.meta.lang,
      })),
    [availableLanguages, doc.meta.lang, t],
  );

  const handleToggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      const next = !prev;
      // Closing the bar should also clear pending state so highlights / results
      // don't linger off-screen and re-appear next time.
      if (!next) {
        setSearchQuery('');
        setSearchResults(null);
      }
      return next;
    });
  }, []);

  // Markdown for each available language, ready to be offered as a download from the
  // metadata panel. Original first, translations in declaration order.
  const downloadVariants = useMemo(
    () =>
      availableLanguages.map((lang) => {
        const isOriginal = lang === doc.meta.lang;
        const markdown = isOriginal
          ? doc.markdown
          : doc.translations.find((tr) => tr.lang === lang)?.markdown ?? '';
        const langName = t(`lang.${lang}`);
        return {
          lang,
          markdown,
          label: isOriginal ? t('downloadOriginalLabel', { lang: langName }) : langName,
        };
      }),
    [availableLanguages, doc.markdown, doc.meta.lang, doc.translations, t],
  );

  const urlPageRaw = searchParams.get('page');
  const urlPage = (() => {
    const n = Number(urlPageRaw);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, totalPages) : null;
  })();

  // Display the URL page when present; otherwise follow the IO observer.
  const currentPage = urlPage ?? (activePageNumber > 0 ? activePageNumber : 1);

  // Local user-highlight state. Per (slug, lang); persisted to localStorage.
  const highlightsApi = useHighlights({
    slug: doc.meta.slug,
    lang: selectedLang,
    containerRef: canvasRef,
    contentVersion: activeView.markdown,
    currentPage,
  });

  const docLocale = routeLocale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;
  const title = resolveI18nString(doc.meta.title, docLocale, docFallback);
  const isRtl = selectedLang === 'he' || selectedLang === 'yi';

  const scrollWithinCanvas = useCallback((el: HTMLElement) => {
    const container = canvasRef.current;
    if (!container) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = container.scrollTop + (elRect.top - containerRect.top) - 32;
    container.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleJumpHeading = useCallback(
    (id: string) => {
      const el = canvasRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (el) scrollWithinCanvas(el);
    },
    [scrollWithinCanvas],
  );

  const scrollToPage = useCallback(
    (page: number) => {
      const container = canvasRef.current;
      if (!container) return;
      if (page <= 1) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // Page N's badge anchor (`.page-marker-num` of the Nth marker, 1-based) is JS-aligned
      // by `useAlignPageNumbers` to the visual top of page N. The marker span itself is a
      // 0-sized element that sits on the *last* line of page N-1, so scrolling to that span
      // would land on the wrong page.
      const markersInDom = container.querySelectorAll<HTMLElement>('.page-marker');
      const marker = markersInDom[page - 1];
      const target = marker?.querySelector<HTMLElement>('.page-marker-num') ?? marker;
      if (target) scrollWithinCanvas(target);
      else container.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [scrollWithinCanvas],
  );

  // Mirror searchParams into a ref so callbacks don't take a new identity each render
  // (useSearchParams returns a fresh ReadonlyURLSearchParams object every render).
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // URL drives the navigation: writing `?page=N` triggers the scroll. Using `router.replace`
  // (not push) keeps history clean and `scroll: false` prevents Next from jumping to top.
  const handleJumpToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set('page', String(clamped));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, totalPages],
  );

  // Switching language remaps the document body. Clear `?page=` so we don't try to scroll to
  // a stale page index in the new variant (page counts can differ between translations).
  const handleLanguageChange = useCallback(
    (lang: DocumentV2Locale) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (lang === doc.meta.lang) params.delete('lang');
      else params.set('lang', lang);
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, doc.meta.lang],
  );

  // When the URL change originates from natural scrolling (the sync effect below), we don't
  // want the URL → scroll effect to bounce the canvas back. This ref signals that case.
  const skipScrollOnNextUrlChange = useRef(false);

  // URL → scroll: react to user-initiated `?page=` changes only.
  useEffect(() => {
    if (urlPage === null) return;
    if (skipScrollOnNextUrlChange.current) {
      skipScrollOnNextUrlChange.current = false;
      return;
    }
    const id = requestAnimationFrame(() => scrollToPage(urlPage));
    return () => cancelAnimationFrame(id);
  }, [urlPage, scrollToPage]);

  // Scroll → URL: keep `?page=` in sync as the IntersectionObserver updates the active page.
  // Debounced so a single scroll gesture across many markers doesn't trigger a render storm
  // (one router.replace per crossed marker → one route re-render per replace).
  useEffect(() => {
    if (activePageNumber <= 0) return;
    if (activePageNumber === urlPage) return;
    const id = window.setTimeout(() => {
      skipScrollOnNextUrlChange.current = true;
      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set('page', String(activePageNumber));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 250);
    return () => window.clearTimeout(id);
  }, [activePageNumber, urlPage, pathname, router]);

  return (
    <>
      <SearchHighlightStyles />
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ViewerToolbar
          currentPage={currentPage}
          totalPages={Math.max(1, totalPages)}
          onJumpToPage={handleJumpToPage}
          zoom={zoom}
          onZoomChange={setZoom}
          language={selectedLang}
          languageOptions={languageOptions}
          onLanguageChange={handleLanguageChange}
          searchOpen={searchOpen}
          onToggleSearch={handleToggleSearch}
          labels={{
            page: t('toolbarPage'),
            of: t('toolbarOf'),
            prevPage: t('toolbarPrevPage'),
            nextPage: t('toolbarNextPage'),
            zoomIn: t('toolbarZoomIn'),
            zoomOut: t('toolbarZoomOut'),
            language: t('toolbarLanguage'),
            searchInDoc: t('toolbarSearchInDoc'),
          }}
        />
        {searchOpen && (
        <DocumentSearchBar
          scope={searchScope}
          onScopeChange={setSearchScope}
          isLoading={searchLoading}
          resultsCount={searchResults?.length ?? null}
          onSubmit={async (q) => {
            setSearchLoading(true);
            setSearchQuery(q);
            try {
              const params = new URLSearchParams({
                q,
                scope: searchScope,
                limit: '50',
              });
              if (searchScope === 'doc') params.set('slug', doc.meta.slug);
              const res = await fetch(`/api/documents-v2/search?${params.toString()}`);
              const json = await res.json();
              if (json.ok) {
                setSearchResults(json.results as SearchResult[]);
                if (typeof json.markOpen === 'string') setSearchMarkOpen(json.markOpen);
                if (typeof json.markClose === 'string') setSearchMarkClose(json.markClose);
              } else {
                setSearchResults([]);
              }
            } catch {
              setSearchResults([]);
            } finally {
              setSearchLoading(false);
            }
          }}
          onClear={() => {
            setSearchQuery('');
            setSearchResults(null);
          }}
          labels={{
            placeholder: t('searchInDocument'),
            submit: t('searchSubmit'),
            clear: t('searchClear'),
            scopeDoc: t('searchScopeDoc'),
            scopeAll: t('searchScopeAll'),
            resultsCount: (n: number) => t('searchResultsCount', { n }),
            noResults: t('searchInDocumentEmpty'),
          }}
        />
        )}
        {searchResults !== null ? (
          <SearchResultsPanel
            results={searchResults}
            query={searchQuery}
            scope={searchScope}
            currentSlug={doc.meta.slug}
            routeLocale={routeLocale}
            markOpen={searchMarkOpen}
            markClose={searchMarkClose}
            onJumpToPage={(page, lang) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(page));
              if (lang && lang !== doc.meta.lang) params.set('lang', lang);
              else params.delete('lang');
              router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              setSearchResults(null);
            }}
            labels={{
              title: t('searchResultsTitle'),
              empty: (q: string) => t('searchResultsEmpty', { q }),
              page: t('toolbarPage'),
            }}
          />
        ) : (
          <HighlightContextMenu
            containerRef={canvasRef}
            findHighlightAtPoint={highlightsApi.findHighlightAtPoint}
            onAddFromSelection={highlightsApi.addFromSelection}
            onRemove={highlightsApi.remove}
            onRequestNote={(id) => setNoteEditingId(id)}
            labels={{
              highlight: t('highlightSelection'),
              remove: t('highlightRemove'),
              addNote: t('highlightAddNote'),
              copy: t('highlightCopy'),
            }}
          >
            <ReadingCanvas
              ref={canvasRef}
              markdown={activeView.markdown}
              isRtl={isRtl}
              zoom={zoom}
            />
          </HighlightContextMenu>
        )}
      </div>
        <div className="hidden md:contents">
          <InspectorTabs
            title={title || doc.meta.slug}
            meta={doc.meta}
            toc={activeView.toc}
            activeId={activeHeading}
            onJump={handleJumpHeading}
            activeLang={selectedLang}
            downloads={downloadVariants}
            highlights={highlightsApi.highlights}
            noteEditingId={noteEditingId}
            onClearNoteEditing={() => setNoteEditingId(null)}
            onJumpToHighlight={highlightsApi.scrollToHighlight}
            onRemoveHighlight={highlightsApi.remove}
            onSetHighlightNote={highlightsApi.setNote}
            pageCount={activeView.markers.length}
            side="right"
            labels={{
              contents: t('inspectorContents'),
              details: t('inspectorDetails'),
              notes: t('inspectorNotes'),
              notesEmpty: t('inspectorNotesEmpty'),
              highlightLabel: t('highlightLabel'),
              noteLabel: t('noteLabel'),
              notePagePrefix: (n: number) => t('notePagePrefix', { n }),
              noteEditPlaceholder: t('noteEditPlaceholder'),
              addNote: t('highlightAddNote'),
              removeHighlight: t('highlightRemove'),
              sectionsCount: (n: number) => t('inspectorSectionsCount', { n }),
              archive: t('archive'),
              license: t('license'),
              year: t('year'),
              pages: t('pages'),
              downloads: t('downloads'),
              downloadMarkdownTitle: (lang) => t('downloadMarkdown', { lang }),
            }}
          />
        </div>
    </>
  );
}
