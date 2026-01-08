import { ContentLanguage, ContentStatus } from '@prisma/client';
import { z } from 'zod';

export interface DocumentPage {
  id: string;
  documentId: string;
  index: number;
  content: string;
  contentHe?: string | null;
  contentEn?: string | null;
  filename?: string | null;
  bookmark?: string | null;
  highlights?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentPageInput {
  index: number;
  content: string;
  contentHe?: string;
  contentEn?: string;
  filename?: string;
  bookmark?: string;
  highlights?: any;
}

export const documentPageSchema = z.object({
  index: z.number().int().min(0),
  content: z.string().min(1, 'Content is required'),
  contentHe: z.string().optional(),
  contentEn: z.string().optional(),
  filename: z.string().optional(),
  bookmark: z.string().optional(),
  highlights: z.any().optional(),
});

export interface Document {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  category?: string | null;
  year?: number | null;
  reference?: string | null;
  referenceUrl?: string | null;
  scanUrl?: string | null;
  scanZip?: string | null;
  lang: ContentLanguage;
  status: ContentStatus;
  license?: string | null;
  volume?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithPages extends Document {
  pages: DocumentPage[];
}

export interface PaginatedDocuments {
  documents: Document[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDocumentInput {
  slug: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  category?: string;
  year?: number;
  reference?: string;
  referenceUrl?: string;
  scanUrl?: string;
  scanZip?: string;
  lang?: ContentLanguage;
  status?: ContentStatus;
  license?: string;
  volume?: string;
  pages?: CreateDocumentPageInput[];
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  id: string;
}

export const createDocumentSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe'),
  title: z.string().min(1, 'Title is required'),
  titleEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  category: z.string().optional(),
  year: z.number().int().min(1000).max(9999).optional(),
  reference: z.string().optional(),
  referenceUrl: z.string().url().optional().or(z.literal('')),
  scanUrl: z.string().url().optional().or(z.literal('')),
  scanZip: z.string().url().optional().or(z.literal('')),
  lang: z.nativeEnum(ContentLanguage).optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  license: z.string().optional(),
  volume: z.string().optional(),
  pages: z.array(documentPageSchema).optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().uuid(),
});

export interface MarkdownFile {
  name: string;
  content: string;
  index: number;
}

export interface JsonPageInput {
  filename?: string;
  page_number?: number | string;
  content?: string;
  en?: string;
  he?: string;
  pl?: string;
}

export type DocumentFormData = z.infer<typeof createDocumentSchema>;
