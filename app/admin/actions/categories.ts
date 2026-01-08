"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";


export async function getCategories(language?: string) {
  const categories = await prisma.category.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  return categories;
}

// getCategoriesByTranslationGroup removed as schema uses single record with JSON i18n

export async function getCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) throw new Error("Category not found");
  return category;
}

export async function createCategory(categoryData: any) {
  const data: any = {
    title: categoryData.title,
    slug: categoryData.slug,
    titleI18n: categoryData.titleI18n || categoryData.title_i18n || {},
  };

  const createdCategory = await prisma.category.create({
    data,
  });

  revalidatePath("/admin/categories");
  return createdCategory;
}

export async function updateCategory(id: string, categoryData: any) {
  const data: any = {
    title: categoryData.title,
    slug: categoryData.slug,
    titleI18n: categoryData.titleI18n || categoryData.title_i18n || {},
  };

  const updatedCategory = await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  return updatedCategory;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
}

// ===================================================
// API Endpoint Server Actions
// ===================================================

export interface ListCategoriesOptions {
  search?: string;
  sort?: "title" | "createdAt" | "usageCount";
  order?: "asc" | "desc";
  lang?: string;
}

export interface GetCategoryOptions {
  lang?: string;
  includeContent?: boolean;
  contentType?: "posts" | "series" | "datasets" | "maps";
}

// List categories with usage counts (for API)
export async function listCategoriesAPI(options: ListCategoriesOptions = {}) {
  const {
    search,
    sort = "title",
    order = "asc",
    lang,
  } = options;

  try {
    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        slug: { contains: search, mode: "insensitive" },
      }),
    };


    const categories = await prisma.category.findMany({
      where,
      include: {
        thumbnail: {
          select: {
            url: true,
            altTextI18n: true,
          },
        },
        _count: {
          select: {
            posts: true,
            series: true,
            datasets: true,
            maps: true,
          },
        },
      },
      orderBy: sort === "usageCount" ? undefined : { [sort]: order },
    });

    // Transform and calculate usage counts
    let transformedCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      title: category.title,
      titleI18n: category.titleI18n,
      thumbnail: category.thumbnail
        ? {
            url: category.thumbnail.url,
            altText: null,
          }
        : null,
      usageCount: {
        total:
          category._count.posts +
          category._count.series +
          category._count.datasets +
          category._count.maps,
        posts: category._count.posts,
        series: category._count.series,
        datasets: category._count.datasets,
        maps: category._count.maps,
      },
      createdAt: category.createdAt.toISOString(),
    }));

    // Sort by usage count if requested
    if (sort === "usageCount") {
      transformedCategories.sort((a, b) =>
        order === "asc"
          ? a.usageCount.total - b.usageCount.total
          : b.usageCount.total - a.usageCount.total
      );
    }

    return {
      categories: transformedCategories,
      total: transformedCategories.length,
    };
  } catch (error) {
    console.error("Error listing categories:", error);
    throw new Error("Failed to list categories");
  }
}

// Get single category by slug (for API)
export async function getCategoryBySlug(slug: string, options: GetCategoryOptions = {}) {
  const { lang, includeContent = false, contentType } = options;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        thumbnail: {
          select: {
            url: true,
            altTextI18n: true,
          },
        },
        _count: {
          select: {
            posts: true,
            series: true,
            datasets: true,
            maps: true,
          },
        },
        ...(includeContent && {
          ...((!contentType || contentType === "posts") && {
            posts: {
              select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                thumbnail: {
                  select: {
                    url: true,
                  },
                },
              },
              take: 10,
            },
          }),
        }),
      },
    });

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      titleI18n: category.titleI18n,
      thumbnail: category.thumbnail
        ? {
            url: category.thumbnail.url,
            altText: null,
          }
        : null,
      usageCount: {
        total:
          category._count.posts +
          category._count.series +
          category._count.datasets +
          category._count.maps,
        posts: category._count.posts,
        series: category._count.series,
        datasets: category._count.datasets,
        maps: category._count.maps,
      },
      ...(includeContent && {
        content: {
          ...((category as any).posts && { posts: (category as any).posts }),
        },
      }),
      createdAt: category.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting category:", error);
    throw new Error("Failed to get category");
  }
}

