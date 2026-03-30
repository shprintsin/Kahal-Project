"use server";

import prisma from "@/lib/prisma";

export interface SearchResult {
  id: string;
  type: 'page' | 'post' | 'layer' | 'dataset';
  title: string;
  description: string;
  slug: string;
  thumbnail?: string | null;
  date?: Date;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim();

  // Run queries in parallel
  const [pages, posts, layers, datasets] = await Promise.all([
    // 1. Pages
    prisma.page.findMany({
      where: {
        AND: [
          { status: 'published' },
          {
            OR: [
              { title: { contains: normalizedQuery, mode: 'insensitive' } },
              { excerpt: { contains: normalizedQuery, mode: 'insensitive' } },
              { metaDescription: { contains: normalizedQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        updatedAt: true,
        thumbnail: { select: { url: true } }
      },
      take: 10
    }),

    // 2. Posts
    prisma.post.findMany({
      where: {
        AND: [
          { status: 'published' },
          {
            OR: [
              { title: { contains: normalizedQuery, mode: 'insensitive' } },
              { excerpt: { contains: normalizedQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        updatedAt: true,
        thumbnail: { select: { url: true } }
      },
      take: 10
    }),

    // 3. Layers
    prisma.layer.findMany({
      where: {
        AND: [
          { status: 'published' },
          {
            OR: [
              { name: { contains: normalizedQuery, mode: 'insensitive' } },
              { description: { contains: normalizedQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        updatedAt: true,
        thumbnail: true // String url directly in Layer model
      },
      take: 10
    }),

    // 4. Datasets
    prisma.dataset.findMany({
      where: {
        AND: [
          { status: 'published' },
          {
            OR: [
              { title: { contains: normalizedQuery, mode: 'insensitive' } },
              { description: { contains: normalizedQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        updatedAt: true,
        thumbnail: { select: { url: true } }
      },
      take: 10
    })
  ]);

  // Combine and map results
  const results: SearchResult[] = [];

  pages.forEach(p => results.push({
    id: p.id,
    type: 'page',
    title: p.title,
    description: p.excerpt || '',
    slug: `/${p.slug}`,
    thumbnail: p.thumbnail?.url,
    date: p.updatedAt
  }));

  posts.forEach(p => results.push({
    id: p.id,
    type: 'post',
    title: p.title,
    description: p.excerpt || '',
    slug: `/posts/${p.slug}`,
    thumbnail: p.thumbnail?.url,
    date: p.updatedAt
  }));

  layers.forEach(l => results.push({
    id: l.id,
    type: 'layer',
    title: l.name,
    description: l.description || '',
    slug: `/layers/${l.slug}`,
    thumbnail: l.thumbnail,
    date: l.updatedAt
  }));

  datasets.forEach(d => results.push({
    id: d.id,
    type: 'dataset',
    title: d.title,
    description: d.description || '',
    slug: `/datasets/${d.slug}`,
    thumbnail: d.thumbnail?.url,
    date: d.updatedAt
  }));

  return results;
}
