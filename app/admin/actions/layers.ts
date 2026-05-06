/**
 * Server Actions for Layer CRUD operations
 * Layers are standalone, reusable GeoJSON entities
 */

"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { asJson } from "@/lib/prisma-json";
import {
  PolygonStyleConfigSchema,
  PointStyleConfigSchema,
  LabelConfigSchema,
  PopupConfigSchema,
  FilterConfigSchema,
  HoverConfigSchema,
} from "@/lib/shared-schemas";
import { revalidatePath } from "next/cache";
import { getLocalizedField } from "./utils";

/**
 * Schema for the JSON blob stored in `Layer.styleConfig`. Mirrors what the
 * layer editor saves: a top-level object containing `style` plus optional
 * sub-blocks for labels, popup, filter, and hover. Uses `.loose()` so
 * UI-only fields like `previewSettings` survive a round-trip without being
 * stripped.
 */
const StyleConfigBlobSchema = z
  .object({
    style: z.union([PolygonStyleConfigSchema, PointStyleConfigSchema]).optional(),
    labels: LabelConfigSchema.optional(),
    popup: PopupConfigSchema.optional(),
    filter: FilterConfigSchema.optional(),
    hover: HoverConfigSchema.optional(),
  })
  .loose();

export type LayerActionFailure = {
  ok: false;
  error: string;
  issues: z.core.$ZodIssue[];
};

function validateStyleConfig(
  raw: unknown,
): { ok: true; data: z.infer<typeof StyleConfigBlobSchema> } | LayerActionFailure {
  const result = StyleConfigBlobSchema.safeParse(raw ?? {});
  if (!result.success) {
    return {
      ok: false,
      error: "styleConfig validation failed",
      issues: result.error.issues,
    };
  }
  return { ok: true, data: result.data };
}

// Types
export interface LayerFormData {
  slug: string;
  name: string;
  name_i18n?: Record<string, string>;
  description?: string;
  description_i18n?: Record<string, string>;
  summary?: string;
  summary_i18n?: Record<string, string>;
  status: "draft" | "published" | "archived";
  version?: string;
  categoryId?: string;
  datasetId?: string;
  type: "POINTS" | "POLYGONS" | "POLYLINES" | "MULTI_POLYGONS" | "RASTER";
  citationText?: string;
  citation_text_i18n?: Record<string, string>;
  codebookText?: string;
  codebook_text_i18n?: Record<string, string>;
  sources?: string;
  sources_i18n?: Record<string, string>;
  license?: string;
  maturity?: "Raw" | "Preliminary" | "Provisional" | "Validated";
  minYear?: number;
  maxYear?: number;
  sourceType?: "url" | "database" | "inline";
  sourceUrl?: string;
  downloadUrl?: string;
  filename?: string;
  geoJsonData?: Record<string, unknown>;
  styleConfig?: Record<string, unknown>;
  thumbnail?: string | null;
  tagIds?: string[];
  regionIds?: string[];
}

export interface GetLayerOptions {
  lang?: string;
  includeMaps?: boolean;
  includeDatasets?: boolean;
}

export interface ListLayersOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  tagId?: string;
  tagSlug?: string;
  regionId?: string;
  regionSlug?: string;
  type?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  maturity?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "name" | "minYear";
  order?: "asc" | "desc";
  lang?: string;
}

/**
 * Create a new Layer
 */
