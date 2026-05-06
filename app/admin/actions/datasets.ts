"use server";

import prisma from "@/lib/prisma";
import { toISOStringSafe } from "@/lib/utils";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma, ContentStatus, DataMaturity, ResouceType } from "@prisma/client";
import { uploadFile } from "@/utils/storage";

// Datasets
export async function getDatasets() {
  const datasets = await prisma.dataset.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true,
      _count: {
        select: {
          layers: true,
          ownedLayers: true,
        },
      },
    },
  });

  return datasets;
}

export async function getDataset(id: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id },
    include: {
      resources: true,
      regions: true,
      category: true,
      thumbnail: true,
      layers: {
        include: { layer: true },
        orderBy: { zIndex: 'asc' },
      },
      tags: true,
      ownedLayers: true,
      deployments: {
        orderBy: { deployedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!dataset) throw new Error("Dataset not found");
  return dataset;
}

import { datasetSchema, datasetUpdateSchema } from "../schema/dataset";

const toI18nJson = (fieldData: unknown): Prisma.InputJsonValue => {
  if (fieldData == null) return {};
  if (typeof fieldData === 'string') return { he: fieldData };
  if (typeof fieldData === 'object') return fieldData as Prisma.InputJsonValue;
  return {};
};

export async function createDataset(datasetData: Record<string, unknown>) {
  const validated = datasetSchema.parse(datasetData);
  
  const data: Prisma.DatasetCreateInput = {
    slug: validated.slug,

    title: toI18nJson(validated.title),
    description: toI18nJson(validated.description),
    summary: toI18nJson(validated.summary),
    sources: toI18nJson(validated.sources),
    codebookText: toI18nJson(validated.codebookText),

    citationText: toI18nJson(validated.citationText),
    isVisible: validated.isVisible,
    license: validated.license,
    maturity: validated.maturity,
    status: validated.status,
    version: validated.version,
    yearMin: validated.yearMin,
    yearMax: validated.yearMax,
    
    category: validated.categoryId ? { connect: { id: validated.categoryId } } : undefined,
    thumbnail: validated.thumbnailId ? { connect: { id: validated.thumbnailId } } : undefined,
    regions: validated.regions ? {
      connect: validated.regions.map((id: string) => ({ id })),
    } : undefined,
  };

  const createdDataset = await prisma.dataset.create({
    data,
  });

  revalidatePath("/admin/datasets");
  return createdDataset;
}

export async function updateDataset(id: string, datasetData: Record<string, unknown>) {
  const validated = datasetUpdateSchema.parse(datasetData);

  const data: Prisma.DatasetUpdateInput = {};

  if (validated.slug !== undefined) data.slug = validated.slug;
  if (validated.citationText !== undefined) data.citationText = toI18nJson(validated.citationText);
  if (validated.isVisible !== undefined) data.isVisible = validated.isVisible;
  if (validated.license !== undefined) data.license = validated.license;
  if (validated.maturity !== undefined) data.maturity = validated.maturity as DataMaturity;
  if (validated.status !== undefined) data.status = validated.status as ContentStatus;
  if (validated.version !== undefined) data.version = validated.version;
  if (validated.yearMin !== undefined) data.yearMin = validated.yearMin;
  if (validated.yearMax !== undefined) data.yearMax = validated.yearMax;

  if (validated.title !== undefined) data.title = toI18nJson(validated.title);
  if (validated.description !== undefined) data.description = toI18nJson(validated.description);
  if (validated.summary !== undefined) data.summary = toI18nJson(validated.summary);
  if (validated.sources !== undefined) data.sources = toI18nJson(validated.sources);
  if (validated.codebookText !== undefined) data.codebookText = toI18nJson(validated.codebookText);

  if (validated.categoryId !== undefined) {
    data.category = validated.categoryId ? { connect: { id: validated.categoryId } } : { disconnect: true };
  }
  if (validated.thumbnailId !== undefined) {
    data.thumbnail = validated.thumbnailId ? { connect: { id: validated.thumbnailId } } : { disconnect: true };
  }
  if (validated.regions !== undefined) {
    data.regions = { set: validated.regions.map((id: string) => ({ id })) };
  }

  const updatedDataset = await prisma.dataset.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/datasets");
  revalidatePath(`/admin/datasets/${id}`);
  return updatedDataset;
}

export async function deleteDataset(id: string) {
  await prisma.dataset.delete({
    where: { id },
  });

  revalidatePath("/admin/datasets");
}

// Resources
interface ResourceInput {
  name: string;
  slug: string;
  excerptI18n?: Record<string, string>;
  excerpt?: string;
  url: string;
  filename?: string;
  mimeType?: string;
  format?: string;
  sizeBytes?: number;
  isMainFile?: boolean;
}

export async function createDatasetResource(datasetId: string | null, resourceData: ResourceInput) {
    const resource = await prisma.datasetResource.create({
        data: {
            datasetId: datasetId || undefined,
            name: resourceData.name,
            slug: resourceData.slug,
            excerptI18n: resourceData.excerptI18n || resourceData.excerpt || {},
            url: resourceData.url,
            filename: resourceData.filename,
            mimeType: resourceData.mimeType,
            format: (resourceData.format || 'UNKNOWN') as ResouceType,
            sizeBytes: resourceData.sizeBytes || null,
            isMainFile: resourceData.isMainFile || false
        }
    });
    if (datasetId) {
        revalidatePath(`/admin/datasets/${datasetId}`);
    }
    revalidatePath('/admin/datasets');
    return resource;
}

export async function updateDatasetResource(id: string, resourceData: Partial<ResourceInput>) {
    const resource = await prisma.datasetResource.update({
        where: { id },
        data: {
            name: resourceData.name,
            slug: resourceData.slug,
            excerptI18n: resourceData.excerptI18n || resourceData.excerpt || {},
            url: resourceData.url,
            filename: resourceData.filename,
            mimeType: resourceData.mimeType,
            format: resourceData.format as ResouceType | undefined,
            isMainFile: resourceData.isMainFile
        }
    });
    // We need to know datasetId to revalidate, but we can't easily get it from here efficiently 
    // without fetching or passing it. Usually id is enough for update.
    // Ideally we revalidate the dataset page.
    if (resource.datasetId) {
        revalidatePath(`/admin/datasets/${resource.datasetId}`);
    }
    return resource;
}

export async function deleteDatasetResource(id: string) {
    const resource = await prisma.datasetResource.delete({
        where: { id }
    });
    if (resource.datasetId) {
        revalidatePath(`/admin/datasets/${resource.datasetId}`);
    }
}

// Link an existing resource to a dataset
export async function linkResourceToDataset(resourceId: string, datasetId: string | null) {
    const resource = await prisma.datasetResource.update({
        where: { id: resourceId },
        data: {
            datasetId: datasetId || null
        }
    });
    if (datasetId) {
        revalidatePath(`/admin/datasets/${datasetId}`);
    }
    if (resource.datasetId) {
        revalidatePath(`/admin/datasets/${resource.datasetId}`);
    }
    revalidatePath('/admin/datasets');
    return resource;
}

// Get all resources (including unassigned ones)
export async function getAllResources() {
    return await prisma.datasetResource.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            dataset: {
                select: {
                    id: true,
                    title: true,
                    slug: true
                }
            }
        }
    });
}

