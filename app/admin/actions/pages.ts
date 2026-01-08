"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";

// ===================================================
// Helper Functions
// ===================================================

function getLocalizedField(
  defaultValue: string | null | undefined,
  i18nJson: any,
  lang?: string
): string | null {
  if (!defaultValue && !i18nJson) return null;
  if (!lang || !i18nJson) return defaultValue || null;
  
  try {
    const i18nData = typeof i18nJson === 'string' ? JSON.parse(i18nJson) : i18nJson;
    return i18nData[lang] || defaultValue || null;
  } catch {
    return defaultValue || null;
  }
}

async function resolveAuthorRelation(authorId?: string) {
  if (!authorId) return undefined;

  const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
  if (!authorExists) return undefined;

  return { connect: { id: authorId } };
}

// ===================================================
// Standard CRUD Actions (Restored)
// ===================================================

export async function getPages() {
  const pages = await prisma.page.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
    }
  });

  return pages;
}

export async function getPage(id: string) {
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      author: true,
      thumbnail: true,
      tags: true,
      regions: true,
    },
  });

  if (!page) throw new Error("Page not found");
  return page;
}

export async function createPage(pageData: any, tagIds?: string[], regionIds?: string[]) {
  const authorRelation = await resolveAuthorRelation(pageData.author_id);

  const data: any = {
    title: pageData.title,
    slug: pageData.slug,
    content: pageData.content,
    excerpt: pageData.excerpt,
    status: pageData.status || "draft",
    language: pageData.language || "HE",
    translationGroupId: pageData.translation_group_id,
    template: pageData.template,
    menuOrder: pageData.menuOrder || 0,
    showInMenu: pageData.showInMenu || false,
    author: authorRelation,
    parentId: pageData.parent_id || null,
    thumbnail: pageData.thumbnail_id ? { connect: { id: pageData.thumbnail_id } } : undefined,
    
    tags: tagIds && tagIds.length > 0
      ? {
          connect: tagIds.map(tagId => ({ id: tagId })),
        }
      : undefined,
      
    regions: regionIds && regionIds.length > 0
      ? {
          connect: regionIds.map(regionId => ({ id: regionId })),
        }
      : undefined,
  };

  const createdPage = await prisma.page.create({
    data,
  });

  revalidatePath("/admin/pages");
  return createdPage;
}

export async function updatePage(id: string, pageData: any, tagIds?: string[], regionIds?: string[]) {
  const authorRelation = await resolveAuthorRelation(pageData.author_id);

  const data: any = {
    title: pageData.title,
    slug: pageData.slug,
    content: pageData.content,
    excerpt: pageData.excerpt,
    status: pageData.status,
    language: pageData.language,
    translationGroupId: pageData.translation_group_id,
    template: pageData.template,
    menuOrder: pageData.menuOrder,
    showInMenu: pageData.showInMenu,
    author: authorRelation,
    parentId: pageData.parent_id || null,
    thumbnail: pageData.thumbnail_id ? { connect: { id: pageData.thumbnail_id } } : undefined,
    
    ...(tagIds !== undefined ? {
      tags: {
        set: tagIds.map(tagId => ({ id: tagId })),
      }
    } : {}),

    ...(regionIds !== undefined ? {
      regions: {
        set: regionIds.map(regionId => ({ id: regionId })),
      }
    } : {}),
  };

  // Remove undefined fields
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

  const updatedPage = await prisma.page.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  return updatedPage;
}

export async function deletePage(id: string) {
  await prisma.page.delete({
    where: { id },
  });

  revalidatePath("/admin/pages");
}


// ===================================================
// API Endpoint Server Actions
// ===================================================

export interface ListPagesOptions {
  status?: string;
  tagId?: string;
  tagSlug?: string;
  regionId?: string;
  regionSlug?: string;
  authorId?: string;
  language?: string;
  template?: string;
  showInMenu?: boolean;
  parentId?: string | null;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title" | "menuOrder";
  order?: "asc" | "desc";
}

export interface GetPageOptions {
  includeChildren?: boolean;
}

export interface HierarchyOptions {
  status?: string;
  language?: string;
}

