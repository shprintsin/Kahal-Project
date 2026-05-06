"use server";

import prisma from "@/lib/prisma";
import { pickI18n } from "@/lib/i18n/fallback";
import type { Locale } from "@/i18n/routing";

export type SearchContentType = 'page' | 'post' | 'layer' | 'dataset' | 'artifact' | 'series';

export interface SearchResult {
  id: string;
  type: SearchContentType;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string | null;
  date?: Date;
}

export interface SearchFilters {
  type?: SearchContentType | null;
  region?: string | null;
}

export interface SearchResponse {
  results: SearchResult[];
  counts: Record<SearchContentType, number>;
  total: number;
}

const LOCALE: Locale = 'en';

/** Build an OR clause matching `q` against the `he` and `en` JSON paths of each given field. */
function buildI18nOr(fields: string[], q: string): { OR: Array<Record<string, unknown>> } {
  const clauses: Array<Record<string, unknown>> = [];
  for (const f of fields) {
    clauses.push({ [f]: { path: ['he'], string_contains: q } });
    clauses.push({ [f]: { path: ['en'], string_contains: q } });
  }
  return { OR: clauses };
}

async function countByType(query: string): Promise<Record<SearchContentType, number>> {
  const q = query.trim();
  if (!q || q.length < 2) {
    return { page: 0, post: 0, layer: 0, dataset: 0, artifact: 0, series: 0 };
  }

  const [pages, posts, layers, datasets, artifacts, series] = await Promise.all([
    prisma.page.count({
      where: {
        status: 'published',
        OR: [
          ...buildI18nOr(['title'], q).OR,
          { excerpt: { contains: q, mode: 'insensitive' as const } },
          { metaDescription: { contains: q, mode: 'insensitive' as const } },
        ],
      },
    }),
    prisma.post.count({
      where: { status: 'published', ...buildI18nOr(['title', 'excerpt'], q) },
    }),
    prisma.layer.count({
      where: { status: 'published', ...buildI18nOr(['name', 'description'], q) },
    }),
    prisma.dataset.count({
      where: { status: 'published', ...buildI18nOr(['title', 'description'], q) },
    }),
    prisma.artifact.count({
      where: buildI18nOr(['title', 'description', 'excerpt'], q),
    }),
    prisma.series.count({
      where: buildI18nOr(['name', 'description'], q),
    }),
  ]);

  return { page: pages, post: posts, layer: layers, dataset: datasets, artifact: artifacts, series };
}

export async function searchContent(query: string, filters?: SearchFilters): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], counts: { page: 0, post: 0, layer: 0, dataset: 0, artifact: 0, series: 0 }, total: 0 };
  }

  const q = query.trim();
  const typeFilter = filters?.type || null;
  const regionFilter = filters?.region || null;

  // Always get counts for all types (for filter tabs)
  const counts = await countByType(q);
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  const results: SearchResult[] = [];
  const limit = 20;

  const shouldSearch = (type: SearchContentType) => !typeFilter || typeFilter === type;

  const regionWhere = regionFilter
    ? { regions: { some: { slug: regionFilter } } }
    : {};

  // Run only the needed queries in parallel
  const queries: Promise<void>[] = [];

  if (shouldSearch('page')) {
    queries.push(
      prisma.page.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          OR: [
            ...buildI18nOr(['title'], q).OR,
            { excerpt: { contains: q, mode: 'insensitive' as const } },
            { metaDescription: { contains: q, mode: 'insensitive' as const } },
          ],
        },
        include: { thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(p => results.push({
        id: p.id, type: 'page',
        title: pickI18n(p.title, LOCALE),
        description: p.excerpt ?? '',
        slug: `/${p.slug}`,
        thumbnail: p.thumbnail?.url ?? null,
        date: p.updatedAt,
      })))
    );
  }

  if (shouldSearch('post')) {
    queries.push(
      prisma.post.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          ...buildI18nOr(['title', 'excerpt'], q),
        },
        include: { thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(p => results.push({
        id: p.id, type: 'post',
        title: pickI18n(p.title, LOCALE),
        description: pickI18n(p.excerpt, LOCALE),
        slug: `/posts/${p.slug}`,
        thumbnail: p.thumbnail?.url ?? null,
        date: p.updatedAt,
      })))
    );
  }

  if (shouldSearch('layer')) {
    queries.push(
      prisma.layer.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          ...buildI18nOr(['name', 'description'], q),
        },
        take: limit,
      }).then(rows => rows.forEach(l => results.push({
        id: l.id, type: 'layer',
        title: pickI18n(l.name, LOCALE),
        description: pickI18n(l.description, LOCALE),
        slug: `/layers/${l.slug}`,
        thumbnail: l.thumbnail ?? null,
        date: l.updatedAt,
      })))
    );
  }

  if (shouldSearch('dataset')) {
    queries.push(
      prisma.dataset.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          ...buildI18nOr(['title', 'description'], q),
        },
        include: { thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(d => results.push({
        id: d.id, type: 'dataset',
        title: pickI18n(d.title, LOCALE),
        description: pickI18n(d.description, LOCALE),
        slug: `/data/${d.slug}`,
        thumbnail: d.thumbnail?.url ?? null,
        date: d.updatedAt,
      })))
    );
  }

  if (shouldSearch('artifact')) {
    queries.push(
      prisma.artifact.findMany({
        where: {
          ...(regionFilter ? { regions: { some: { slug: regionFilter } } } : {}),
          ...buildI18nOr(['title', 'description', 'excerpt'], q),
        },
        take: limit,
      }).then(rows => rows.forEach(a => results.push({
        id: a.id, type: 'artifact',
        title: pickI18n(a.title, LOCALE),
        description: pickI18n(a.excerpt, LOCALE),
        slug: `/documents/${a.slug}`,
        thumbnail: null,
        date: a.createdAt,
      })))
    );
  }

  if (shouldSearch('series')) {
    queries.push(
      prisma.series.findMany({
        where: {
          ...(regionFilter ? { regions: { some: { slug: regionFilter } } } : {}),
          ...buildI18nOr(['name', 'description'], q),
        },
        include: {
          thumbnail: { select: { url: true } },
          collection: { select: { id: true } },
        },
        take: limit,
      }).then(rows => rows.forEach(s => results.push({
        id: s.id, type: 'series',
        title: pickI18n(s.name, LOCALE),
        description: pickI18n(s.description, LOCALE),
        slug: `/archive/${s.collection?.id || ''}/${s.slug}`,
        thumbnail: s.thumbnail?.url ?? null,
        date: s.createdAt,
      })))
    );
  }

  await Promise.all(queries);

  return { results, counts, total };
}

/** Fetch all regions for filter dropdown */
export async function getSearchRegions(): Promise<{ id: string; slug: string; name: string }[]> {
  const regions = await prisma.region.findMany({
    select: { id: true, slug: true, name: true },
  });
  return regions
    .map(r => ({ id: r.id, slug: r.slug, name: pickI18n(r.name, LOCALE) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