// Upload a file to R2 and return metadata
export async function uploadResourceFile(formData: FormData) {
    const file = formData.get('file') as File;
    const datasetId = formData.get('datasetId') as string | null;
    
    if (!file) {
        throw new Error('No file provided');
    }

    // Create a clean filename
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = datasetId || 'unassigned';
    const key = `datasets/${folder}/${Date.now()}_${cleanFilename}`;
    
    const url = await uploadFile(file, key);
    
    const name = file.name.split('.')[0];
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existing = await prisma.datasetResource.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    
    // Guess format from extension or mime type
    const ext = file.name.split('.').pop()?.toUpperCase();
    let format = 'UNKNOWN';
    
    const validFormats = ['XLSX', 'CSV', 'JSON', 'PDF', 'HTML', 'DOCX', 'ZIP', 'TXT', 'XLS', 'PNG', 'JPG', 'TIFF', 'URL'];
    if (ext && validFormats.includes(ext)) {
        format = ext;
    } else if (file.type) {
        if (file.type.includes('pdf')) format = 'PDF';
        else if (file.type.includes('json')) format = 'JSON';
        else if (file.type.includes('csv')) format = 'CSV';
        else if (file.type.includes('image/png')) format = 'PNG';
        else if (file.type.includes('image/jpeg')) format = 'JPG';
    }
    
    return {
        url,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        name,
        slug,
        format
    };
}

// ===================================================
// API Endpoint Server Actions
// ===================================================

// Types for API options
export interface ListDatasetsOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  regionId?: string;
  regionSlug?: string;
  maturity?: string;
  yearMin?: number;
  yearMax?: number;
  search?: string;
  hasLayers?: boolean;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
  lang?: string;
}

export interface GetDatasetOptions {
  lang?: string;
  includeResources?: boolean;
  includeLayers?: boolean;
}

export interface GetResourcesOptions {
  format?: string;
  lang?: string;
}

export interface GetMetadataOptions {
  lang?: string;
}

