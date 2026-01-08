"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

// --- Types ---

export type HierarchyNode = {
  id: string;
  type: "COLLECTION" | "SERIES" | "VOLUME";
  name: string;
  slug: string; // ID for collection, slug for others
  collectionId?: string;
  children?: HierarchyNode[];
};

// --- Fetch Actions ---

export async function getHierarchy(): Promise<HierarchyNode[]> {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { series: true }
        },
        series: {
          orderBy: { indexNumber: "asc" },
          include: {
            _count: {
              select: { volumes: true }
            },
            volumes: {
              orderBy: { indexNumber: "asc" },
              include: {
                _count: {
                  select: { pages: true }
                }
              }
            },
          },
        },
      },
    });

    return collections.map((col) => {
      // Calculate total nested count? Request says "census (56)" probably means series count or pages?
      // "Ygz census (2)" -> 2 volumes?
      // "Volume (622)" -> 622 pages?
      // Yes, seems to mean direct children count.
      // Wait, "census (56)" -> In the example provided "Ygz census (2)" is child of census.
      // So Census(1) if it has 1 series. Maybe 56 refers to something else? File count?
      // "number of files/folder withing each level of hierarchy"
      // Collection -> Count of Series? Or nested Volumes?
      // Series -> Count of Volumes?
      // Volume -> Count of Pages.
      // The example "census (56)" is ambiguous if it only has "Ygz census" as child.
      // But typically file tree shows direct children count. Or leaves count?
      // "Volume (622)" is clearly page count.
      // "Ygz census (2)" is clearly volume count (V1 and maybe V2).
      // "census (56)" probably means 56 series? Or 1 series and 55 other things?
      // I will implement DIRECT CHILDREN count.
      
      return {
        id: col.id,
        type: "COLLECTION",
        name: `${(col.nameI18n as any)?.en || "Untitled Collection"} (${col._count.series})`,
        slug: col.id,
        children: col.series.map((ser) => ({
          id: ser.id,
          type: "SERIES",
          name: `${(ser.nameI18n as any)?.en || "Untitled Series"} (${ser._count.volumes})`,
          slug: ser.slug,
          collectionId: col.id,
          children: ser.volumes.map((vol) => ({
            id: vol.id,
            type: "VOLUME",
            name: `${(vol.titleI18n as any)?.en || "Untitled Volume"} (${vol._count.pages})`,
            slug: vol.slug,
          })),
        })),
      };
    });
  } catch (error) {
    console.error("Failed to fetch hierarchy:", error);
    return [];
  }
}

export async function getVolumePages(volumeId: string, page: number = 1, limit: number = 50) {
  try {
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await prisma.volumePage.count({
      where: { volumeId },
    });

    const pages = await prisma.volumePage.findMany({
      where: { volumeId },
      orderBy: { sequenceIndex: "asc" },
      take: limit,
      skip: skip,
      include: {
        images: {
          include: { storageFile: true },
        },
        texts: true,
      },
    });
    
    return { pages, total };
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    throw new Error("Failed to fetch pages");
  }
}


export async function getCollectionDetails(id: string) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        series: {
          orderBy: { indexNumber: "asc" },
          include: {
            _count: { select: { volumes: true } },
            thumbnail: { include: { storageFile: true } },
            volumes: {
              take: 1,
              orderBy: { indexNumber: "asc" },
              include: {
                pages: {
                  take: 1,
                  orderBy: { sequenceIndex: "asc" },
                  include: { images: { take: 1, include: { storageFile: true } } }
                }
              }
            }
          },
        },
      },
    });
    return collection;
  } catch (error) {
    console.error("Failed to fetch collection details:", error);
    return null;
  }
}