export async function createLayer(data: LayerFormData) {
  // Validate styleConfig at the API boundary using shared Zod schemas.
  // On failure, return a structured error instead of crashing inside Prisma.
  const styleResult = validateStyleConfig(data.styleConfig);
  if (!styleResult.ok) {
    console.error("createLayer styleConfig validation failed", styleResult.issues);
    return styleResult;
  }

  try {
    let slug = data.slug;
    const existing = await prisma.layer.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const layer = await prisma.layer.create({
      data: {
        slug,
        name: data.name_i18n || {},
        description: data.description_i18n || {},
        summary: data.summary_i18n || {},
        status: data.status,
        version: data.version || "1.0.0",
        categoryId: data.categoryId,
        datasetId: data.datasetId,
        type: data.type,
        citationText: data.citation_text_i18n || {},
        codebookText: data.codebook_text_i18n || {},
        sources: data.sources_i18n || {},
        license: data.license,
        maturity: data.maturity || "Provisional",
        minYear: data.minYear,
        maxYear: data.maxYear,
        sourceType: data.sourceType || "database",
        sourceUrl: data.sourceUrl,
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        geoJsonData: asJson(data.geoJsonData ?? {}),
        styleConfig: asJson(styleResult.data),
        ...(data.tagIds && {
          tags: {
            connect: data.tagIds.map((id) => ({ id })),
          },
        }),
        ...(data.regionIds && {
          regions: {
            connect: data.regionIds.map((id) => ({ id })),
          },
        }),
      },
    });


    revalidatePath("/admin/layers");
    return layer;
  } catch (error) {
    console.error("Error creating layer:", error);
    throw error;
  }
}

/**
 * Update an existing Layer
 */
export async function updateLayer(id: string, data: Partial<LayerFormData>) {
  // Validate styleConfig at the API boundary if it's part of this update.
  let validatedStyle: z.infer<typeof StyleConfigBlobSchema> | undefined;
  if (data.styleConfig !== undefined) {
    const styleResult = validateStyleConfig(data.styleConfig);
    if (!styleResult.ok) {
      console.error("updateLayer styleConfig validation failed", styleResult.issues);
      return styleResult;
    }
    validatedStyle = styleResult.data;
  }

  try {

    // Check if layer is used in any datasets
    const layerWithDatasets = await prisma.layer.findUnique({
      where: { id },
      include: { datasets: true },
    });

    if (layerWithDatasets && layerWithDatasets.datasets.length > 0) {
    }

    const updateData: Prisma.LayerUncheckedUpdateInput = {
        ...(data.slug && { slug: data.slug }),
        ...(data.name && { name: data.name }),
        ...(data.name_i18n && { name: data.name_i18n }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.description_i18n && { description: data.description_i18n }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.summary_i18n && { summary: data.summary_i18n }),
        ...(data.status && { status: data.status }),
        ...(data.version && { version: data.version }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.datasetId !== undefined && { datasetId: data.datasetId }),
        ...(data.type && { type: data.type }),
        ...(data.citationText !== undefined && { citationText: data.citationText }),
        ...(data.citation_text_i18n && { citationText: data.citation_text_i18n }),
        ...(data.codebookText !== undefined && { codebookText: data.codebookText }),
        ...(data.codebook_text_i18n && { codebookText: data.codebook_text_i18n }),
        ...(data.sources !== undefined && { sources: data.sources }),
        ...(data.sources_i18n && { sources: data.sources_i18n }),
        ...(data.license !== undefined && { license: data.license }),
        ...(data.maturity && { maturity: data.maturity }),
        ...(data.minYear !== undefined && { minYear: data.minYear }),
        ...(data.maxYear !== undefined && { maxYear: data.maxYear }),
        ...(data.sourceType && { sourceType: data.sourceType }),
        ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        ...(data.downloadUrl !== undefined && { downloadUrl: data.downloadUrl }),
        ...(data.filename !== undefined && { filename: data.filename }),
        ...(data.geoJsonData !== undefined && { geoJsonData: asJson(data.geoJsonData) }),
        ...(validatedStyle !== undefined && { styleConfig: asJson(validatedStyle) }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.tagIds && {
          tags: {
            set: data.tagIds.map((tagId) => ({ id: tagId })),
          },
        }),
        ...(data.regionIds && {
          regions: {
            set: data.regionIds.map((regionId) => ({ id: regionId })),
          },
        }),
    };

    const layer = await prisma.layer.update({
      where: { id },
      data: updateData,
    });


    revalidatePath("/admin/layers");
    revalidatePath(`/admin/layers/${id}`);
    return layer;
  } catch (error) {
    console.error("Error updating layer:", error);
    throw error;
  }
}

/**
 * Delete a Layer
 * Checks if layer is used in any maps first
 */
