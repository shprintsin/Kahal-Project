import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocumentBySlug, getPublishedSlugs } from '../lib/repository';
import { DocumentReader } from '../components/DocumentReader';
import { resolveI18nString, type DocumentV2Locale } from '@/types/document-v2';
import { fallbackLocale, type Locale } from '@/lib/i18n/config';

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return {};
  const docLocale = locale as unknown as DocumentV2Locale;
  const docFallback = fallbackLocale as unknown as DocumentV2Locale;
  const title = resolveI18nString(doc.meta.nameI18n, docLocale, docFallback) || doc.meta.slug;
  const description = resolveI18nString(doc.meta.excerptI18n, docLocale, docFallback) || undefined;
  return { title, description };
}

export default async function DocumentsV2ViewerPage({ params }: PageProps) {
  const { slug } = await params;
  // Library list is fetched once in the segment layout and persisted across
  // navigation; this page only fetches the per-doc payload.
  const doc = await getDocumentBySlug(slug);
  if (!doc) notFound();
  return <DocumentReader doc={doc} />;
}