export async function getSeriesDetails(id: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        collection: true,
        volumes: {
          orderBy: { indexNumber: "asc" },
          include: {
            _count: { select: { pages: true } },
            thumbnail: { include: { storageFile: true } },
            pages: {
              take: 1,
              orderBy: { sequenceIndex: "asc" },
              include: { images: { take: 1, include: { storageFile: true } } }
            }
          },
        },
      },
    });
    return series;
  } catch (error) {
    console.error("Failed to fetch series details:", error);
    return null;
  }
}

export async function getVolumeDetails(id: string) {
  try {
    const volume = await prisma.volume.findUnique({
      where: { id },
      include: { series: { include: { collection: true } } }
    });
    return volume;
  } catch (error) {
    console.error("Failed to fetch volume details:", error);
    return null;
  }
}

// --- API helper actions (public data fetchers) ---

export async function listCollectionsSummary() {
  const collections = await prisma.collection.findMany({
    include: {
      tags: true,
      thumbnail: true,
      _count: {
        select: { series: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return collections.map((c) => ({
    id: c.id,
    slug: c.id,
    nameI18n: c.nameI18n,
    descriptionI18n: c.descriptionI18n,
    createdAt: c.createdAt,
    thumbnail: c.thumbnail
      ? {
          id: c.thumbnail.id,
          url: c.thumbnail.url,
          altTextI18n: c.thumbnail.altTextI18n,
        }
      : null,
    _count: {
      series: c._count.series,
    },
  }));
}

export async function getCollectionDetail(slug: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: slug },
    include: {
      tags: true,
      thumbnail: true,
      series: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { volumes: true } },
        },
      },
    },
  });

  if (!collection) return null;

  return {
    id: collection.id,
    slug: collection.id,
    nameI18n: collection.nameI18n,
    descriptionI18n: collection.descriptionI18n,
    createdAt: collection.createdAt,
    tags: collection.tags,
    series_count: collection.series.length,
    series: collection.series.map((s) => ({
      id: s.id,
      slug: s.slug,
      nameI18n: s.nameI18n,
      descriptionI18n: s.descriptionI18n,
      indexNumber: s.indexNumber,
      volumeLabelFormat: s.volumeLabelFormat,
      createdAt: s.createdAt,
      thumbnail: s.thumbnail
        ? {
            id: s.thumbnail.id,
            filename: s.thumbnail.filename,
            url: s.thumbnail.url,
            storageFileId: s.thumbnail.storageFileId,
          }
        : null,
      _count: {
        volumes: s._count.volumes,
      },
      volume_count: s._count.volumes,
    })),
    thumbnailId: collection.thumbnailId,
    thumbnail: collection.thumbnail
      ? {
          id: collection.thumbnail.id,
          filename: collection.thumbnail.filename,
          url: collection.thumbnail.url,
          storageFileId: collection.thumbnail.storageFileId,
        }
      : null,
  };
}

/**
 * Get series by collection ID and series slug
 * @deprecated Use getSeriesByCollectionSlugAndSeriesSlug for slug-based queries
 */
