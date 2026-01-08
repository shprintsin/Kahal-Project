"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";
import { uploadToR2 } from "@/utils/r2";

// Datasets
export async function getDatasets() {
  const datasets = await prisma.researchDataset.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
        category: true
    }
  });

  return datasets;
}

export async function getDataset(id: string) {
  const dataset = await prisma.researchDataset.findUnique({
    where: { id },
    include: {
      resources: true,
      regions: true,
      category: true,
      thumbnail: true
    },
  });

  if (!dataset) throw new Error("Dataset not found");
  return dataset;
}

import { datasetSchema } from "../schema/dataset";

const splitI18nField = (fieldData: any) => {
  if (!fieldData || typeof fieldData !== 'object') {
     return { main: fieldData || "", i18n: {} };
  }
  const { he, ...rest } = fieldData;
  return { main: he || "", i18n: rest };
};

export async function createDataset(datasetData: any) {
  const validated = datasetSchema.parse(datasetData);
  
  const titleSplit = splitI18nField(validated.title);
  const descriptionSplit = splitI18nField(validated.description);
  const sourcesSplit = splitI18nField(validated.sources);
  const codebookTextSplit = splitI18nField(validated.codebookText);

  const data: Prisma.ResearchDatasetCreateInput = {
    slug: validated.slug,
    
    // Split Title
    title: titleSplit.main,
    titleI18n: titleSplit.i18n,
    
    // Split fields
    description: descriptionSplit.main,
    descriptionI18n: descriptionSplit.i18n,
    sources: sourcesSplit.main,
    sourcesI18n: sourcesSplit.i18n,
    codebookText: codebookTextSplit.main,
    codebookTextI18n: codebookTextSplit.i18n,
    
    citationText: validated.citationText,
    isVisible: validated.isVisible,
    license: validated.license,
    maturity: validated.maturity as any, // Cast to enum
    status: validated.status as any,
    version: validated.version,
    minYear: validated.minYear,
    maxYear: validated.maxYear,
    
    category: validated.categoryId ? { connect: { id: validated.categoryId } } : undefined,
    thumbnail: validated.thumbnailId ? { connect: { id: validated.thumbnailId } } : undefined,
    regions: validated.regions ? {
      connect: validated.regions.map((id: string) => ({ id })),
    } : undefined,
  };

  const createdDataset = await prisma.researchDataset.create({
    data,
  });

  revalidatePath("/admin/datasets");
  return createdDataset;
}

export async function updateDataset(id: string, datasetData: any) {
  const validated = datasetSchema.parse(datasetData);

  const titleSplit = splitI18nField(validated.title);
  const descriptionSplit = splitI18nField(validated.description);
  const sourcesSplit = splitI18nField(validated.sources);
  const codebookTextSplit = splitI18nField(validated.codebookText);

  const data: Prisma.ResearchDatasetUpdateInput = {
    slug: validated.slug,
    
    // Split Title
    title: titleSplit.main,
    titleI18n: titleSplit.i18n,
    
    description: descriptionSplit.main,
    descriptionI18n: descriptionSplit.i18n,
    sources: sourcesSplit.main,
    sourcesI18n: sourcesSplit.i18n,
    codebookText: codebookTextSplit.main,
    codebookTextI18n: codebookTextSplit.i18n,
    
    citationText: validated.citationText,
    isVisible: validated.isVisible,
    license: validated.license,
    maturity: validated.maturity as any,
    status: validated.status as any,
    version: validated.version,
    minYear: validated.minYear,
    maxYear: validated.maxYear,
    
    category: validated.categoryId ? { connect: { id: validated.categoryId } } : { disconnect: true },
    thumbnail: validated.thumbnailId ? { connect: { id: validated.thumbnailId } } : { disconnect: true },
    regions: validated.regions ? {
      set: validated.regions.map((id: string) => ({ id })),
    } : undefined,
  };

  const updatedDataset = await prisma.researchDataset.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/datasets");
  revalidatePath(`/admin/datasets/${id}`);
  return updatedDataset;
}

export async function deleteDataset(id: string) {
  await prisma.researchDataset.delete({
    where: { id },
  });

  revalidatePath("/admin/datasets");
}

// Resources
export async function createDatasetResource(datasetId: string | null, resourceData: any) {
    const resource = await prisma.datasetResource.create({
        data: {
            datasetId: datasetId || undefined,
            name: resourceData.name,
            slug: resourceData.slug,
            excerptI18n: resourceData.excerptI18n || resourceData.excerpt || {},
            url: resourceData.url,
            filename: resourceData.filename,
            mimeType: resourceData.mimeType,
            format: resourceData.format || 'UNKNOWN',
            isMainFile: resourceData.isMainFile || false
        }
    });
    if (datasetId) {
        revalidatePath(`/admin/datasets/${datasetId}`);
    }
    revalidatePath('/admin/datasets');
    return resource;
}

