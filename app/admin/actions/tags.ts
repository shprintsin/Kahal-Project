"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";


export async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      slug: 'asc',
    },
  });

  return tags;
}

export async function getTag(id: string) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) throw new Error("Tag not found");
  return tag;
}

export async function createTag(tagData: any) {
  const data: any = {
    slug: tagData.slug,
    nameI18n: tagData.name_i18n || tagData.nameI18n,
  };

  const createdTag = await prisma.tag.create({
    data,
  });

  revalidatePath("/admin/tags");
  return createdTag;
}

export async function updateTag(id: string, tagData: any) {
  const data: any = {
    slug: tagData.slug,
    nameI18n: tagData.name_i18n || tagData.nameI18n,
  };

  const updatedTag = await prisma.tag.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/tags");
  revalidatePath(`/admin/tags/${id}`);
  return updatedTag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({
    where: { id },
  });

  revalidatePath("/admin/tags");
}

// ===================================================

// API Endpoint Server Actions
// ===================================================

export interface ListTagsOptions {
  search?: string;
  sort?: "name" | "createdAt" | "usageCount";
  order?: "asc" | "desc";
  limit?: number;
  lang?: string;
}

export interface GetTagOptions {
  lang?: string;
  includeContent?: boolean;
}

// List tags with usage counts (for API)
export async function listTagsAPI(options: ListTagsOptions = {}) {
  const {
    search,
    sort = "name",
    order = "asc",
    limit,
    lang,
  } = options;

  try {
    const where: Prisma.TagWhereInput = {
      ...(search && {
        slug: { contains: search, mode: "insensitive" },
      }),
    };


    const tags = await prisma.tag.findMany({
      where,
      ...(limit && { take: limit }),
      include: {
        _count: {
          select: {
            posts: true,
            pages: true,
            collections: true,
            series: true,
            maps: true,
            artifacts: true,
          },
        },
      },
      orderBy: sort === "usageCount" ? undefined : { [sort]: order },
    });

    // Transform and calculate usage counts
    let transformedTags = tags.map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      nameI18n: tag.nameI18n,
      usageCount: {
        total:
          tag._count.posts +
          tag._count.pages +
          tag._count.collections +
          tag._count.series +
          tag._count.maps +
          tag._count.artifacts,
        posts: tag._count.posts,
        pages: tag._count.pages,
        collections: tag._count.collections,
        series: tag._count.series,
        maps: tag._count.maps,
        artifacts: tag._count.artifacts,
      },
      createdAt: tag.createdAt.toISOString(),
    }));

    // Sort by usage count if requested
    if (sort === "usageCount") {
      transformedTags.sort((a, b) =>
        order === "asc"
          ? a.usageCount.total - b.usageCount.total
          : b.usageCount.total - a.usageCount.total
      );
    }

    return {
      tags: transformedTags,
      total: transformedTags.length,
    };
  } catch (error) {
    console.error("Error listing tags:", error);
    throw new Error("Failed to list tags");
  }
}

// Get single tag by slug (for API)
export async function getTagBySlug(slug: string, options: GetTagOptions = {}) {
  const { lang, includeContent = false } = options;

  try {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true,
            pages: true,
            collections: true,
            series: true,
            maps: true,
            artifacts: true,
          },
        },
        ...(includeContent && {
          posts: {
            select: {
              post: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  excerpt: true,
                },
              },
            },
            take: 10,
          },
          pages: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
            take: 10,
          },
          collections: {
            select: {
              id: true,
              name: true,
            },
            take: 10,
          },
        }),
      },
    });

    if (!tag) {
      return null;
    }

    return {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      nameI18n: tag.nameI18n,
      usageCount: {
        total:
          tag._count.posts +
          tag._count.pages +
          tag._count.collections +
          tag._count.series +
          tag._count.maps +
          tag._count.artifacts,
        posts: tag._count.posts,
        pages: tag._count.pages,
        collections: tag._count.collections,
        series: tag._count.series,
        maps: tag._count.maps,
        artifacts: tag._count.artifacts,
      },
      ...(includeContent && {
        content: {
          posts: (tag as any).posts?.map((pt: any) => pt.post) || [],
          pages: (tag as any).pages || [],
          collections: (tag as any).collections || [],
        },
      }),
      createdAt: tag.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting tag:", error);
    throw new Error("Failed to get tag");
  }
}