export async function getSeriesDetailByPath(collectionId: string, seriesSlug: string) {
  const series = await prisma.series.findFirst({
    where: {
      slug: seriesSlug,
      collectionId,
    },
    include: {
      thumbnail: true,
      volumes: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!series) return null;

  return {
    id: series.id,
    slug: series.slug,
    nameI18n: series.nameI18n,
    descriptionI18n: series.descriptionI18n,
    indexNumber: series.indexNumber,
    volumeLabelFormat: series.volumeLabelFormat,
    thumbnailId: series.thumbnailId,
    createdAt: series.createdAt,
    thumbnail: series.thumbnail
      ? {
          id: series.thumbnail.id,
          filename: series.thumbnail.filename,
          url: series.thumbnail.url,
          storageFileId: series.thumbnail.storageFileId,
        }
      : null,
    volume_count: series.volumes.length,
    volumes: series.volumes.map((v) => ({
      slug: v.slug,
      indexNumber: v.indexNumber,
      titleI18n: v.titleI18n,
      descriptionI18n: v.descriptionI18n,
      publicationYear: v.year,
      languageOfContent: v.languageOfContent,
      yearContent: v.yearContent,
      thumbnailId: v.thumbnailId,
      createdAt: v.createdAt,
      thumbnail: v.thumbnail
        ? {
            id: v.thumbnail.id,
            filename: v.thumbnail.filename,
            url: v.thumbnail.url,
            storageFileId: v.thumbnail.storageFileId,
          }
        : null,
      pages_count: v._count.pages,
    })),
  };
}

/**
 * Get series by collection slug and series slug (slug-only query)
 */
export async function getSeriesBySlugs(collectionSlug: string, seriesSlug: string) {
  const series = await prisma.series.findFirst({
    where: {
      slug: seriesSlug,
      collection: {
        id: collectionSlug, // Collection uses ID as slug
      },
    },
    include: {
      thumbnail: true,
      volumes: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!series) return null;

  return {
    id: series.id,
    yearmin: series.yearMin,
    yearmax: series.yearMax,
    referenceCode: series.referenceCode,
    period: series.period,
    languages: series.languages,
    slug: series.slug,
    nameI18n: series.nameI18n,
    descriptionI18n: series.descriptionI18n,
    indexNumber: series.indexNumber,
    volumeLabelFormat: series.volumeLabelFormat,
    thumbnailId: series.thumbnailId,
    createdAt: series.createdAt,
    thumbnail: series.thumbnail
      ? {
          id: series.thumbnail.id,
          filename: series.thumbnail.filename,
          url: series.thumbnail.url,
          storageFileId: series.thumbnail.storageFileId,
        }
      : null,
    volume_count: series.volumes.length,
    volumes: series.volumes.map((v) => ({
      id: v.id,
      slug: v.slug,
      indexNumber: v.indexNumber,
      titleI18n: v.titleI18n,
      descriptionI18n: v.descriptionI18n,
      publicationYear: v.year,
      languageOfContent: v.languageOfContent,
      yearContent: v.yearContent,
      thumbnailId: v.thumbnailId,
      createdAt: v.createdAt.toISOString(),
      thumbnail: v.thumbnail
        ? {
            id: v.thumbnail.id,
            filename: v.thumbnail.filename,
            url: v.thumbnail.url,
            storageFileId: v.thumbnail.storageFileId,
          }
        : null,
      pages_count: v._count.pages,
    })),
  };
}

export async function getVolumeWithPagesByPath(
  collectionId: string,
  seriesSlug: string,
  volumeSlug: string
) {
  const volume = await prisma.volume.findFirst({
    where: {
      slug: volumeSlug,
      series: {
        slug: seriesSlug,
        collectionId,
      },
    },
    include: {
      thumbnail: true,
      pages: {
        orderBy: { sequenceIndex: "asc" },
        select: {
          sequenceIndex: true,
          label: true,
          images: {
            include: {
              storageFile: true,
            },
          },
          texts: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              type: true,
              language: true,
              textAccuracy: true,
            },
          },
        },
      },
    },
  });

  if (!volume) return null;

  return {
    slug: volume.slug,
    indexNumber: volume.indexNumber,
    titleI18n: volume.titleI18n,
    descriptionI18n: volume.descriptionI18n,
    publicationYear: volume.year,
    languageOfContent: volume.languageOfContent,
    yearContent: volume.yearContent,
    thumbnailId: volume.thumbnailId,
    createdAt: volume.createdAt,
    thumbnail: volume.thumbnail
      ? {
          id: volume.thumbnail.id,
          filename: volume.thumbnail.filename,
          url: volume.thumbnail.url,
          storageFileId: volume.thumbnail.storageFileId,
        }
      : null,
    pages_count: volume.pages.length,
    pages: volume.pages.map((p) => {
      // Find thumbnail and original scan images
      const thumbImage = p.images.find(img => img.useType === 'thumbnail')?.storageFile;
      const originalImage = p.images.find(img => img.useType === 'original_scan')?.storageFile;
      
      return {
        index: p.sequenceIndex,
        label: p.label,
        thumbnailUrl: thumbImage?.publicUrl || null,
        imageUrl: originalImage?.publicUrl || thumbImage?.publicUrl || null,
        width: originalImage?.width || null,
        height: originalImage?.height || null,
        texts: p.texts.map(t => ({
          id: t.id,
          content: t.content,
          type: t.type,
          language: t.language,
          textAccuracy: t.textAccuracy,
        })),
      };
    }),
  };
}

export async function getVolumePageByPath(
  collectionId: string,
  seriesSlug: string,
  volumeSlug: string,
  sequenceIndex: number
) {
  const page = await prisma.volumePage.findFirst({
    where: {
      sequenceIndex,
      volume: {
        slug: volumeSlug,
        series: {
          slug: seriesSlug,
          collectionId,
        },
      },
    },
    include: {
      images: {
        include: {
          storageFile: true,
        },
      },
      texts: true,
      data: true,
    },
  });

  if (!page) return null;

  return {
    slug: page.sequenceIndex,
    label: page.label,
    createdAt: page.createdAt,
    images: page.images.map((img) => ({
      useType: img.useType,
      storageFileId: img.storageFileId,
      url: img.storageFile.publicUrl,
      width: img.storageFile.width,
      height: img.storageFile.height,
      mimeType: img.storageFile.mimeType,
    })),
    texts: page.texts.map((txt) => ({
      type: txt.type,
      language: txt.language,
      content: txt.content,
      textAccuracy: txt.textAccuracy,
    })),
    data: page.data
      ? {
          ocrData: page.data.ocrData,
        }
      : null,
  };
}

// --- New Actions for Collections Browse ---

/**
 * List all series across all collections
 * Used by the Series tab in collections browse
 */
export async function listAllSeries() {
  const series = await prisma.series.findMany({
    include: {
      collection: {
        select: {
          id: true,
          name: true,
          nameI18n: true,
        },
      },
      thumbnail: true,
      _count: {
        select: { volumes: true },
      },
    },
    orderBy: [
      { collectionId: "asc" },
      { indexNumber: "asc" },
    ],
  });

  return series.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    nameI18n: s.nameI18n,
    descriptionI18n: s.descriptionI18n,
    collectionId: s.collectionId,
    collection: s.collection ? {
      id: s.collection.id,
      name: s.collection.name,
      nameI18n: s.collection.nameI18n,
    } : null,
    indexNumber: s.indexNumber,
    createdAt: s.createdAt,
    thumbnail: s.thumbnail
      ? {
          id: s.thumbnail.id,
          filename: s.thumbnail.filename,
          url: s.thumbnail.url,
          storageFileId: s.thumbnail.storageFileId,
        }
      : null,
    volumeCount: s._count.volumes,
  }));
}

