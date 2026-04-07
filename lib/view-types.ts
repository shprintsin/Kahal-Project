/**
 * View types for the public site.
 *
 * These describe the **shapes the API helpers actually return** to the
 * public pages — not the raw Prisma models. Most of them are merged
 * projections (Prisma model + computed/relations) so they can't live in
 * `@prisma/client`. Originally lived under `app/types/api-types.ts`; lifted
 * here as part of A-4 to put them next to `lib/api.ts` (their only consumer
 * outside a couple of map components).
 *
 * If a field gains a server-side default it should still be optional here
 * unless the API helper guarantees the field is always present.
 */

export interface LocalizedString {
  [key: string]: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  altTextI18n?: LocalizedString;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  titleI18n: LocalizedString;
  thumbnail?: Media;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  nameI18n: LocalizedString;
}

export interface Region {
  id: string;
  slug: string;
  name: string;
  nameI18n?: LocalizedString;
}

export interface User {
  id: string;
  name?: string;
  image?: string;
  role: "ADMIN" | "EDITOR" | "CONTRIBUTOR";
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  language: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  thumbnail?: Media;
  categories: Category[];
  tags: Tag[];
  regions: Region[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  template?: string;
  status: "draft" | "published" | "archived";
  menuOrder: number;
  showInMenu: boolean;
  parentId?: string | null;
  children?: Page[];
  thumbnail?: Media;
}

export interface DatasetResource {
  id: string;
  name: string;
  slug: string;
  url: string;
  filename: string;
  mimeType: string;
  format: string;
  isMainFile: boolean;
  sizeBytes?: number;
  excerpt?: string;
  createdAt: string;
}

export interface Dataset {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  maturity: string;
  version?: string;
  minYear?: number;
  maxYear?: number;
  license?: string;
  citationText?: string;
  codebookText?: string;
  sources?: string;
  category?: Category;
  regions?: Region[];
  thumbnail?: Media;
  resources?: DatasetResource[];
  resourceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MapLayer {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: "POINTS" | "POLYGONS" | "POLYLINES" | "MULTI_POLYGONS" | "RASTER";
  sourceType?: "url" | "database" | "inline";
  sourceUrl?: string;
  geoJsonData?: any;
  downloadUrl?: string;
  filename?: string;
  styleConfig: any;
  interactionConfig?: any;
  isVisible: boolean;
  isVisibleByDefault: boolean;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface MapDataset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: string;
  maturity?: string;
  license?: string;
  version?: string;
  year?: number;
  period?: string;
  yearMin?: number;
  yearMax?: number;
  config?: any;
  globalStyleConfig?: any;
  codebookText?: string;
  referenceLinks?: any;
  category?: Category;
  regions?: Region[];
  tags?: Tag[];
  thumbnail?: Media;
  layers?: MapLayer[];
  resources?: DatasetResource[];
  layerCount?: number;
  resourceCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard wrapper used by all v1 API responses.
 */
export interface APIResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Layer {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  sourceType: string;
  sourceUrl?: string;
  downloadUrl?: string;
  geoJsonData?: any;
  minYear?: number;
  maxYear?: number;
  category?: Category;
  tags?: Tag[];
  regions?: Region[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    datasets: number;
  };
}
