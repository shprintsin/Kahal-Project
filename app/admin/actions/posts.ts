"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";


async function resolveAuthorRelation(authorId?: string) {
  if (!authorId) return undefined;

  const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
  // If the referenced author no longer exists, skip linking to avoid Prisma connect errors.
  if (!authorExists) return undefined;

  return { connect: { id: authorId } };
}

export async function getPosts() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      thumbnail: {
        select: {
          id: true,
          url: true,
          altTextI18n: true,
        },
      },
      categories: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts;
}

export async function getPostsByTranslationGroup() {
  const posts = await getPosts();
  
  // Group posts by translation_group_id
  const grouped = posts.reduce((acc, post) => {
    const groupId = post.translationGroupId;
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  return grouped;
}

export async function getPost(id: string) {
  const post = await (prisma.post.findUnique as any)({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      thumbnail: {
        select: {
          id: true,
          url: true,
          altTextI18n: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) throw new Error("Post not found");
  return post;
}

export async function createPost(
  postData: any,
  tagIds?: string[]
) {
  const authorRelation = await resolveAuthorRelation(postData.author_id);

  // Casting to any to bypass potential stale type issues, checked at runtime
  const data: any = {
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    language: postData.language,
    status: postData.status,
    translationGroupId: postData.translation_group_id || postData.translationGroupId,
    author: authorRelation,
    thumbnail: postData.thumbnail_id ? { connect: { id: postData.thumbnail_id } } : undefined,
    categories: postData.category_id ? { connect: { id: postData.category_id } } : undefined,
    tags: tagIds && tagIds.length > 0
      ? {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          })),
        }
      : undefined,
  };

  const createdPost = await prisma.post.create({
    data,
    include: {
      author: true,
      thumbnail: true,
    },
  });

  revalidatePath("/admin/posts");
  return createdPost;
}

export async function updatePost(
  id: string,
  postData: any,
  tagIds?: string[]
) {
  const authorRelation = await resolveAuthorRelation(postData.author_id);

  // Casting to any to bypass potential stale type issues, checked at runtime
  const data: any = {
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    language: postData.language,
    status: postData.status,
    translationGroupId: postData.translation_group_id || postData.translationGroupId,
    author: authorRelation,
    thumbnail: postData.thumbnail_id ? { connect: { id: postData.thumbnail_id } } : undefined,
    categories: postData.category_id ? { connect: { id: postData.category_id } } : undefined,
    ...(tagIds !== undefined ? {
      tags: {
        deleteMany: {},
        create: tagIds.map(tagId => ({
          tag: { connect: { id: tagId } }
        })),
      }
    } : {})
  };

  const updatedPost = await prisma.post.update({
    where: { id },
    data,
    include: {
      author: true,
      thumbnail: true,
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  return updatedPost;
}



export async function deletePost(id: string) {
  // Delete post tags first (cascade should handle this, but being explicit)
  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/admin/posts");
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return users || [];
}

export async function getCategories(language?: string) {
  const categories = await prisma.category.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  return categories || [];
}

export async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      slug: 'asc',
    },
  });

  return tags || [];
}

export async function getMedia() {
  const media = await prisma.media.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return media || [];
}

export async function uploadMedia(file: File) {
  try {
    // Upload to Cloudflare R2 using the existing utility
    const { uploadToR2 } = await import("@/utils/r2");
    
    const fileName = `thumbnail/${Date.now()}-${file.name}`;
    const publicUrl = await uploadToR2(file, fileName);

    // Create media record in database
    const mediaData = await prisma.media.create({
      data: {
        filename: file.name,
        url: publicUrl,
        altTextI18n: {},
      },
    });

    return mediaData;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// ===================================================
// API Endpoint Server Actions
// ===================================================

// Helper function to get localized field
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

export interface ListPostsOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  tagId?: string;
  tagSlug?: string;
  regionId?: string;
  regionSlug?: string;
  authorId?: string;
  language?: string;
  translationGroup?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
}

// List posts with filtering and pagination (for API)
export async function listPostsAPI(options: ListPostsOptions = {}) {
  const {
    status,
    categoryId,
    categorySlug,
    tagId,
    tagSlug,
    regionId,
    regionSlug,
    authorId,
    language,
    translationGroup,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = options;

  // Build where clause
  const where: Prisma.PostWhereInput = {
    ...(status && { status: status as any }),
    ...(language && { language: language as any }),
    ...(translationGroup && { translationGroupId: translationGroup }),
    ...(authorId && { authorId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Handle category filter
  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  } else if (categorySlug) {
    where.categories = { some: { slug: categorySlug } };
  }

  // Handle tag filter
  if (tagId) {
    where.tags = { some: { tagId } };
  } else if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
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

  // Order by
  const orderBy: Prisma.PostOrderByWithRelationInput = {
    [sort]: order,
  };

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          thumbnail: {
            select: {
              url: true,
              altTextI18n: true,
            },
          },
          categories: {
            select: {
              id: true,
              slug: true,
              title: true,
              titleI18n: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  nameI18n: true,
                },
              },
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
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Transform data
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      status: post.status,
      language: post.language,
      translationGroupId: post.translationGroupId,
      thumbnail: post.thumbnail
        ? {
            url: post.thumbnail.url,
            altText: getLocalizedField(null, post.thumbnail.altTextI18n, language),
          }
        : null,
      author: post.author,
      categories: post.categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        title: cat.title,
      })),
      tags: post.tags.map((pt) => ({
        id: pt.tag.id,
        slug: pt.tag.slug,
        name: pt.tag.name,
      })),
      regions: post.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: region.name,
      })),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    console.error("Error listing posts:", error);
    throw new Error("Failed to list posts");
  }
}

// Get single post by slug (for API)
export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findUnique({
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
        categories: {
          select: {
            id: true,
            slug: true,
            title: true,
            titleI18n: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                slug: true,
                name: true,
                nameI18n: true,
              },
            },
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
      },
    });

    if (!post) {
      return null;
    }

    // Get translations
    const translations = await prisma.post.findMany({
      where: {
        translationGroupId: post.translationGroupId,
        id: { not: post.id },
      },
      select: {
        language: true,
        slug: true,
        title: true,
      },
    });

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      sources: post.sources,
      status: post.status,
      language: post.language,
      translationGroupId: post.translationGroupId,
      thumbnail: post.thumbnail
        ? {
            url: post.thumbnail.url,
            altText: getLocalizedField(null, post.thumbnail.altTextI18n, post.language),
          }
        : null,
      author: post.author,
      categories: post.categories,
      tags: post.tags.map((pt) => pt.tag),
      regions: post.regions,
      translations,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting post:", error);
    throw new Error("Failed to get post");
  }
}

// Get post translations (for API)
export async function getPostTranslations(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { translationGroupId: true },
    });

    if (!post) {
      return null;
    }

    const translations = await prisma.post.findMany({
      where: {
        translationGroupId: post.translationGroupId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
        status: true,
      },
      orderBy: {
        language: "asc",
      },
    });

    return {
      translationGroupId: post.translationGroupId,
      translations,
    };
  } catch (error) {
    console.error("Error getting post translations:", error);
    throw new Error("Failed to get post translations");
  }
}