// Helper function to get localized field
function getLocalizedField(
  _legacy: unknown,
  i18nJson: unknown,
  lang?: string
): string | null {
  if (!i18nJson || typeof i18nJson !== "object") return null;
  const obj = i18nJson as Record<string, unknown>;
  const order = lang === "he" ? ["he", "en"] : lang === "en" ? ["en", "he"] : [lang, "en", "he"].filter(Boolean) as string[];
  for (const k of order) {
    const v = obj[k];
    if (typeof v === "string" && v) return v;
  }
  return null;
}

// List datasets with filtering and pagination (for API)
export async function listDatasetsAPI(options: ListDatasetsOptions = {}) {
  const {
    status,
    categoryId,
    categorySlug,
    regionId,
    regionSlug,
    maturity,
    yearMin,
    yearMax,
    search,
    hasLayers,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    lang,
  } = options;

  // Build where clause
  const where: Prisma.DatasetWhereInput = {
    ...(status && { status: status as ContentStatus }),
    ...(maturity && { maturity: maturity as DataMaturity }),
    ...(yearMin && { yearMin: { gte: yearMin } }),
    ...(yearMax && { yearMax: { lte: yearMax } }),
    ...(search && {
      OR: [
        { title: { path: ["he"], string_contains: search } },
        { title: { path: ["en"], string_contains: search } },
        { description: { path: ["he"], string_contains: search } },
        { description: { path: ["en"], string_contains: search } },
      ],
    }),
  };

  // Handle category filter
  if (categoryId) {
    where.categoryId = categoryId;
  } else if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  // Handle region filter
  if (regionId) {
    where.regions = { some: { id: regionId } };
  } else if (regionSlug) {
    where.regions = { some: { slug: regionSlug } };
  }

  // Handle hasLayers filter
  if (hasLayers === true) {
    where.layers = { some: {} };
  } else if (hasLayers === false) {
    where.layers = { none: {} };
  }

  // Pagination
  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);

  // Order by
  const orderBy: Prisma.DatasetOrderByWithRelationInput = {
    [sort]: order,
  };

  try {
    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
          thumbnail: {
            select: {
              url: true,
              altTextI18n: true,
            },
          },
          _count: {
            select: {
              resources: true,
              layers: true,
              ownedLayers: true,
            },
          },
        },
      }),
      prisma.dataset.count({ where }),
    ]);

    // Transform data with i18n support
    const transformedDatasets = datasets.map((dataset) => ({
      id: dataset.id,
      slug: dataset.slug,
      title: getLocalizedField(null, dataset.title, lang) ?? "",
      description: getLocalizedField(null, dataset.description, lang) ?? "",
      summary: getLocalizedField(null, dataset.summary, lang) ?? "",
      status: dataset.status,
      maturity: dataset.maturity,
      version: dataset.version,
      yearMin: dataset.yearMin,
      yearMax: dataset.yearMax,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(null, dataset.category.title, lang) ?? "",
          }
        : null,
      thumbnail: dataset.thumbnail
        ? {
            url: dataset.thumbnail.url,
            altText: getLocalizedField(null, dataset.thumbnail.altTextI18n, lang),
          }
        : null,
      resourceCount: dataset._count.resources,
      layerCount: dataset._count.layers,
      ownedLayerCount: dataset._count.ownedLayers,
      createdAt: toISOStringSafe(dataset.createdAt),
      updatedAt: toISOStringSafe(dataset.updatedAt),
    }));

    return {
      datasets: transformedDatasets,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    console.error("Error listing datasets:", error);
    throw new Error("Failed to list datasets");
  }
}

