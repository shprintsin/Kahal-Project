"use server";

import prisma from "@/lib/prisma";

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

async function countByType(query: string): Promise<Record<SearchContentType, number>> {
  const q = query.trim();
  if (!q || q.length < 2) {
    return { page: 0, post: 0, layer: 0, dataset: 0, artifact: 0, series: 0 };
  }

  const [pages, posts, layers, datasets, artifacts, series] = await Promise.all([
    prisma.page.count({
      where: { status: 'published', OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { metaDescription: { contains: q, mode: 'insensitive' } },
      ]},
    }),
    prisma.post.count({
      where: { status: 'published', OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ]},
    }),
    prisma.layer.count({
      where: { status: 'published', OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]},
    }),
    prisma.dataset.count({
      where: { status: 'published', OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]},
    }),
    prisma.artifact.count({
      where: { OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ]},
    }),
    prisma.series.count({
      where: { OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]},
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
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { metaDescription: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, excerpt: true, slug: true, updatedAt: true, thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(p => results.push({
        id: p.id, type: 'page', title: p.title, description: p.excerpt || '',
        slug: `/${p.slug}`, thumbnail: p.thumbnail?.url, date: p.updatedAt,
      })))
    );
  }

  if (shouldSearch('post')) {
    queries.push(
      prisma.post.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, excerpt: true, slug: true, updatedAt: true, thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(p => results.push({
        id: p.id, type: 'post', title: p.title, description: p.excerpt || '',
        slug: `/posts/${p.slug}`, thumbnail: p.thumbnail?.url, date: p.updatedAt,
      })))
    );
  }

  if (shouldSearch('layer')) {
    queries.push(
      prisma.layer.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, description: true, slug: true, updatedAt: true, thumbnail: true },
        take: limit,
      }).then(rows => rows.forEach(l => results.push({
        id: l.id, type: 'layer', title: l.name, description: l.description || '',
        slug: `/layers/${l.slug}`, thumbnail: l.thumbnail, date: l.updatedAt,
      })))
    );
  }

  if (shouldSearch('dataset')) {
    queries.push(
      prisma.dataset.findMany({
        where: {
          status: 'published',
          ...regionWhere,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, description: true, slug: true, updatedAt: true, thumbnail: { select: { url: true } } },
        take: limit,
      }).then(rows => rows.forEach(d => results.push({
        id: d.id, type: 'dataset', title: d.title, description: d.description || '',
        slug: `/data/${d.slug}`, thumbnail: d.thumbnail?.url, date: d.updatedAt,
      })))
    );
  }

  if (shouldSearch('artifact')) {
    queries.push(
      prisma.artifact.findMany({
        where: {
          ...(regionFilter ? { regions: { some: { slug: regionFilter } } } : {}),
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, excerpt: true, slug: true, createdAt: true, year: true },
        take: limit,
      }).then(rows => rows.forEach(a => results.push({
        id: a.id, type: 'artifact', title: a.title, description: a.excerpt || '',
        slug: `/documents/${a.slug}`, thumbnail: null, date: a.createdAt,
      })))
    );
  }

  if (shouldSearch('series')) {
    queries.push(
      prisma.series.findMany({
        where: {
          ...(regionFilter ? { regions: { some: { slug: regionFilter } } } : {}),
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true, name: true, description: true, slug: true, createdAt: true,
          thumbnail: { select: { url: true } },
          collection: { select: { id: true } },
        },
        take: limit,
      }).then(rows => rows.forEach(s => results.push({
        id: s.id, type: 'series', title: s.name, description: s.description || '',
        slug: `/archive/${s.collection?.id || ''}/${s.slug}`,
        thumbnail: s.thumbnail?.url, date: s.createdAt,
      })))
    );
  }

  await Promise.all(queries);

  return { results, counts, total };
}

/** Fetch all regions for filter dropdown */
export async function getSearchRegions(): Promise<{ id: string; slug: string; name: string }[]> {
  return prisma.region.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { name: 'asc' },
  });
}
