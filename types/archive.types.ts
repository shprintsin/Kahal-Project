// Archive Browser Type Definitions
// All types for the Archive feature (Collections, Series, Volumes)

// ============================================
// Core Backend Data Types
// ============================================

export interface Thumbnail {
  id: string;
  url: string;
  alt?: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  nameI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  thumbnail?: Thumbnail;
  seriesCount: number;
  createdAt: string;
}

export interface Series {
  id: string;
  slug: string;
  name: string;
  nameI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  collectionId: string;
  volumeCount: number;
  thumbnail?: Thumbnail;
  yearMin?: number;
  yearMax?: number;
  indexNumber?: number;
  createdAt: string;
}

export interface Volume {
  id: string;
  slug: string;
  titleI18n: Record<string, string>;
  descriptionI18n?: Record<string, string>;
  indexNumber?: number;
  pageCount: number;
  publicationYear?: number;
  thumbnail?: Thumbnail;
  createdAt: string;
}

// ============================================
// Enriched Types for UI
// ============================================

export interface CollectionWithSeries extends Collection {
  series: Series[];
}

export interface SeriesWithVolumes {
  id: string;
  slug: string;
  nameI18n: Record<string, string>;
  descriptionI18n?: Record<string, string>;
  yearMin?: number;
  yearMax?: number;
  thumbnail?: Thumbnail;
  volumeCount: number;
  volumes: Volume[];
}

// ============================================
// Navigation Tree Types
// ============================================

export type TreeNodeType = 'collection' | 'series';

export interface TreeNode {
  id: string;
  type: TreeNodeType;
  label: string;
  count?: number;
  href?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

// ============================================
// UI State Types
// ============================================

export type ViewState = 'empty' | 'collection' | 'series';

export interface ArchiveState {
  selectedCollectionId: string | null;
  selectedSeriesId: string | null;
  view: ViewState;
}

// ============================================
// Search Types
// ============================================

export interface SearchResults {
  collections: Collection[];
  series: Series[];
  volumes: Volume[];
}

// ============================================
// Helper Types
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive: boolean;
}