export async function updateDatasetResource(id: string, resourceData: any) {
    const resource = await prisma.datasetResource.update({
        where: { id },
        data: {
            name: resourceData.name,
            slug: resourceData.slug,
            excerptI18n: resourceData.excerptI18n || resourceData.excerpt || {},
            url: resourceData.url,
            filename: resourceData.filename,
            mimeType: resourceData.mimeType,
            format: resourceData.format,
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
    
    const url = await uploadToR2(file, key);
    
    const name = file.name.split('.')[0];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
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
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
  lang?: string;
}

export interface GetDatasetOptions {
  lang?: string;
  includeResources?: boolean;
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
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    lang,
  } = options;

  // Build where clause
  const where: Prisma.ResearchDatasetWhereInput = {
    ...(status && { status: status as any }),
    ...(maturity && { maturity: maturity as any }),
    ...(yearMin && { minYear: { gte: yearMin } }),
    ...(yearMax && { maxYear: { lte: yearMax } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
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

  // Pagination
  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);

  // Order by
  const orderBy: Prisma.ResearchDatasetOrderByWithRelationInput = {
    [sort]: order,
  };

  try {
    const [datasets, total] = await Promise.all([
      prisma.researchDataset.findMany({
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
              titleI18n: true,
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
            },
          },
        },
      }),
      prisma.researchDataset.count({ where }),
    ]);

    // Transform data with i18n support
    const transformedDatasets = datasets.map((dataset) => ({
      id: dataset.id,
      slug: dataset.slug,
      title: getLocalizedField(dataset.title, dataset.titleI18n, lang) || dataset.title,
      description: getLocalizedField(dataset.description, dataset.descriptionI18n, lang) || dataset.description,
      status: dataset.status,
      maturity: dataset.maturity,
      version: dataset.version,
      minYear: dataset.minYear,
      maxYear: dataset.maxYear,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(dataset.category.title, dataset.category.titleI18n, lang) || dataset.category.title,
          }
        : null,
      thumbnail: dataset.thumbnail
        ? {
            url: dataset.thumbnail.url,
            altText: getLocalizedField(null, dataset.thumbnail.altTextI18n, lang),
          }
        : null,
      resourceCount: dataset._count.resources,
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
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
  const { lang, includeResources = false } = options;

  try {
    const dataset = await prisma.researchDataset.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            titleI18n: true,
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
              excerptI18n: true,
              createdAt: true,
            },
            orderBy: {
              isMainFile: "desc",
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
      title: getLocalizedField(dataset.title, dataset.titleI18n, lang) || dataset.title,
      description: getLocalizedField(dataset.description, dataset.descriptionI18n, lang) || dataset.description,
      status: dataset.status,
      maturity: dataset.maturity,
      version: dataset.version,
      minYear: dataset.minYear,
      maxYear: dataset.maxYear,
      license: dataset.license,
      citationText: dataset.citationText,
      codebookText: getLocalizedField(dataset.codebookText, dataset.codebookTextI18n, lang) || dataset.codebookText,
      sources: getLocalizedField(dataset.sources, dataset.sourcesI18n, lang) || dataset.sources,
      isVisible: dataset.isVisible,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(dataset.category.title, dataset.category.titleI18n, lang) || dataset.category.title,
          }
        : null,
      regions: dataset.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
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
          excerpt: getLocalizedField(null, resource.excerptI18n, lang),
          createdAt: resource.createdAt.toISOString(),
        })),
      }),
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
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
    const dataset = await prisma.researchDataset.findUnique({
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
        excerpt: getLocalizedField(null, resource.excerptI18n, lang),
        createdAt: resource.createdAt.toISOString(),
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
    const dataset = await prisma.researchDataset.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        titleI18n: true,
        version: true,
        maturity: true,
        license: true,
        citationText: true,
        codebookText: true,
        codebookTextI18n: true,
        sources: true,
        sourcesI18n: true,
        minYear: true,
        maxYear: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            titleI18n: true,
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

    if (!dataset) {
      return null;
    }

    return {
      datasetId: dataset.id,
      slug: dataset.slug,
      title: getLocalizedField(dataset.title, dataset.titleI18n, lang) || dataset.title,
      version: dataset.version,
      maturity: dataset.maturity,
      license: dataset.license,
      citationText: dataset.citationText,
      codebookText: getLocalizedField(dataset.codebookText, dataset.codebookTextI18n, lang) || dataset.codebookText,
      sources: getLocalizedField(dataset.sources, dataset.sourcesI18n, lang) || dataset.sources,
      minYear: dataset.minYear,
      maxYear: dataset.maxYear,
      category: dataset.category
        ? {
            id: dataset.category.id,
            slug: dataset.category.slug,
            title: getLocalizedField(dataset.category.title, dataset.category.titleI18n, lang) || dataset.category.title,
          }
        : null,
      regions: dataset.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
      })),
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting dataset metadata:", error);
    throw new Error("Failed to get dataset metadata");
  }
}