// Get single dataset by slug (for API)
export async function getDatasetBySlug(
  slug: string,
  options: GetDatasetOptions = {}
) {
  const { lang, includeResources = false, includeLayers = false } = options;

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        regions: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        thumbnail: {
          select: {
            url: true,
            altTextI18n: true,
          },
        },
        ...(includeResources && {
          resources: {
            select: {
              id: true,
              name: true,
              slug: true,
              url: true,
              filename: true,
              mimeType: true,
              format: true,
              isMainFile: true,
              sizeBytes: true,
              excerptI18n: true,
              createdAt: true,
            },
            orderBy: {
              isMainFile: "desc",
            },
          },
        }),
        ...(includeLayers && {
          layers: {
            include: {
              layer: true,
            },
            orderBy: {
              zIndex: "asc",
            },
          },
        }),
      },
    });

    if (!dataset) {
      return null;
    }

    // Transform data with i18n support
    return {
      id: dataset.id,
      slug: dataset.slug,
      title: getLocalizedField(null, dataset.title, lang) ?? "",
      description: getLocalizedField(null, dataset.description, lang) ?? "",
      summary: getLocalizedField(null, dataset.summary, lang) ?? "",
      status: dataset.status,
      maturity: dataset.maturity,
      version: dataset.version,
      yearMin: dataset.yearMin,
      yearMax: dataset.yearMax,
      license: dataset.license,
      citationText: dataset.citationText,
      codebookText: getLocalizedField(null, dataset.codebookText, lang) ?? "",
      sources: getLocalizedField(null, dataset.sources, lang) ?? "",
      isVisible: dataset.isVisible,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(null, dataset.category.title, lang) ?? "",
          }
        : null,
      regions: dataset.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: getLocalizedField(null, region.name, lang) ?? "",
      })),
      thumbnail: dataset.thumbnail
        ? {
            url: dataset.thumbnail.url,
            altText: getLocalizedField(null, dataset.thumbnail.altTextI18n, lang),
          }
        : null,
      ...(includeResources && {
        resources: (dataset as any).resources.map((resource: any) => ({
          id: resource.id,
          name: resource.name,
          slug: resource.slug,
          url: resource.url,
          filename: resource.filename,
          mimeType: resource.mimeType,
          format: resource.format,
          isMainFile: resource.isMainFile,
          sizeBytes: resource.sizeBytes,
          excerpt: getLocalizedField(null, resource.excerptI18n, lang),
          createdAt: toISOStringSafe(resource.createdAt),
        })),
      }),
      ...(includeLayers && {
        layers: (dataset as any).layers.map((assoc: any) => ({
          id: assoc.layer.id,
          slug: assoc.layer.slug,
          layerId: assoc.layerId,
          name: getLocalizedField(null, assoc.layer.name, lang) ?? "",
          description: getLocalizedField(null, assoc.layer.description, lang) ?? "",
          type: assoc.layer.type,
          sourceType: assoc.layer.sourceType,
          isVisible: assoc.isVisible,
          isVisibleByDefault: assoc.isVisibleByDefault,
          zIndex: assoc.zIndex,
        })),
      }),
      createdAt: toISOStringSafe(dataset.createdAt),
      updatedAt: toISOStringSafe(dataset.updatedAt),
    };
  } catch (error) {
    console.error("Error getting dataset:", error);
    throw new Error("Failed to get dataset");
  }
}

// Get dataset resources (for API)
export async function getDatasetResourcesBySlug(
  slug: string,
  options: GetResourcesOptions = {}
) {
  const { format, lang } = options;

  try {
    // First get the dataset to verify it exists
    const dataset = await prisma.dataset.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!dataset) {
      return null;
    }

    // Build where clause for resources
    const where: Prisma.DatasetResourceWhereInput = {
      datasetId: dataset.id,
      ...(format && { format: format as any }),
    };

    const resources = await prisma.datasetResource.findMany({
      where,
      orderBy: [{ isMainFile: "desc" }, { createdAt: "asc" }],
    });

    return {
      datasetId: dataset.id,
      datasetSlug: dataset.slug,
      resources: resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        slug: resource.slug,
        url: resource.url,
        filename: resource.filename,
        mimeType: resource.mimeType,
        format: resource.format,
        isMainFile: resource.isMainFile,
        sizeBytes: resource.sizeBytes,
        excerpt: getLocalizedField(null, resource.excerptI18n, lang),
        createdAt: toISOStringSafe(resource.createdAt),
      })),
      total: resources.length,
    };
  } catch (error) {
    console.error("Error getting dataset resources:", error);
    throw new Error("Failed to get dataset resources");
  }
}

// Get dataset metadata (for API)
export async function getDatasetMetadataBySlug(
  slug: string,
  options: GetMetadataOptions = {}
) {
  const { lang } = options;

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        version: true,
        maturity: true,
        license: true,
        citationText: true,
        codebookText: true,
        sources: true,
        yearMin: true,
        yearMax: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        regions: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!dataset) {
      return null;
    }

    return {
      datasetId: dataset.id,
      slug: dataset.slug,
      title: getLocalizedField(null, dataset.title, lang) ?? "",
      version: dataset.version,
      maturity: dataset.maturity,
      license: dataset.license,
      citationText: dataset.citationText,
      codebookText: getLocalizedField(null, dataset.codebookText, lang) ?? "",
      sources: getLocalizedField(null, dataset.sources, lang) ?? "",
      yearMin: dataset.yearMin,
      yearMax: dataset.yearMax,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(null, dataset.category.title, lang) ?? "",
          }
        : null,
      regions: dataset.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: getLocalizedField(null, region.name, lang) ?? "",
      })),
      createdAt: toISOStringSafe(dataset.createdAt),
      updatedAt: toISOStringSafe(dataset.updatedAt),
    };
  } catch (error) {
    console.error("Error getting dataset metadata:", error);
    throw new Error("Failed to get dataset metadata");
  }
}