// List pages with filtering and pagination
export async function listPagesAPI(options: ListPagesOptions = {}) {
  const {
    status,
    tagId,
    tagSlug,
    regionId,
    regionSlug,
    authorId,
    language,
    template,
    showInMenu,
    parentId, // null means root pages explicitly
    search,
    page = 1,
    limit = 20,
    sort = "menuOrder",
    order = "asc",
  } = options;

  try {
    const where: Prisma.PageWhereInput = {
      ...(status && { status: status as any }),
      ...(language && { language: language as any }),
      ...(authorId && { authorId }),
      ...(template && { template }),
      ...(showInMenu !== undefined && { showInMenu }),
      ...(parentId !== undefined && { parentId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Handle tag filter
    if (tagId) {
      where.tags = { some: { id: tagId } };
    } else if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
    }

    // Handle region filter
    if (regionId) {
      where.regions = { some: { id: regionId } };
    } else if (regionSlug) {
      where.regions = { some: { slug: regionSlug } };
    }

    // Pagination
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          thumbnail: {
            select: {
              url: true,
              altTextI18n: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
      }),
      prisma.page.count({ where }),
    ]);

    // Transform
    const transformedPages = pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      excerpt: page.excerpt,
      status: page.status,
      language: page.language,
      template: page.template,
      menuOrder: page.menuOrder,
      showInMenu: page.showInMenu,
      parentId: page.parentId,
      thumbnail: page.thumbnail
        ? {
            url: page.thumbnail.url,
            altText: getLocalizedField(null, page.thumbnail.altTextI18n, language),
          }
        : null,
      hasChildren: page._count.children > 0,
      childrenCount: page._count.children,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    }));

    return {
      pages: transformedPages,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    console.error("Error listing pages:", error);
    throw new Error("Failed to list pages");
  }
}

// Get single page by slug
export async function getPageBySlug(slug: string, options: GetPageOptions = {}) {
  const { includeChildren = false } = options;

  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        thumbnail: {
          select: {
            url: true,
            altTextI18n: true,
          },
        },
        tags: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameI18n: true,
          },
        },
        regions: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameI18n: true,
          },
        },
        parent: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        ...(includeChildren && {
          children: {
            where: { showInMenu: true },
            orderBy: { menuOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              menuOrder: true,
              showInMenu: true,
            },
          },
        }),
      },
    });

    if (!page) {
      return null;
    }

    // Get translations
    const translations = await prisma.page.findMany({
      where: {
        translationGroupId: page.translationGroupId,
        id: { not: page.id },
      },
      select: {
        language: true,
        slug: true,
        title: true,
      },
    });

    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      excerpt: page.excerpt,
      sources: page.sources,
      citations: page.citations,
      status: page.status,
      language: page.language,
      translationGroupId: page.translationGroupId,
      template: page.template,
      menuOrder: page.menuOrder,
      showInMenu: page.showInMenu,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      thumbnail: page.thumbnail
        ? {
            url: page.thumbnail.url,
            altText: getLocalizedField(null, page.thumbnail.altTextI18n, page.language),
          }
        : null,
      author: page.author,
      parent: page.parent,
      children: (page as any).children || undefined,
      tags: page.tags,
      regions: page.regions,
      translations,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting page:", error);
    throw new Error("Failed to get page");
  }
}

// Get full page hierarchy
export async function getPageHierarchy(options: HierarchyOptions = {}) {
  const { status, language } = options;

  try {
    const where: Prisma.PageWhereInput = {
      ...(status && { status: status as any }),
      ...(language && { language: language as any }),
    };

    const allPages = await prisma.page.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        menuOrder: true,
        showInMenu: true,
        parentId: true,
      },
      orderBy: { menuOrder: "asc" },
    });

    // Build tree
    const buildTree = (parentId: string | null): any[] => {
      return allPages
        .filter((page) => page.parentId === parentId)
        .map((page) => ({
          ...page,
          children: buildTree(page.id),
        }));
    };

    return {
      pages: buildTree(null),
    };
  } catch (error) {
    console.error("Error getting hierarchy:", error);
    throw new Error("Failed to get hierarchy");
  }
}
