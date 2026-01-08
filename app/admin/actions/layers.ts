/**
 * Server Actions for Layer CRUD operations
 * Layers are standalone, reusable GeoJSON entities
 */

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getLocalizedField } from "./utils";

// Types
export interface LayerFormData {
  slug: string;
  name: string;
  name_i18n?: Record<string, string>;
  description?: string;
  description_i18n?: Record<string, string>;
  status: "draft" | "published" | "archived";
  version?: string;
  categoryId?: string;
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
  geoJsonData?: any;
  styleConfig?: any;
  thumbnail?: string | null;
  tagIds?: string[];
  regionIds?: string[];
}

export interface GetLayerOptions {
  lang?: string;
  includeMaps?: boolean;
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
  try {
    // console.log("=== CREATE LAYER START ===");
    // console.log("Layer data:", {
      slug: data.slug,
      name: data.name,
      type: data.type,
      sourceType: data.sourceType,
      hasGeoJsonData: !!data.geoJsonData,
      hasStyleConfig: !!data.styleConfig,
    });
    // console.log("StyleConfig:", JSON.stringify(data.styleConfig, null, 2));

    const layer = await prisma.layer.create({
      data: {
        slug: data.slug,
        name: data.name,
        nameI18n: data.name_i18n || {},
        description: data.description,
        descriptionI18n: data.description_i18n || {},
        status: data.status,
        version: data.version || "1.0.0",
        categoryId: data.categoryId,
        type: data.type,
        citationText: data.citationText,
        citationTextI18n: data.citation_text_i18n || {},
        codebookText: data.codebookText,
        codebookTextI18n: data.codebook_text_i18n || {},
        sources: data.sources,
        sourcesI18n: data.sources_i18n || {},
        license: data.license,
        maturity: data.maturity || "Provisional",
        minYear: data.minYear,
        maxYear: data.maxYear,
        sourceType: data.sourceType || "database",
        sourceUrl: data.sourceUrl,
        downloadUrl: data.downloadUrl,
        geoJsonData: data.geoJsonData,
        styleConfig: data.styleConfig || {},
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

    // console.log("Layer created successfully:", layer.id);
    // console.log("=== CREATE LAYER END ===");

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
  try {
    // console.log("=== UPDATE LAYER START ===");
    // console.log("Updating layer:", id);
    // console.log("Update data:", {
      hasStyleConfig: !!data.styleConfig,
      styleConfigType: typeof data.styleConfig,
      styleConfig: JSON.stringify(data.styleConfig, null, 2),
    });

    // Check if layer is used in any maps
    const layerWithMaps = await prisma.layer.findUnique({
      where: { id },
      include: { maps: true },
    });

    if (layerWithMaps && layerWithMaps.maps.length > 0) {
      // console.log(`Layer is used in ${layerWithMaps.maps.length} map(s)`);
    }

    const layer = await prisma.layer.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.name && { name: data.name }),
        ...(data.name_i18n && { nameI18n: data.name_i18n }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.description_i18n && { descriptionI18n: data.description_i18n }),
        ...(data.status && { status: data.status }),
        ...(data.version && { version: data.version }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.type && { type: data.type }),
        ...(data.citationText !== undefined && { citationText: data.citationText }),
        ...(data.citation_text_i18n && { citationTextI18n: data.citation_text_i18n }),
        ...(data.codebookText !== undefined && { codebookText: data.codebookText }),
        ...(data.codebook_text_i18n && { codebookTextI18n: data.codebook_text_i18n }),
        ...(data.sources !== undefined && { sources: data.sources }),
        ...(data.sources_i18n && { sourcesI18n: data.sources_i18n }),
        ...(data.license !== undefined && { license: data.license }),
        ...(data.maturity && { maturity: data.maturity }),
        ...(data.minYear !== undefined && { minYear: data.minYear }),
        ...(data.maxYear !== undefined && { maxYear: data.maxYear }),
        ...(data.sourceType && { sourceType: data.sourceType }),
        ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        ...(data.downloadUrl !== undefined && { downloadUrl: data.downloadUrl }),
        ...(data.geoJsonData !== undefined && { geoJsonData: data.geoJsonData }),
        ...(data.styleConfig !== undefined && { styleConfig: data.styleConfig }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.tagIds && {
          tags: {
            set: data.tagIds.map((id) => ({ id })),
          },
        }),
        ...(data.regionIds && {
          regions: {
            set: data.regionIds.map((id) => ({ id })),
          },
        }),
      },
    });

    // console.log("Layer updated successfully");
    // console.log("=== UPDATE LAYER END ===");

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
    // Check if layer is used in any maps
    const layerWithMaps = await prisma.layer.findUnique({
      where: { id },
      include: { maps: true },
    });

    if (!layerWithMaps) {
      throw new Error("Layer not found");
    }

    if (layerWithMaps.maps.length > 0) {
      throw new Error(
        `Cannot delete layer: it is used in ${layerWithMaps.maps.length} map(s). Remove it from all maps first.`
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
  const { lang, includeMaps = false } = options;

  try {
    const layer = await prisma.layer.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            titleI18n: true,
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
        ...(includeMaps && {
          maps: {
            include: {
              map: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  titleI18n: true,
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
      name: getLocalizedField(layer.name, layer.nameI18n, lang) || layer.name,
      description: getLocalizedField(layer.description, layer.descriptionI18n, lang) || layer.description,
      citationText: getLocalizedField(layer.citationText, layer.citationTextI18n, lang) || layer.citationText,
      codebookText: getLocalizedField(layer.codebookText, layer.codebookTextI18n, lang) || layer.codebookText,
      sources: getLocalizedField(layer.sources, layer.sourcesI18n, lang) || layer.sources,
      category: layer.category
        ? {
            ...layer.category,
            title: getLocalizedField(layer.category.title, layer.category.titleI18n, lang) || layer.category.title,
          }
        : null,
      tags: layer.tags.map((tag) => ({
        ...tag,
        name: getLocalizedField(tag.name, tag.nameI18n, lang) || tag.name,
      })),
      regions: layer.regions.map((region) => ({
        ...region,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
      })),
      ...(includeMaps && {
        maps: (layer as any).maps.map((assoc: any) => ({
          id: assoc.map.id,
          slug: assoc.map.slug,
          title: getLocalizedField(assoc.map.title, assoc.map.titleI18n, lang) || assoc.map.title,
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
  const { lang, includeMaps = false } = options;

  try {
    const layer = await prisma.layer.findUnique({
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
        ...(includeMaps && {
          maps: {
            include: {
              map: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  titleI18n: true,
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
      name: getLocalizedField(layer.name, layer.nameI18n, lang) || layer.name,
      description: getLocalizedField(layer.description, layer.descriptionI18n, lang) || layer.description,
      citationText: getLocalizedField(layer.citationText, layer.citationTextI18n, lang) || layer.citationText,
      codebookText: getLocalizedField(layer.codebookText, layer.codebookTextI18n, lang) || layer.codebookText,
      sources: getLocalizedField(layer.sources, layer.sourcesI18n, lang) || layer.sources,
      category: layer.category
        ? {
            ...layer.category,
            title: getLocalizedField(layer.category.title, layer.category.titleI18n, lang) || layer.category.title,
          }
        : null,
      tags: layer.tags.map((tag) => ({
        ...tag,
        name: getLocalizedField(tag.name, tag.nameI18n, lang) || tag.name,
      })),
      regions: layer.regions.map((region) => ({
        ...region,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
      })),
      ...(includeMaps && {
        maps: (layer as any).maps.map((assoc: any) => ({
          id: assoc.map.id,
          slug: assoc.map.slug,
          title: getLocalizedField(assoc.map.title, assoc.map.titleI18n, lang) || assoc.map.title,
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
    const where: any = {};

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
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
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
              titleI18n: true,
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
          _count: {
            select: {
              maps: true,
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
        name: getLocalizedField(layer.name, layer.nameI18n, lang) || layer.name,
        description: getLocalizedField(layer.description, layer.descriptionI18n, lang) || layer.description,
        category: layer.category
          ? {
              ...layer.category,
              title: getLocalizedField(layer.category.title, layer.category.titleI18n, lang) || layer.category.title,
            }
          : null,
        tags: layer.tags.map((tag) => ({
          ...tag,
          name: getLocalizedField(tag.name, tag.nameI18n, lang) || tag.name,
        })),
        regions: layer.regions.map((region) => ({
          ...region,
          name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
        })),
        mapsCount: (layer as any)._count.maps,
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
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        status: "published", // Only search published layers
      },
      select: {
        id: true,
        slug: true,
        name: true,
        nameI18n: true,
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