/**
 * Get series details by ID with volumes
 */
export async function getSeriesDetailById(id: string) {
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      collection: true,
      thumbnail: true,
      volumes: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!series) return null;

  return {
    id: series.id,
    slug: series.slug,
    name: series.name,
    nameI18n: series.nameI18n,
    descriptionI18n: series.descriptionI18n,
    collectionId: series.collectionId,
    collection: series.collection,
    indexNumber: series.indexNumber,
    createdAt: series.createdAt,
    thumbnail: series.thumbnail
      ? {
          id: series.thumbnail.id,
          filename: series.thumbnail.filename,
          url: series.thumbnail.url,
          storageFileId: series.thumbnail.storageFileId,
        }
      : null,
    volumeCount: series.volumes.length,
    volumes: series.volumes.map((v) => ({
      id: v.id,
      slug: v.slug,
      title: v.title,
      titleI18n: v.titleI18n,
      descriptionI18n: v.descriptionI18n,
      indexNumber: v.indexNumber,
      year: v.year,
      createdAt: v.createdAt,
      thumbnail: v.thumbnail
        ? {
            id: v.thumbnail.id,
            filename: v.thumbnail.filename,
            url: v.thumbnail.url,
            storageFileId: v.thumbnail.storageFileId,
          }
        : null,
      pageCount: v._count.pages,
    })),
  };
}

