/**
 * Type definitions for Collections hierarchy
 * Matches Prisma schema: Collection → Series → Volume → VolumePage
 */

export interface Collection {
  id: string;
  name: string;
  nameI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  referenceCode?: string;
  yearMin?: number;
  yearMax?: number;
  thumbnailId?: string;
  createdAt: Date | string;
  thumbnail?: Thumbnail | null;
  seriesCount?: number;
  series?: Series[];
  tags?: Tag[];
  regions?: Region[];
}

export interface Series {
  id: string;
  slug: string;
  name: string;
  nameI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  collectionId?: string;
  indexNumber?: number;
  volumeLabelFormat?: string;
  referenceCode?: string;
  license?: string;
  period?: string;
  sourceLink?: string;
  sources?: string;
  author?: string;
  editor?: string;
  yearMin?: number;
  yearMax?: number;
  languages?: string[];
  thumbnailId?: string;
  createdAt: Date | string;
  thumbnail?: Thumbnail | null;
  volumeCount?: number;
  volume_count?: number;
  volumes?: Volume[];
  collection?: Collection;
}

export interface Volume {
  id: string;
  slug: string;
  title: string;
  titleI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  seriesId?: string;
  indexNumber?: number;
  languageOfContent?: string;
  yearContent?: number;
  year?: number;
  publicationYear?: number;
  yearMin?: number;
  yearMax?: number;
  license?: string;
  sourceLink?: string;
  sources?: string;
  author?: string;
  editor?: string;
  languages?: string[];
  thumbnailId?: string;
  createdAt: Date | string;
  thumbnail?: Thumbnail | null;
  pageCount?: number;
  pagesCount?: number;
  pages_count?: number;
  pages?: VolumePage[];
  series?: Series;
}

export interface VolumePage {
  id: string;
  volumeId: string;
  sequenceIndex: number;
  index?: number;
  label: string;
  isVisible: boolean;
  createdAt: Date | string;
  images?: PageImage[];
  texts?: PageText[];
  data?: PageData | null;
  volume?: Volume;
  thumbnailUrl?: string;
}

export interface PageImage {
  id: string;
  pageId: string;
  storageFileId: string;
  useType: 'original_scan' | 'thumbnail' | 'processed';
  createdAt: Date | string;
  storageFile?: StorageFile;
  url?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface PageText {
  id: string;
  pageId: string;
  content: string;
  type: 'TRANSCRIPTION' | 'TRANSLATION';
  language: string;
  textAccuracy?: number;
  contributorId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PageData {
  id: string;
  pageId: string;
  ocrData: any;
  updatedAt: Date | string;
}

export interface StorageFile {
  id: string;
  filename: string;
  publicUrl: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
}

export interface Thumbnail {
  id: string;
  filename: string;
  url: string;
  storageFileId?: string;
  altTextI18n?: Record<string, string>;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  nameI18n?: Record<string, string>;
}

export interface Region {
  id: string;
  slug: string;
  name: string;
  nameI18n?: Record<string, string>;
}

// Client-side specific types
export type ViewMode = 'scan' | 'text' | 'comparison';

export interface PageRange {
  start: number;
  end: number;
}

export interface ViewerState {
  mode: ViewMode;
  currentPage: number;
  zoom: number;
  language: 'he' | 'en' | 'pl' | 'ru' | 'yid';
  pageRange?: PageRange;
  rotation: number;
  inversion: boolean;
}

export interface NavigationParams {
  collectionId: string;
  volumeId: string;
  page?: number;
  pageRange?: string;
}

// Collections Browse UI Types
// Collections Browse UI Types
export interface CollectionWithSeries extends Omit<Collection, 'series'> {
  series: SeriesWithVolumes[];
}

export interface SeriesWithVolumes extends Omit<Series, 'volumes' | 'collection'> {
  volumes: VolumeGridItem[];
  collection?: {
    id: string;
    name: string;
    nameI18n: Record<string, string>;
  };
}

// Legacy/Compatibility Types
export interface IVolumeEntry extends Volume {
  metadata: {
    title: string;
    title_en?: string;
    description?: string;
    year?: number;
    language?: string;
    year_content?: number;
    archive?: any;
    publication?: any;
    source_url?: string;
  };
  total_pages?: number;
  pages?: any[]; // Ideally typed as VolumePage[]
  volumes?: Volume[];
}

export interface ICollectionEntry extends Collection {
  volumes?: IVolumeEntry[];
}

export interface VolumeGridItem {
  id: string;
  slug: string;
  title: string;
  titleI18n: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  indexNumber?: number;
  year?: number;
  thumbnail?: Thumbnail | null;
  pageCount?: number;
  seriesId?: string;
  series?: {
    id: string;
    slug: string;
    name: string;
    nameI18n: Record<string, string>;
    collectionId?: string;
  };
}


export interface VolumeWithPages extends Volume {
  pages: VolumePage[];
}
