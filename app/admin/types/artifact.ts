export interface ArtifactData {
  slug: string;
  title?: { he?: string; en?: string } | Record<string, string>;
  description?: { he?: string; en?: string } | Record<string, string>;
  content?: { he?: string; en?: string } | Record<string, string>;
  artifactCategoryId?: string;
  year?: number;
  dateDisplay?: string;
  dateSort?: string | Date; // Date or string
  excerpt?: string;
  excerptI18n?: any;
  displayScans?: boolean;
  displayTexts?: boolean;
  sources?: string[]; // JSON array in DB, passed as array here
  
  regionIds?: string[];
  periodIds?: string[];
  tagIds?: string[];
  pageIds?: string[];
  placeIds?: string[];
}