export async function deleteLayer(id: string) {
  try {
    // Check if layer is used in any datasets
    const layerWithDatasets = await prisma.layer.findUnique({
      where: { id },
      include: { datasets: true },
    });

    if (!layerWithDatasets) {
      throw new Error("Layer not found");
    }

    if (layerWithDatasets.datasets.length > 0) {
      throw new Error(
        `Cannot delete layer: it is used in ${layerWithDatasets.datasets.length} dataset(s). Remove it from all datasets first.`
      );
    }

    await prisma.layer.delete({
      where: { id },
    });

    revalidatePath("/admin/layers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting layer:", error);
    throw error;
  }
}

/**
 * Get a single Layer by ID
 */
export async function getLayer(id: string, options: GetLayerOptions = {}) {
  const { lang, includeMaps = false, includeDatasets = false } = options;
  const shouldIncludeDatasets = includeDatasets || includeMaps;

  try {
    const layer = await prisma.layer.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        tags: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        regions: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        ...(shouldIncludeDatasets && {
          datasets: {
            include: {
              dataset: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
            },
          },
        }),
      },
    });

    if (!layer) {
      return null;
    }

    // Transform with i18n
    return {
      ...layer,
      name: getLocalizedField(null, layer.name, lang),
      description: getLocalizedField(null, layer.description, lang),
      summary: getLocalizedField(null, layer.summary, lang),
      citationText: getLocalizedField(null, layer.citationText, lang),
      codebookText: getLocalizedField(null, layer.codebookText, lang),
      sources: getLocalizedField(null, layer.sources, lang),
      category: layer.category
        ? {
            ...layer.category,
            title: getLocalizedField(null, layer.category.title, lang),
          }
        : null,
      tags: layer.tags.map((tag) => ({
        ...tag,
        name: getLocalizedField(null, tag.name, lang),
      })),
      regions: layer.regions.map((region) => ({
        ...region,
        name: getLocalizedField(null, region.name, lang),
      })),
      ...(shouldIncludeDatasets && {
        datasets: (layer as unknown as { datasets: Array<{ dataset: { id: string; slug: string; title: unknown } }> }).datasets.map((assoc) => ({
          id: assoc.dataset.id,
          slug: assoc.dataset.slug,
          title: getLocalizedField(null, assoc.dataset.title, lang),
        })),
      }),
    };
  } catch (error) {
    console.error("Error fetching layer:", error);
    throw error;
  }
}

/**
 * Get a Layer by slug
 */
export async function getLayerBySlug(slug: string, options: GetLayerOptions = {}) {
  const { lang, includeMaps = false, includeDatasets = false } = options;
  const shouldIncludeDatasets = includeDatasets || includeMaps;

  try {
    const layer = await prisma.layer.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        tags: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        regions: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        ...(shouldIncludeDatasets && {
          datasets: {
            include: {
              dataset: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
            },
          },
        }),
      },
    });

    if (!layer) {
      return null;
    }

    // Transform with i18n (same as getLayer)
    return {
      ...layer,
      name: getLocalizedField(null, layer.name, lang),
      description: getLocalizedField(null, layer.description, lang),
      summary: getLocalizedField(null, layer.summary, lang),
      citationText: getLocalizedField(null, layer.citationText, lang),
      codebookText: getLocalizedField(null, layer.codebookText, lang),
      sources: getLocalizedField(null, layer.sources, lang),
      category: layer.category
        ? {
            ...layer.category,
            title: getLocalizedField(null, layer.category.title, lang),
          }
        : null,
      tags: layer.tags.map((tag) => ({
        ...tag,
        name: getLocalizedField(null, tag.name, lang),
      })),
      regions: layer.regions.map((region) => ({
        ...region,
        name: getLocalizedField(null, region.name, lang),
      })),
      ...(shouldIncludeDatasets && {
        datasets: (layer as unknown as { datasets: Array<{ dataset: { id: string; slug: string; title: unknown } }> }).datasets.map((assoc) => ({
          id: assoc.dataset.id,
          slug: assoc.dataset.slug,
          title: getLocalizedField(null, assoc.dataset.title, lang),
        })),
      }),
    };
  } catch (error) {
    console.error("Error fetching layer by slug:", error);
    throw error;
  }
}

