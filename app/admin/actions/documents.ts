'use server';

import { prisma } from '@/lib/prisma';
import {
  CreateDocumentInput,
  UpdateDocumentInput,
  PaginatedDocuments,
  DocumentWithPages,
  MarkdownFile,
  JsonPageInput,
} from '@/types/document';
import { ContentLanguage } from '@prisma/client';

import { sortMarkdownFiles } from '@/app/admin/utils/document';

/**


/**
 * Get paginated list of documents
 */
export async function getDocuments(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ success: boolean; data?: PaginatedDocuments; error?: string }> {
  try {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { titleEn: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [documents, totalCount] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { pages: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        documents: documents as any,
        totalCount,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
    };
  }
}

/**
 * Get a single document by ID with all pages
 */
export async function getDocument(
  id: string
): Promise<{ success: boolean; data?: DocumentWithPages; error?: string }> {
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: 'Document not found',
      };
    }

    return {
      success: true,
      data: document as DocumentWithPages,
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch document',
    };
  }
}

/**
 * Get a single document by slug
 */
export async function getDocumentBySlug(
  slug: string
): Promise<{ success: boolean; data?: DocumentWithPages; error?: string }> {
  try {
    const document = await prisma.document.findUnique({
      where: { slug },
      include: {
        pages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: 'Document not found',
      };
    }

    return {
      success: true,
      data: document as DocumentWithPages,
    };
  } catch (error) {
    console.error('Error fetching document by slug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch document',
    };
  }
}

/**
 * Create a new document
 */
export async function createDocument(
  input: CreateDocumentInput
): Promise<{ success: boolean; data?: DocumentWithPages; error?: string }> {
  try {
    const { pages, ...documentData } = input;

    const document = await prisma.document.create({
      data: {
        ...documentData,
        lang: documentData.lang || ContentLanguage.PL,
        pages: pages
          ? {
              create: pages.map((page) => ({
                index: page.index,
                content: page.content,
                contentHe: page.contentHe,
                contentEn: page.contentEn,
                filename: page.filename,
                bookmark: page.bookmark,
                highlights: page.highlights || [],
              })),
            }
          : undefined,
      },
      include: {
        pages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: document as DocumentWithPages,
    };
  } catch (error) {
    console.error('Error creating document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create document',
    };
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  input: UpdateDocumentInput
): Promise<{ success: boolean; data?: DocumentWithPages; error?: string }> {
  try {
    const { id, pages, ...documentData } = input;

    // If pages are provided, delete existing pages and create new ones
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...documentData,
        pages: pages
          ? {
              deleteMany: {},
              create: pages.map((page) => ({
                index: page.index,
                content: page.content,
                contentHe: page.contentHe,
                contentEn: page.contentEn,
                filename: page.filename,
                bookmark: page.bookmark,
                highlights: page.highlights || [],
              })),
            }
          : undefined,
      },
      include: {
        pages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: document as DocumentWithPages,
    };
  } catch (error) {
    console.error('Error updating document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update document',
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.document.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete document',
    };
  }
}



/**
 * Process uploaded folder of markdown files and create pages
 */
export async function uploadDocumentFolder(
  documentId: string,
  files: MarkdownFile[]
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    // Group files by base name
    const pagesMap = new Map<string, { content?: string; contentHe?: string; contentEn?: string; filename: string }>();

    for (const file of files) {
      let baseName = file.name;
      let type: 'base' | 'he' | 'en' = 'base';

      if (file.name.toLowerCase().endsWith('.he.md')) {
        baseName = file.name.slice(0, -6); // Remove .he.md
        type = 'he';
      } else if (file.name.toLowerCase().endsWith('.en.md')) {
        baseName = file.name.slice(0, -6); // Remove .en.md
        type = 'en';
      } else if (file.name.toLowerCase().endsWith('.md')) {
        baseName = file.name.slice(0, -3); // Remove .md
      }

      const existing = pagesMap.get(baseName) || { filename: baseName + '.md' };
      
      if (type === 'base') existing.content = file.content;
      if (type === 'he') existing.contentHe = file.content;
      if (type === 'en') existing.contentEn = file.content;
      
      pagesMap.set(baseName, existing);
    }

    // Convert map to array and sort by base name using numeric sort
    const sortedPages = Array.from(pagesMap.values()).sort((a, b) => {
      return a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Create pages with sequential indices
    const pages = sortedPages.map((pageData, index) => ({
      documentId,
      index,
      content: pageData.content || '', // Fallback for missing base content?
      contentHe: pageData.contentHe,
      contentEn: pageData.contentEn,
      filename: pageData.filename,
      highlights: [],
    }));

    // Delete existing pages and create new ones
    await prisma.documentPage.deleteMany({
      where: { documentId },
    });

    // Create pages transactionally to ensure we get them back
    const createdPages = await prisma.$transaction(
      pages.map((page) =>
        prisma.documentPage.create({
          data: page,
        })
      )
    );

    return {
      success: true,
      data: createdPages as any, 
    };
  } catch (error) {
    console.error('Error uploading document folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload folder',
    };
  }
}

/**
 * Get all documents with pages for API
 */
export async function getAllDocumentsWithPages(): Promise<DocumentWithPages[]> {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pages: {
          orderBy: { index: 'asc' },
        },
      },
    });

    return documents as DocumentWithPages[];
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return [];
  }
}

/**
 * Get all documents metadata (no pages content) for list/search
 */
export async function getDocumentsMetadata() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      // Omit pages to keep it light
    });

    return documents;
  } catch (error) {
    console.error('Error fetching document metadata:', error);
    return [];
  }
}

/**
 * Process uploaded JSON file and create pages
 */
export async function uploadDocumentJson(
  documentId: string,
  pages: JsonPageInput[]
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    // Transform JSON pages to DocumentPage format
    const formattedPages = pages.map((p, idx) => {
       const index = typeof p.page_number === 'number' 
        ? p.page_number 
        : (parseInt(String(p.page_number), 10) || idx);
      
      return {
        documentId,
        index,
        content: p.pl || p.content || '',
        contentEn: p.en,
        contentHe: p.he,
        filename: p.filename,
        highlights: [],
      };
    });

    // Delete existing pages
    await prisma.documentPage.deleteMany({
      where: { documentId },
    });

    // Create pages transactionally
    const createdPages = await prisma.$transaction(
      formattedPages.map((page) =>
        prisma.documentPage.create({
          data: page,
        })
      )
    );

    return {
      success: true,
      data: createdPages,
    };
  } catch (error) {
    console.error('Error uploading document json:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload json',
    };
  }
}
