"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { AppLanguage, ContentStatus, Prisma } from "@prisma/client";


interface PostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  sources?: string | null;
  status?: string;
  language?: string;
  author_id?: string;
  thumbnail_id?: string;
  categoryIds?: string[];
  regionIds?: string[];
  tagNames?: string[];
}

async function resolveAuthorRelation(authorId?: string) {
  if (!authorId) return undefined;

  const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
  if (!authorExists) return undefined;

  return { connect: { id: authorId } };
}

async function resolveTagNames(tagNames?: string[]): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) return [];

  const tagIds: string[] = [];
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    let tag = await prisma.tag.findFirst({ where: { name: { equals: trimmed, mode: "insensitive" } } });
    if (!tag) {
      const slug = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      tag = await prisma.tag.create({ data: { name: trimmed, slug, nameI18n: {} } });
    }
    tagIds.push(tag.id);
  }
  return tagIds;
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

export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
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
      tags: { include: { tag: true } },
      categories: true,
      regions: true,
    },
  });

  if (!post) throw new Error("Post not found");
  return post;
}

export async function createPost(
  postData: PostInput,
  tagIds?: string[]
) {
  const authorRelation = await resolveAuthorRelation(postData.author_id);

  const resolvedTagIds = tagIds && tagIds.length > 0
    ? tagIds
    : await resolveTagNames(postData.tagNames);

  const data: Prisma.PostCreateInput = {
    title: postData.title ?? "",
    slug: postData.slug ?? "",
    content: postData.content,
    excerpt: postData.excerpt,
    sources: postData.sources,
    status: (postData.status as ContentStatus) ?? "draft",
    language: (postData.language as AppLanguage) ?? "HE",
    author: authorRelation,
    thumbnail: postData.thumbnail_id ? { connect: { id: postData.thumbnail_id } } : undefined,
    categories: postData.categoryIds && postData.categoryIds.length > 0
      ? { connect: postData.categoryIds.map(id => ({ id })) }
      : undefined,
    regions: postData.regionIds && postData.regionIds.length > 0
      ? { connect: postData.regionIds.map(id => ({ id })) }
      : undefined,
    tags: resolvedTagIds.length > 0
      ? { create: resolvedTagIds.map(tagId => ({ tagId })) }
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
  postData: PostInput,
  tagIds?: string[]
) {
  const authorRelation = await resolveAuthorRelation(postData.author_id);

  const resolvedTagIds = tagIds !== undefined
    ? tagIds
    : postData.tagNames !== undefined
      ? await resolveTagNames(postData.tagNames)
      : undefined;

  const data: Prisma.PostUpdateInput = {
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt,
    sources: postData.sources,
    status: postData.status ? (postData.status as ContentStatus) : undefined,
    language: postData.language ? (postData.language as AppLanguage) : undefined,
    author: authorRelation,
    thumbnail: postData.thumbnail_id ? { connect: { id: postData.thumbnail_id } } : undefined,
    ...(postData.categoryIds !== undefined ? {
      categories: { set: postData.categoryIds.map(id => ({ id })) }
    } : {}),
    ...(postData.regionIds !== undefined ? {
      regions: { set: postData.regionIds.map(id => ({ id })) }
    } : {}),
    ...(resolvedTagIds !== undefined ? {
      tags: { deleteMany: {}, create: resolvedTagIds.map(tagId => ({ tagId })) }
    } : {}),
  };

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Prisma.PostUpdateInput;

  const updatedPost = await prisma.post.update({
    where: { id },
    data: filteredData,
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
  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/admin/posts");
}

export async function uploadMedia(file: File) {
  try {
    const { uploadFile } = await import("@/utils/storage");

    const fileName = `thumbnail/${Date.now()}-${file.name}`;
    const publicUrl = await uploadFile(file, fileName);

    const mediaData = await prisma.media.create({
      data: {
        filename: file.name,
        url: publicUrl,
        altTextI18n: {},
      },
    });

    return mediaData;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function getLocalizedField(
  defaultValue: string | null | undefined,
  i18nJson: unknown,
  lang?: string
): string | null {
  if (!defaultValue && !i18nJson) return null;
  if (!lang || !i18nJson) return defaultValue || null;

  try {
    const i18nData = (typeof i18nJson === 'string' ? JSON.parse(i18nJson) : i18nJson) as Record<string, string>;
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
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
}

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
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = options;

  const where: Prisma.PostWhereInput = {
    ...(status && { status: status as ContentStatus }),
    ...(authorId && { authorId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  } else if (categorySlug) {
    where.categories = { some: { slug: categorySlug } };
  }

  if (tagId) {
    where.tags = { some: { tag: { id: tagId } } };
  } else if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  if (regionId) {
    where.regions = { some: { id: regionId } };
  } else if (regionSlug) {
    where.regions = { some: { slug: regionSlug } };
  }

  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);

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
            select: {
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

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      status: post.status,
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

export async function getPostTranslations(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { translationGroupId: true },
    });
    if (!post?.translationGroupId) return null;

    const translations = await prisma.post.findMany({
      where: { translationGroupId: post.translationGroupId },
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
      },
    });
    return translations;
  } catch (error) {
    console.error("Error getting post translations:", error);
    throw new Error("Failed to get post translations");
  }
}

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
          select: {
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

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      sources: post.sources,
      status: post.status,
      language: post.language,
      thumbnail: post.thumbnail
        ? {
            url: post.thumbnail.url,
            altText: getLocalizedField(null, post.thumbnail.altTextI18n),
          }
        : null,
      author: post.author,
      categories: post.categories,
      tags: post.tags.map((pt) => pt.tag),
      regions: post.regions,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting post:", error);
    throw new Error("Failed to get post");
  }
}
