import type { Post, Page, Category, ResearchDataset, Map } from '@/types/api-types';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
        // Instead of throwing, we might want to return a safe default or rethrow for specific codes.
        // For "connection refused", catch block handles it. 
        // For 404/500, we log and throw.
        const errorText = await res.text();
        console.error(`[API] Error ${res.status} at ${endpoint}:`, errorText);
        throw new Error(`Failed to fetch from ${endpoint}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    // console.log(`[API] Success: ${endpoint}`, Array.isArray(data) ? `(${data.length} items)` : '(1 item)');
    return data;
  } catch (error) {
    console.error(`[API] Fetch error for ${endpoint}:`, error);
    // Determine if we should throw or return empty. 
    // For listing endpoints, returning empty array [] is often safer for UI.
    // For single item endpoints, null might be better. 
    // Since T is generic, we can't easily fallback to "empty value" without casting.
    // However, the caller usually catches or we assume the caller handles rejection.
    // The user's specific error was "fetch failed" likely due to connection refused. 
    // Propagating the error is correct, but the CALLER needs to catch it.
    // Let's modify the CALLERS to catch, or return a rejected promise that allows key fetchers to fallback.
    // Actually, looking at `getDocumentsMetadata`, I added catch there. 
    // The issue reported is line 11, which IS inside try/catch here in the current file?
    // Wait, the user showed a stack trace pointing to `fetchAPI` line 11.
    // The code I viewed earlier HAS a try/catch block around fetch already? (lines 7-31).
    // Let's look closely at previous `view_file`.
    // Yes lines 7-28 are `try { ... } catch (error) { ... throw error }`.
    // It re-throws the error at line 30.
    // So the error IS propagating to component. 
    // I need to ensure `getDocumentsMetadata` and others CATCH it and return empty arrays.
    throw error;
  }
}

// Posts
export const getPosts = async (): Promise<{ docs: Post[] }> => {
  const data = await fetchAPI<Post[]>('/api/posts?status=published');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getPost = async (slug: string): Promise<Post | null> => {
  try {
    const post = await fetchAPI<Post>(`/api/posts/${slug}`);
    return post;
  } catch (error) {
    console.error(`Post not found: ${slug}`, error);
    return null;
  }
};

// Pages
export const getPages = async (): Promise<{ docs: Page[] }> => {
  const data = await fetchAPI<Page[]>('/api/pages?status=published');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getPage = async (slug: string): Promise<Page | null> => {
  try {
    const page = await fetchAPI<Page>(`/api/pages/${slug}`);
    return page;
  } catch (error) {
    console.error(`Page not found: ${slug}`, error);
    return null;
  }
};

// Categories
export const getCategories = async (): Promise<{ docs: Category[] }> => {
  const data = await fetchAPI<Category[]>('/api/categories');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getCategory = async (slug: string): Promise<Category | null> => {
  try {
    const category = await fetchAPI<Category>(`/api/categories/${slug}`);
    return category;
  } catch (error) {
    console.error(`Category not found: ${slug}`, error);
    return null;
  }
};

// Get posts by category
export const getPostsByCategory = async (categorySlug: string): Promise<{ docs: Post[] }> => {
  const data = await fetchAPI<Post[]>(`/api/posts?category=${categorySlug}&status=published`);
  return { docs: Array.isArray(data) ? data : [] };
};

// Datasets
export const getDatasets = async (): Promise<{ docs: ResearchDataset[] }> => {
  const data = await fetchAPI<ResearchDataset[]>('/api/datasets?status=published');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getDataset = async (slug: string): Promise<ResearchDataset | null> => {
  try {
    // We want to include resources by default on the dataset page
    const dataset = await fetchAPI<ResearchDataset>(`/api/datasets/${slug}?includeResources=true`);
    return dataset;
  } catch (error) {
    console.error(`Dataset not found: ${slug}`, error);
    return null;
  }
};

// Maps
export const getMaps = async (): Promise<{ docs: Map[] }> => {
  const data = await fetchAPI<Map[]>('/api/maps?status=published');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getMap = async (slug: string): Promise<Map | null> => {
  try {
    // Include layers by default (includeLayers=true is default in backend)
    const map = await fetchAPI<Map>(`/api/maps/${slug}`);
    return map;
  } catch (error) {
    console.error(`Map not found: ${slug}`, error);
    return null;
  }
};

// Layers
export const getLayers = async (): Promise<{ docs: any[] }> => {
  const data = await fetchAPI<any[]>('/api/geo/layers');
  return { docs: Array.isArray(data) ? data : [] };
};

export const getLayer = async (slug: string): Promise<any | null> => {
  try {
    const layer = await fetchAPI<any>(`/api/geo/layers/${slug}?includeMaps=true`);
    return layer;
  } catch (error) {
    console.error(`Layer not found: ${slug}`, error);
    return null;
  }
};

// ============================================
// Archive (Collections, Series, Volumes)
// ============================================

import type { Collection, CollectionWithSeries, Series, SeriesWithVolumes, Volume } from '@/types/archive.types';

/**
 * Fetch all collections with their series
 */
export async function getArchiveCollections(): Promise<CollectionWithSeries[]> {
  const data = await fetchAPI<CollectionWithSeries[]>('/api/collections');
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single collection with its series (supports both ID and slug)
 */
export async function getCollectionWithSeries(collectionIdOrSlug: string): Promise<CollectionWithSeries> {
  return await fetchAPI<CollectionWithSeries>(`/api/collections/${collectionIdOrSlug}`);
}

/**
 * Fetch a single collection by slug
 */
export async function getCollectionBySlug(slug: string): Promise<CollectionWithSeries> {
  return await fetchAPI<CollectionWithSeries>(`/api/collections/${slug}`);
}

/**
 * Fetch all volumes for a series (supports both ID and slug)
 */
export async function getSeriesVolumes(collectionSlug: string, seriesSlug: string): Promise<SeriesWithVolumes> {
  const data = await fetchAPI<any>(`/api/collections/${collectionSlug}/${seriesSlug}`);
  
  // Transform API response to frontend types
  return {
    id: data.id,
    slug: data.slug,
    nameI18n: data.nameI18n,
    descriptionI18n: data.descriptionI18n,
    yearMin: data.yearmin,
    yearMax: data.yearmax,
    thumbnail: data.thumbnail,
    volumeCount: data.volume_count,
    volumes: data.volumes.map((v: any) => ({
      id: v.id,
      slug: v.slug,
      titleI18n: v.titleI18n,
      descriptionI18n: v.descriptionI18n,
      indexNumber: v.indexNumber,
      pageCount: v.pages_count,
      publicationYear: v.publicationYear,
      thumbnail: v.thumbnail,
      createdAt: v.createdAt,
    })),
  };
}

/**
 * Fetch series details with volumes by slug
 */
export async function getSeriesBySlug(slug: string): Promise<Series & { volumes: Volume[] }> {
  return await fetchAPI<Series & { volumes: Volume[] }>(`/api/series/${slug}`);
}

/**
 * Fetch series details with volumes by ID
 */
export async function getSeriesById(id: string): Promise<Series & { volumes: Volume[] }> {
  return await fetchAPI<Series & { volumes: Volume[] }>(`/api/series/${id}`);
}

/**
 * Fetch volume with pages for viewer
 */
export async function getVolumePages(collectionSlug: string, seriesSlug: string, volumeSlug: string): Promise<any> {
  const data = await fetchAPI<any>(`/api/collections/${collectionSlug}/${seriesSlug}/${volumeSlug}`);
  
  // Transform API response to format expected by VolumeViewer
  return {
    slug: data.slug,
    indexNumber: data.indexNumber,
    titleI18n: data.titleI18n,
    descriptionI18n: data.descriptionI18n,
    publicationYear: data.publicationYear,
    languageOfContent: data.languageOfContent,
    thumbnail: data.thumbnail,
    total_pages: data.pages_count,
    pages: data.pages || [],
    metadata: {
      title: data.titleI18n?.he || data.titleI18n?.en || data.slug,
      description: data.descriptionI18n?.he || data.descriptionI18n?.en,
      year: data.publicationYear,
      language: data.languageOfContent,
    },
  };
}



// ============================================
// Documents (Single Documents)
// ============================================

import { Document, DocumentWithPages } from '@/types/document';

/**
 * Fetch a single document with pages by slug
 */
export async function getDocumentBySlug(slug: string): Promise<DocumentWithPages | null> {
  try {
    const documents = await fetchAPI<DocumentWithPages[]>('/api/documents');
    // Since the API returns all, we filter here. 
    // Ideally the API should support /api/documents/:slug, but per plan we use the bulk endpoint or simple filtering for now.
    // If the API supports filtering or single fetch, use that.
    // Based on previous step, we only made GET /api/documents returning ALL. 
    // We should probably filter on client side for now or assume the user wants this simple implementation.
    // BETTER: Let's assume the API might return all and we find one, OR we could updated the API to support slug.
    // Given constraints, I will fetch all and find. 
    // Wait, the API I created `GET /api/documents` calls `getAllDocumentsWithPages`. 
    // I should create a specific fetcher for this or just filter.
    const doc = documents.find(d => d.slug === slug);
    return doc || null;
  } catch (error) {
    console.error(`Document not found: ${slug}`, error);
    return null;
  }
}

/**
 * Fetch all documents metadata for the browser list
 */
export async function getDocumentsMetadata(): Promise<Document[]> {
  try {
     const data = await fetchAPI<Document[]>('/api/documents?metadataOnly=true');
     return Array.isArray(data) ? data : [];
  } catch (error) {
     console.error("Failed to fetch documents metadata", error);
     return [];
  }
}
