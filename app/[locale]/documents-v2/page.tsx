import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getDocumentList } from './lib/repository';
import { resolveI18nString, type DocumentV2Locale } from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function DocumentsV2IndexPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'documentsV2' });
  const docs = await getDocumentList();
  const docLocale = locale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
          {t('library')}
        </div>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">{t('libraryTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('libraryHint')}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {docs.map(({ meta, pageCount, headingCount }) => {
          const title = resolveI18nString(meta.title, docLocale, docFallback) || meta.slug;
          const description = resolveI18nString(meta.description, docLocale, docFallback);
          return (
            <li key={meta.id}>
              <Link
                href={`/${locale}/documents-v2/${meta.slug}`}
                className="group flex h-full flex-col border border-border bg-background p-5 transition-colors hover:bg-muted/40"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  {meta.year ?? '—'} · {meta.archive?.name ?? t('unsourced')}
                </div>
                <div
                  className="mt-3 font-serif text-xl leading-snug"
                  dir={meta.lang === 'he' || meta.lang === 'yi' ? 'rtl' : 'ltr'}
                >
                  {title}
                </div>
                {description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{description}</p>
                )}
                <div className="mt-auto pt-4 font-mono text-[11px] text-muted-foreground">
                  {pageCount} {t('pages')} · {headingCount} {t('headings')}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