/**
 * Get series details by slug with volumes
 */
export async function getSeriesDetailBySlug(slug: string) {
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      collection: true,
      thumbnail: true,
      volumes: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!series) return null;

  return {
    id: series.id,
    slug: series.slug,
    name: series.name,
    nameI18n: series.nameI18n,
    descriptionI18n: series.descriptionI18n,
    collectionId: series.collectionId,
    collection: series.collection,
    indexNumber: series.indexNumber,
    createdAt: series.createdAt,
    thumbnail: series.thumbnail
      ? {
          id: series.thumbnail.id,
          filename: series.thumbnail.filename,
          url: series.thumbnail.url,
          storageFileId: series.thumbnail.storageFileId,
        }
      : null,
    volumeCount: series.volumes.length,
    volumes: series.volumes.map((v) => ({
      id: v.id,
      slug: v.slug,
      title: v.title,
      titleI18n: v.titleI18n,
      descriptionI18n: v.descriptionI18n,
      seriesId: v.seriesId,
      collectionId: series.collectionId,
      indexNumber: v.indexNumber,
      year: v.year,
      createdAt: v.createdAt.toISOString(),
      thumbnail: v.thumbnail
        ? {
            id: v.thumbnail.id,
            filename: v.thumbnail.filename,
            url: v.thumbnail.url,
            storageFileId: v.thumbnail.storageFileId,
          }
        : null,
      pageCount: v._count.pages,
    })),
  };
}

/**
 * Get volumes by series ID
 */
export async function getVolumesBySeriesId(seriesId: string) {
  const volumes = await prisma.volume.findMany({
    where: { seriesId },
    orderBy: { indexNumber: "asc" },
    include: {
      thumbnail: true,
      _count: { select: { pages: true } },
      series: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameI18n: true,
          collectionId: true,
        },
      },
    },
  });

  return volumes.map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    titleI18n: v.titleI18n,
    descriptionI18n: v.descriptionI18n,
    indexNumber: v.indexNumber,
    year: v.year,
    createdAt: v.createdAt.toISOString(),
    seriesId: v.seriesId,
    collectionId: v.series?.collectionId || '',
    series: v.series,
    thumbnail: v.thumbnail
      ? {
          id: v.thumbnail.id,
          filename: v.thumbnail.filename,
          url: v.thumbnail.url,
          storageFileId: v.thumbnail.storageFileId,
        }
      : null,
    pageCount: v._count.pages,
  }));
}

/**
 * Get volumes by series slug
 */
export async function getVolumesBySeriesSlug(seriesSlug: string) {
  const volumes = await prisma.volume.findMany({
    where: { 
      series: { slug: seriesSlug }
    },
    orderBy: { indexNumber: "asc" },
    include: {
      thumbnail: true,
      _count: { select: { pages: true } },
      series: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameI18n: true,
          collectionId: true,
        },
      },
    },
  });

  return volumes.map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    titleI18n: v.titleI18n,
    descriptionI18n: v.descriptionI18n,
    indexNumber: v.indexNumber,
    year: v.year,
    createdAt: v.createdAt.toISOString(),
    seriesId: v.seriesId,
    collectionId: v.series?.collectionId || '',
    series: v.series,
    thumbnail: v.thumbnail
      ? {
          id: v.thumbnail.id,
          filename: v.thumbnail.filename,
          url: v.thumbnail.url,
          storageFileId: v.thumbnail.storageFileId,
        }
      : null,
    pageCount: v._count.pages,
  }));
}

/**
 * List all collections with their series included
 */