/**
 * List Layers with filtering and pagination
 */
export async function listLayersAPI(options: ListLayersOptions = {}) {
  const {
    status,
    categoryId,
    categorySlug,
    tagId,
    tagSlug,
    regionId,
    regionSlug,
    type,
    year,
    yearMin,
    yearMax,
    maturity,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    lang,
  } = options;

  try {
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (type) where.type = type;
    if (maturity) where.maturity = maturity;

    if (tagId) {
      where.tags = { some: { id: tagId } };
    } else if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
    }

    if (regionId) {
      where.regions = { some: { id: regionId } };
    } else if (regionSlug) {
      where.regions = { some: { slug: regionSlug } };
    }

    // Year filtering
    if (year) {
      where.AND = [{ minYear: { lte: year } }, { maxYear: { gte: year } }];
    } else {
      if (yearMin) where.minYear = { gte: yearMin };
      if (yearMax) where.maxYear = { lte: yearMax };
    }

    // Search
    if (search) {
      where.OR = [
        { name: { path: ["he"], string_contains: search } },
        { name: { path: ["en"], string_contains: search } },
        { description: { path: ["he"], string_contains: search } },
        { description: { path: ["en"], string_contains: search } },
      ];
    }

    const [layers, total] = await Promise.all([
      prisma.layer.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
          tags: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          regions: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          _count: {
            select: {
              datasets: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.layer.count({ where }),
    ]);

    // Transform with i18n and add GeoJSON URL
    const transformedLayers = layers.map((layer) => {
      const { geoJsonData, ...layerWithoutGeoJson } = layer;
      
      return {
        ...layerWithoutGeoJson,
        name: getLocalizedField(null, layer.name, lang),
        description: getLocalizedField(null, layer.description, lang),
        summary: getLocalizedField(null, layer.summary, lang),
        category: layer.category
          ? {
              ...layer.category,
              title: getLocalizedField(null, layer.category.title, lang),
            }
          : null,
        tags: layer.tags.map((tag) => ({
          ...tag,
          name: getLocalizedField(null, tag.name, lang),
        })),
        regions: layer.regions.map((region) => ({
          ...region,
          name: getLocalizedField(null, region.name, lang),
        })),
        datasetsCount: (layer as unknown as { _count: { datasets: number } })._count.datasets,
        geoJsonUrl: `/api/geo/layers/${layer.slug}/geojson`,
      };
    });

    return {
      layers: transformedLayers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error listing layers:", error);
    throw error;
  }
}

/**
 * Search Layers by name/description
 */
export async function searchLayers(query: string, limit = 10) {
  try {
    const layers = await prisma.layer.findMany({
      where: {
        OR: [
          { name: { path: ["he"], string_contains: query } },
          { name: { path: ["en"], string_contains: query } },
          { description: { path: ["he"], string_contains: query } },
          { description: { path: ["en"], string_contains: query } },
        ],
        status: "published", // Only search published layers
      },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        minYear: true,
        maxYear: true,
      },
      take: limit,
    });

    return layers;
  } catch (error) {
    console.error("Error searching layers:", error);
    throw error;
  }
}

export async function getLayersByDatasetId(datasetId: string) {
  try {
    const associations = await prisma.datasetLayerAssociation.findMany({
      where: { datasetId },
      include: {
        layer: {
          include: {
            category: {
              select: { id: true, slug: true, title: true },
            },
            tags: {
              select: { id: true, slug: true, name: true },
            },
          },
        },
      },
      orderBy: { zIndex: "asc" },
    });

    return associations.map((assoc) => ({
      associationId: assoc.id,
      zIndex: assoc.zIndex,
      isVisible: assoc.isVisible,
      isVisibleByDefault: assoc.isVisibleByDefault,
      styleOverride: assoc.styleOverride,
      interactionConfig: assoc.interactionConfig,
      layer: assoc.layer,
    }));
  } catch (error) {
    console.error("Error fetching layers by dataset ID:", error);
    throw error;
  }
}
