export interface ArtifactData {
  slug: string;
  title?: string;
  titleI18n?: any;
  description?: string;
  descriptionI18n?: any;
  content?: string | null;
  contentI18n: any;
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