export async function listCollectionsWithSeries() {
  const collections = await prisma.collection.findMany({
    include: {
      tags: true,
      thumbnail: true,
      series: {
        orderBy: { indexNumber: "asc" },
        include: {
          thumbnail: true,
          _count: { select: { volumes: true } },
        },
      },
      _count: {
        select: { series: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return collections.map((c) => ({
    id: c.id,
    slug: c.id,
    name: c.name,
    nameI18n: c.nameI18n,
    descriptionI18n: c.descriptionI18n,
    createdAt: c.createdAt.toISOString(),
    thumbnail: c.thumbnail
      ? {
          id: c.thumbnail.id,
          filename: c.thumbnail.filename,
          url: c.thumbnail.url,
          storageFileId: c.thumbnail.storageFileId,
          altTextI18n: c.thumbnail.altTextI18n,
        }
      : null,
    seriesCount: c._count.series,
    series: c.series.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      nameI18n: s.nameI18n,
      descriptionI18n: s.descriptionI18n,
      collectionId: c.id,
      indexNumber: s.indexNumber,
      createdAt: s.createdAt.toISOString(),
      thumbnail: s.thumbnail
        ? {
            id: s.thumbnail.id,
            filename: s.thumbnail.filename,
            url: s.thumbnail.url,
            storageFileId: s.thumbnail.storageFileId,
          }
        : null,
      volumeCount: s._count.volumes,
    })),
  }));
}

// --- CRUD Actions ---

export async function getEntity(type: "COLLECTION" | "SERIES" | "VOLUME", id: string) {
    if (type === "COLLECTION") {
        return prisma.collection.findUnique({ where: { id } });
    } else if (type === "SERIES") {
        return prisma.series.findUnique({ where: { id } });
    } else {
        return prisma.volume.findUnique({ where: { id } });
    }
}


export async function createCollection(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  // const slug = formData.get("slug") as string; // Collection has no slug field yet

  if (!name) throw new Error("Name is required");

  // TODO: Add slug support if we migrate schema
  const collection = await prisma.collection.create({
    data: {
      nameI18n: { en: name },
      descriptionI18n: { en: description },
    },
  });

  revalidatePath("/admin/collections");
  return collection;
}

export async function createSeries(collectionId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) throw new Error("Name and Slug are required");

  // Get max index
  const maxIndex = await prisma.series.findFirst({
    where: { collectionId },
    orderBy: { indexNumber: "desc" },
  });

  const series = await prisma.series.create({
    data: {
      collectionId,
      nameI18n: { en: name },
      slug,
      indexNumber: (maxIndex?.indexNumber || 0) + 1,
    },
  });

  revalidatePath("/admin/collections");
  return series;
}

export async function createVolume(seriesId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) throw new Error("Name and Slug are required");

  const maxIndex = await prisma.volume.findFirst({
    where: { seriesId },
    orderBy: { indexNumber: "desc" },
  });

  const volume = await prisma.volume.create({
    data: {
      seriesId,
      titleI18n: { en: name },
      slug,
      indexNumber: (maxIndex?.indexNumber || 0) + 1,
      year: new Date().getFullYear(), // Default
    },
  });

  revalidatePath("/admin/collections");
  return volume;
}

export async function createVolumePage(volumeId: string, pageData: any) {
  const maxIndex = await prisma.volumePage.findFirst({
    where: { volumeId },
    orderBy: { sequenceIndex: 'desc' },
  });

  const page = await prisma.volumePage.create({
    data: {
      volumeId,
      sequenceIndex: pageData.sequenceIndex ?? ((maxIndex?.sequenceIndex || 0) + 1),
      label: pageData.label || "",
      isVisible: true
    }
  });
  
  revalidatePath("/admin/collections");
  return page;
}

