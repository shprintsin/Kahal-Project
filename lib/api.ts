import type {
  Post,
  Page,
  Category,
  Dataset,
  MapDataset,
  APIResponse,
} from "@/lib/view-types";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return "";
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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Error ${res.status} at ${endpoint}:`, errorText);
      throw new Error(
        `Failed to fetch from ${endpoint}: ${res.status} ${res.statusText}`
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[API] Fetch error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch a v1 list endpoint and return the unwrapped `data` array.
 *
 * The v1 API responds with `{ data: T[], pagination?: ... }`. This helper
 * always returns an array (empty on shape mismatch) so callers don't have
 * to remember to unwrap.
 */
async function fetchV1List<T>(endpoint: string): Promise<T[]> {
  const res = await fetchAPI<APIResponse<T[]>>(endpoint);
  return Array.isArray(res?.data) ? res.data : [];
}

/**
 * Fetch a v1 single-record endpoint and return the unwrapped `data`.
 */
async function fetchV1Item<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetchAPI<APIResponse<T>>(endpoint);
    return (res?.data as T) ?? null;
  } catch {
    return null;
  }
}

// ============================================================================
// Posts
// ============================================================================

export const getPosts = async (): Promise<{ docs: Post[] }> => {
  const docs = await fetchV1List<Post>("/api/v1/posts?status=published");
  return { docs };
};

export const getPost = async (slug: string): Promise<Post | null> => {
  return fetchV1Item<Post>(`/api/v1/posts/${slug}`);
};

// ============================================================================
// Pages
// ============================================================================

export const getPages = async (): Promise<{ docs: Page[] }> => {
  const docs = await fetchV1List<Page>("/api/v1/pages?status=published");
  return { docs };
};

export const getPage = async (slug: string): Promise<Page | null> => {
  return fetchV1Item<Page>(`/api/v1/pages/${slug}`);
};

// ============================================================================
// Categories
// ============================================================================

export const getCategories = async (): Promise<{ docs: Category[] }> => {
  const docs = await fetchV1List<Category>("/api/v1/categories");
  return { docs };
};

export const getCategory = async (
  slug: string
): Promise<Category | null> => {
  return fetchV1Item<Category>(`/api/v1/categories/${slug}`);
};

// Get posts by category
export const getPostsByCategory = async (
  categorySlug: string
): Promise<{ docs: Post[] }> => {
  const docs = await fetchV1List<Post>(
    `/api/v1/posts?category=${categorySlug}&status=published`
  );
  return { docs };
};

// ============================================================================
// Datasets
// ============================================================================

export const getDatasets = async (): Promise<{ docs: Dataset[] }> => {
  const docs = await fetchV1List<Dataset>("/api/v1/datasets?status=published");
  return { docs };
};

export const getDataset = async (
  slug: string
): Promise<Dataset | null> => {
  return fetchV1Item<Dataset>(
    `/api/v1/datasets/${slug}?includeResources=true`
  );
};

// ============================================================================
// Maps
// ============================================================================

export const getMaps = async (): Promise<{ docs: MapDataset[] }> => {
  const docs = await fetchV1List<MapDataset>("/api/v1/maps?status=published");
  return { docs };
};

export const getMap = async (slug: string): Promise<MapDataset | null> => {
  return fetchV1Item<MapDataset>(`/api/v1/maps/${slug}`);
};

// ============================================================================
// Layers
// ============================================================================

// `getLayers` historically called `/api/geo/layers`, which only returns
// published layers. The v1 endpoint exposes the same filter via querystring.
export const getLayers = async (): Promise<{ docs: any[] }> => {
  const docs = await fetchV1List<any>("/api/v1/layers?status=published");
  return { docs };
};

// `/api/v1/layers/[slug]` returns the rich projection from getLayerBySlug
// (with category/tags/regions). `includeMaps=true` adds the dataset edges.
export const getLayer = async (slug: string): Promise<any | null> => {
  return fetchV1Item<any>(`/api/v1/layers/${slug}?includeMaps=true`);
};

// ============================================================================
// Archive (Collections, Series, Volumes) — left on legacy routes
// (the hierarchy is too complex for the registry-driven catch-all)
// ============================================================================

import type {
  CollectionWithSeries,
  Series,
  SeriesWithVolumes,
  Volume,
} from "@/types/archive.types";

/**
 * Fetch all collections with their series
 */
export async function getArchiveCollections(): Promise<CollectionWithSeries[]> {
  const data = await fetchAPI<CollectionWithSeries[]>("/api/collections");
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single collection with its series (supports both ID and slug)
 */
export async function getCollectionWithSeries(
  collectionIdOrSlug: string
): Promise<CollectionWithSeries> {
  return await fetchAPI<CollectionWithSeries>(
    `/api/collections/${collectionIdOrSlug}`
  );
}

/**
 * Fetch a single collection by slug
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithSeries> {
  return await fetchAPI<CollectionWithSeries>(`/api/collections/${slug}`);
}

/**
 * Fetch all volumes for a series (supports both ID and slug)
 */
export async function getSeriesVolumes(
  collectionSlug: string,
  seriesSlug: string
): Promise<SeriesWithVolumes> {
  const data = await fetchAPI<any>(
    `/api/collections/${collectionSlug}/${seriesSlug}`
  );

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
export async function getSeriesBySlug(
  slug: string
): Promise<Series & { volumes: Volume[] }> {
  return await fetchAPI<Series & { volumes: Volume[] }>(`/api/series/${slug}`);
}

/**
 * Fetch series details with volumes by ID
 */
export async function getSeriesById(
  id: string
): Promise<Series & { volumes: Volume[] }> {
  return await fetchAPI<Series & { volumes: Volume[] }>(`/api/series/${id}`);
}

/**
 * Fetch volume with pages for viewer
 */
export async function getVolumePages(
  collectionSlug: string,
  seriesSlug: string,
  volumeSlug: string
): Promise<any> {
  const data = await fetchAPI<any>(
    `/api/collections/${collectionSlug}/${seriesSlug}/${volumeSlug}`
  );

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

// ============================================================================
// Documents (Single Documents) — left on legacy routes (out of A-4 scope)
// ============================================================================

import { Document, DocumentWithPages } from "@/types/document";

/**
 * Fetch a single document with pages by slug
 */
export async function getDocumentBySlug(
  slug: string
): Promise<DocumentWithPages | null> {
  try {
    const documents = await fetchAPI<DocumentWithPages[]>("/api/documents");
    const doc = documents.find((d) => d.slug === slug);
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
    const data = await fetchAPI<Document[]>(
      "/api/documents?metadataOnly=true"
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch documents metadata", error);
    return [];
  }
}