export async function deleteEntity(type: "COLLECTION" | "SERIES" | "VOLUME", id: string) {
  try {
    if (type === "COLLECTION") {
      await prisma.collection.delete({ where: { id } });
    } else if (type === "SERIES") {
      await prisma.series.delete({ where: { id } });
    } else if (type === "VOLUME") {
      await prisma.volume.delete({ where: { id } });
    }
    revalidatePath("/admin/collections");
  } catch (error) {
    console.error("Delete failed:", error);
    throw new Error("Failed to delete entity");
  }
}

export async function updateEntity(
  type: "COLLECTION" | "SERIES" | "VOLUME",
  id: string,
  data: Record<string, any>
) {
  try {
    if (type === "COLLECTION") {
      await prisma.collection.update({
        where: { id },
        data: {
          nameI18n: data.nameI18n,
          descriptionI18n: data.descriptionI18n,
          referenceCode: data.referenceCode,
          yearMin: data.yearMin,
          yearMax: data.yearMax,
        },
      });
    } else if (type === "SERIES") {
      await prisma.series.update({
        where: { id },
        data: {
          nameI18n: data.nameI18n,
          slug: data.slug,
          descriptionI18n: data.descriptionI18n,
          referenceCode: data.referenceCode,
          license: data.license,
          editor: data.editor,
          author: data.author,
          sources: data.sources,
          sourceLink: data.sourceLink,
          period: data.period,
          yearMin: data.yearMin,
          yearMax: data.yearMax,
          indexNumber: data.indexNumber,
          volumeLabelFormat: data.volumeLabelFormat,
          languages: data.languages,
        }
      });
    } else if (type === "VOLUME") {
      await prisma.volume.update({
        where: { id },
        data: {
          titleI18n: data.titleI18n || data.nameI18n, // Supporting both for compatibility
          slug: data.slug,
          descriptionI18n: data.descriptionI18n,
          indexNumber: data.indexNumber,
          year: data.year,
          yearMin: data.yearMin,
          yearMax: data.yearMax,
          languageOfContent: data.languageOfContent,
          languages: data.languages,
          editor: data.editor,
          author: data.author,
          license: data.license,
          sources: data.sources,
          sourceLink: data.sourceLink,
        }
      });
    }

    revalidatePath("/admin/collections");
  } catch (error) {
     console.error("Update failed:", error);
     throw new Error("Failed to update entity");
  }
}


// --- Reorder Actions ---

// --- Reorder Actions ---

export async function reorderPages(volumeId: string, pageIds: string[]) {
  try {
    // Transactional update is ideal, but for loop is okay for moderate size
    await prisma.$transaction(
      pageIds.map((id, index) =>
        prisma.volumePage.update({
          where: { id },
          data: { sequenceIndex: index + 1 }, // 1-based index
        })
      )
    );
    revalidatePath("/admin/collections");
  } catch (error) {
    console.error("Reorder failed:", error);
    throw new Error("Failed to reorder pages");
  }
}

// --- Thumbnail Actions ---

export async function setEntityThumbnail(
  type: "COLLECTION" | "SERIES" | "VOLUME",
  entityId: string,
  storageFileId: string
) {
  try {
     // Create a Media record for this usage "Thumbnail"
     // We need to fetch the storage file to get the URL
     const storageFile = await prisma.storageFile.findUnique({ where: { id: storageFileId } });
     if (!storageFile) throw new Error("Storage file not found");

     const media = await prisma.media.create({
        data: {
            storageFileId,
            filename: storageFile.filename, 
            url: storageFile.publicUrl || "", 
        }
     });

    if (type === "COLLECTION") {
      await prisma.collection.update({ where: { id: entityId }, data: { thumbnailId: media.id } });
    } else if (type === "SERIES") {
      await prisma.series.update({ where: { id: entityId }, data: { thumbnailId: media.id } });
    } else if (type === "VOLUME") {
      await prisma.volume.update({ where: { id: entityId }, data: { thumbnailId: media.id } });
    }

    revalidatePath("/admin/collections");
  } catch (error) {
    console.error("Set thumbnail failed:", error);
    throw new Error("Failed to set thumbnail");
  }
}
