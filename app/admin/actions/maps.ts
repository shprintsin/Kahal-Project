"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { ContentStatus, Prisma } from "@prisma/client";

interface MapLayerInput {
  layerId?: string;
  id?: string;
  name?: string;
  type: string;
  sourceType?: string;
  url?: string;
  data?: Prisma.InputJsonValue;
  visible?: boolean;
  style?: Prisma.InputJsonValue;
  labels?: Prisma.InputJsonValue;
  popup?: Prisma.InputJsonValue;
  filter?: Prisma.InputJsonValue;
  interactionConfig?: Prisma.InputJsonValue;
}

interface MapConfigInput {
  tile?: Record<string, unknown> | string;
  basemap?: string;
  zoom?: number;
  center?: [number, number];
  customCSS?: string;
  layers?: MapLayerInput[];
}

export interface MapInput {
  slug: string;
  status?: string;
  title?: string;
  description?: string;
  summary?: string;
  title_i18n?: Prisma.InputJsonValue;
  titleI18n?: Prisma.InputJsonValue;
  description_i18n?: Prisma.InputJsonValue;
  descriptionI18n?: Prisma.InputJsonValue;
  summary_i18n?: Prisma.InputJsonValue;
  summaryI18n?: Prisma.InputJsonValue;
  area_i18n?: Prisma.InputJsonValue;
  areaI18n?: Prisma.InputJsonValue;
  year?: string | number | null;
  yearMin?: number | null;
  yearMax?: number | null;
  period?: string | null;
  version?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnailId?: string | null;
  categoryId?: string | null;
  tagIds?: string[];
  regionIds?: string[];
  download_url?: string | null;
  downloadUrl?: string | null;
  download_size_bytes?: number | null;
  downloadSizeBytes?: number | null;
  config?: MapConfigInput;
  global_style_config?: Prisma.InputJsonValue;
  globalStyleConfig?: Prisma.InputJsonValue;
  reference_links?: Prisma.InputJsonValue;
  referenceLinks?: Prisma.InputJsonValue;
}

interface LayerAssociationInput {
  map_id?: string;
  mapId?: string;
  layer_id?: string;
  layerId?: string;
  z_index?: number;
  zIndex?: number;
  is_visible?: boolean;
  isVisible?: boolean;
  is_visible_by_default?: boolean;
  isVisibleByDefault?: boolean;
  style_override?: Prisma.InputJsonValue;
  styleOverride?: Prisma.InputJsonValue;
  interaction_config?: Prisma.InputJsonValue;
  interactionConfig?: Prisma.InputJsonValue;
}

type MapLayerAssociationWithLayer = Prisma.MapLayerAssociationGetPayload<{
  include: { layer: true };
}>;

interface MapResourceItem {
  id: string;
  name: string | null;
  slug: string | null;
  url: string | null;
  filename: string | null;
  mimeType: string | null;
  format: string | null;
  isMainFile: boolean;
  excerptI18n: unknown;
  createdAt: Date;
}

// Maps
export async function getMaps() {
  const maps = await prisma.map.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return maps;
}

export async function getMap(id: string) {
  const map = await prisma.map.findUnique({
    where: { id },
    include: {
      layers: {
        orderBy: {
          zIndex: 'asc',
        },
      },
      category: { select: { id: true, slug: true, title: true, titleI18n: true } },
      tags: { select: { id: true, slug: true, name: true, nameI18n: true } },
      regions: { select: { id: true, slug: true, name: true, nameI18n: true } },
      thumbnail: { select: { id: true, url: true, altTextI18n: true } },
    },
  });

  if (!map) throw new Error("Map not found");
  return map;
}

export async function createMap(mapData: MapInput) {

  // Deduplicate slug
  if (mapData.slug) {
    const existing = await prisma.map.findUnique({ where: { slug: mapData.slug }, select: { id: true } });
    if (existing) {
      mapData.slug = `${mapData.slug}-${Date.now()}`;
    }
  }

  // Extract layers from config
  const layers = mapData.config?.layers || [];

  // Create map-level config WITHOUT layers
  const mapConfig = {
    tile: mapData.config?.tile,
    basemap: mapData.config?.basemap,
    zoom: mapData.config?.zoom,
    center: mapData.config?.center,
    customCSS: mapData.config?.customCSS,
  };

  const data: Record<string, unknown> = {
    slug: mapData.slug,
    status: (mapData.status || 'draft') as ContentStatus,
    ...(mapData.title && { title: mapData.title }),
    titleI18n: mapData.title_i18n || mapData.titleI18n,
    ...(mapData.description !== undefined && { description: mapData.description }),
    descriptionI18n: mapData.description_i18n || mapData.descriptionI18n,
    ...(mapData.summary !== undefined && { summary: mapData.summary }),
    summaryI18n: mapData.summary_i18n || mapData.summaryI18n,
    areaI18n: mapData.area_i18n || mapData.areaI18n,
    year: mapData.year,
    yearMin: mapData.yearMin,
    yearMax: mapData.yearMax,
    period: mapData.period,
    version: mapData.version,
    thumbnailUrl: mapData.thumbnail_url || mapData.thumbnailUrl,
    ...(mapData.thumbnailId && {
      thumbnail: { connect: { id: mapData.thumbnailId } },
    }),
    ...(mapData.categoryId && {
      category: { connect: { id: mapData.categoryId } },
    }),
    ...(mapData.tagIds && {
      tags: { connect: mapData.tagIds.map((id) => ({ id })) },
    }),
    ...(mapData.regionIds && {
      regions: { connect: mapData.regionIds.map((id) => ({ id })) },
    }),
    downloadUrl: mapData.download_url || mapData.downloadUrl,
    downloadSizeBytes: mapData.download_size_bytes || mapData.downloadSizeBytes,
    config: mapConfig,
    globalStyleConfig: mapData.global_style_config || mapData.globalStyleConfig,
    referenceLinks: mapData.reference_links || mapData.referenceLinks,
  };

  const createdMap = await prisma.map.create({
    data: data as Prisma.MapCreateInput,
  });


  // Create MapLayer records for each layer
  if (layers.length > 0) {
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      
      // Determine source type and data storage
      const sourceType = layer.sourceType || (layer.url ? 'url' : 'database');
      const hasGeoJsonData = layer.data && Object.keys(layer.data).length > 0;
      
      // Convert layer type to Prisma enum format
      const prismaLayerType = layer.type === 'polygon' ? 'POLYGONS' : 
                              layer.type === 'point' ? 'POINTS' : 
                              layer.type.toUpperCase();
      

      await prisma.mapLayerAssociation.create({
        data: {
          mapId: createdMap.id,
          layerId: (layer.layerId || layer.id)!,
          zIndex: i,
          isVisible: layer.visible !== false,
          isVisibleByDefault: layer.visible !== false,
          styleOverride: {
            style: layer.style,
            labels: layer.labels,
            popup: layer.popup,
            filter: layer.filter,
          } as Prisma.InputJsonValue,
          interactionConfig: (layer.interactionConfig || {}) as Prisma.InputJsonValue,
        },
      });
    }
  }

  revalidatePath("/admin/maps");
  revalidatePath("/admin/maps2");
  revalidatePath("/maps");
  return createdMap;
}

export async function updateMap(id: string, mapData: MapInput) {

  // Extract layers from config
  const layers = mapData.config?.layers || [];

  // Create map-level config WITHOUT layers (only if config was provided)
  const mapConfig = mapData.config ? {
    tile: mapData.config.tile,
    basemap: mapData.config.basemap,
    zoom: mapData.config.zoom,
    center: mapData.config.center,
    customCSS: mapData.config.customCSS,
  } : undefined;

  const data: Record<string, unknown> = {};

  if (mapData.slug !== undefined) data.slug = mapData.slug;
  if (mapData.status !== undefined) data.status = mapData.status as ContentStatus;
  if (mapData.title !== undefined) data.title = mapData.title;
  if (mapData.description !== undefined) data.description = mapData.description;
  if (mapData.summary !== undefined) data.summary = mapData.summary;
  if (mapData.year !== undefined) data.year = mapData.year;
  if (mapData.yearMin !== undefined) data.yearMin = mapData.yearMin;
  if (mapData.yearMax !== undefined) data.yearMax = mapData.yearMax;
  if (mapData.period !== undefined) data.period = mapData.period;
  if (mapData.version !== undefined) data.version = mapData.version;
  if (mapConfig !== undefined) data.config = mapConfig;

  const titleI18n = mapData.title_i18n || mapData.titleI18n;
  if (titleI18n !== undefined) data.titleI18n = titleI18n;
  const descriptionI18n = mapData.description_i18n || mapData.descriptionI18n;
  if (descriptionI18n !== undefined) data.descriptionI18n = descriptionI18n;
  const summaryI18n = mapData.summary_i18n || mapData.summaryI18n;
  if (summaryI18n !== undefined) data.summaryI18n = summaryI18n;
  const areaI18n = mapData.area_i18n || mapData.areaI18n;
  if (areaI18n !== undefined) data.areaI18n = areaI18n;

  const thumbnailUrl = mapData.thumbnail_url || mapData.thumbnailUrl;
  if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl;
  const downloadUrl = mapData.download_url || mapData.downloadUrl;
  if (downloadUrl !== undefined) data.downloadUrl = downloadUrl;
  const downloadSizeBytes = mapData.download_size_bytes || mapData.downloadSizeBytes;
  if (downloadSizeBytes !== undefined) data.downloadSizeBytes = downloadSizeBytes;
  const globalStyleConfig = mapData.global_style_config || mapData.globalStyleConfig;
  if (globalStyleConfig !== undefined) data.globalStyleConfig = globalStyleConfig;
  const referenceLinks = mapData.reference_links || mapData.referenceLinks;
  if (referenceLinks !== undefined) data.referenceLinks = referenceLinks;

  if (mapData.thumbnailId !== undefined) {
    data.thumbnail = mapData.thumbnailId
      ? { connect: { id: mapData.thumbnailId } }
      : { disconnect: true };
  }
  if (mapData.categoryId !== undefined) {
    data.category = mapData.categoryId
      ? { connect: { id: mapData.categoryId } }
      : { disconnect: true };
  }
  if (mapData.tagIds) {
    data.tags = { set: mapData.tagIds.map((id) => ({ id })) };
  }
  if (mapData.regionIds) {
    data.regions = { set: mapData.regionIds.map((id) => ({ id })) };
  }

  const updatedMap = await prisma.map.update({
    where: { id },
    data: data as Prisma.MapUpdateInput,
  });


  // Delete existing layer associations and recreate
  await prisma.mapLayerAssociation.deleteMany({
    where: { mapId: id },
  });

  // Create new MapLayer records
  if (layers.length > 0) {
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      
      // Determine source type and data storage
      const sourceType = layer.sourceType || (layer.url ? 'url' : 'database');
      const hasGeoJsonData = layer.data && Object.keys(layer.data).length > 0;
      
      // Convert layer type to Prisma enum format
      const prismaLayerType = layer.type === 'polygon' ? 'POLYGONS' : 
                              layer.type === 'point' ? 'POINTS' : 
                              layer.type.toUpperCase();
      

      await prisma.mapLayerAssociation.create({
        data: {
          mapId: id,
          layerId: (layer.layerId || layer.id)!,
          zIndex: i,
          isVisible: layer.visible !== false,
          isVisibleByDefault: layer.visible !== false,
          styleOverride: {
            style: layer.style,
            labels: layer.labels,
            popup: layer.popup,
            filter: layer.filter,
          } as Prisma.InputJsonValue,
          interactionConfig: (layer.interactionConfig || {}) as Prisma.InputJsonValue,
        },
      });
    }
  }

  revalidatePath("/admin/maps");
  revalidatePath("/admin/maps2");
  revalidatePath(`/admin/maps/${id}`);
  revalidatePath(`/admin/maps2/${id}`);
  revalidatePath("/maps");
  return updatedMap;
}

export async function deleteMap(id: string) {
  await prisma.map.delete({
    where: { id },
  });

  revalidatePath("/admin/maps");
}

// Layer Associations for Maps
export async function getLayers(mapId: string) {
  const associations = await prisma.mapLayerAssociation.findMany({
    where: { mapId },
    include: {
      layer: true,
    },
    orderBy: {
      zIndex: 'asc',
    },
  });

  return associations;
}

export async function createLayerAssociation(layerData: LayerAssociationInput) {
  const data: Record<string, unknown> = {
    mapId: layerData.map_id || layerData.mapId,
    layerId: layerData.layer_id || layerData.layerId,
    zIndex: layerData.z_index || layerData.zIndex || 0,
    isVisible: layerData.is_visible ?? layerData.isVisible ?? true,
    isVisibleByDefault: layerData.is_visible_by_default ?? layerData.isVisibleByDefault ?? true,
    styleOverride: layerData.style_override || layerData.styleOverride,
    interactionConfig: layerData.interaction_config || layerData.interactionConfig || {},
  };

  const createdAssociation = await prisma.mapLayerAssociation.create({
    data: data as Prisma.MapLayerAssociationUncheckedCreateInput,
    include: {
      layer: true,
    },
  });

  if (createdAssociation.mapId) {
    revalidatePath(`/admin/maps/${createdAssociation.mapId}`);
  }
  return createdAssociation;
}

export async function updateLayerAssociation(id: string, layerData: LayerAssociationInput) {
  const data: Record<string, unknown> = {
    layerId: layerData.layer_id || layerData.layerId,
    zIndex: layerData.z_index || layerData.zIndex,
    isVisible: layerData.is_visible ?? layerData.isVisible,
    isVisibleByDefault: layerData.is_visible_by_default ?? layerData.isVisibleByDefault,
    styleOverride: layerData.style_override || layerData.styleOverride,
    interactionConfig: layerData.interaction_config || layerData.interactionConfig,
  };

  const updatedAssociation = await prisma.mapLayerAssociation.update({
    where: { id },
    data: data as Prisma.MapLayerAssociationUncheckedUpdateInput,
    include: {
      layer: true,
    },
  });

  if (updatedAssociation.mapId) {
    revalidatePath(`/admin/maps/${updatedAssociation.mapId}`);
  }
  return updatedAssociation;
}

export async function deleteLayerAssociation(id: string, mapId: string) {
  await prisma.mapLayerAssociation.delete({
    where: { id },
  });

  revalidatePath(`/admin/maps/${mapId}`);
}

export async function reorderLayers(layers: Array<{ id: string; z_index: number }>) {
  // Update all layer associations with new z_index
  const promises = layers.map(({ id, z_index }) =>
    prisma.mapLayerAssociation.update({
      where: { id },
      data: { zIndex: z_index },
    })
  );

  await Promise.all(promises);

  // Revalidate the map page
  if (layers.length > 0) {
    const association = await prisma.mapLayerAssociation.findUnique({
      where: { id: layers[0].id },
      select: { mapId: true },
    });
    
    if (association?.mapId) {
      revalidatePath(`/admin/maps/${association.mapId}`);
    }
  }
}

// ===================================================
// API Endpoint Server Actions
// ===================================================

// Types for API options
export interface ListMapsOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  regionId?: string;
  regionSlug?: string;
  tagId?: string;
  tagSlug?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  period?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title" | "year";
  order?: "asc" | "desc";
  lang?: string;
}

export interface GetMapOptions {
  lang?: string;
  includeLayers?: boolean;
  includeResources?: boolean;
}

// Helper function to get localized field
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

// List maps with filtering and pagination (for API)
export async function listMapsAPI(options: ListMapsOptions = {}) {
  const {
    status,
    categoryId,
    categorySlug,
    regionId,
    regionSlug,
    tagId,
    tagSlug,
    year,
    yearMin,
    yearMax,
    period,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    lang,
  } = options;

  // Build where clause dynamically
  const where: Prisma.MapWhereInput = {
    ...(status && { status: status as ContentStatus }),
    ...(year && { year }),
    ...(yearMin && { yearMin: { gte: yearMin } }),
    ...(yearMax && { yearMax: { lte: yearMax } }),
    ...(period && { period }),
    // Note: Map model uses titleI18n/descriptionI18n (JSON), not simple text fields
    // Search functionality would need to be implemented differently (e.g., using Prisma's jsonb operators or full-text search)
    ...(categoryId && { categoryId }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(regionId && { regions: { some: { id: regionId } } }),
    ...(regionSlug && { regions: { some: { slug: regionSlug } } }),
    ...(tagId && { tags: { some: { id: tagId } } }),
    ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
  };

  // Pagination
  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);

  // Order by
  const orderBy: Prisma.MapOrderByWithRelationInput = {
    [sort]: order,
  };

  try {
    const [maps, total] = await Promise.all([
      prisma.map.findMany({
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
          layers: {
            select: {
              layer: {
                select: {
                  type: true,
                },
              },
            },
          },
          _count: {
            select: {
              layers: true,
              resources: true,
            },
          },
        },
      }),
      prisma.map.count({ where }),
    ]);

    // Transform data with i18n support
    const transformedMaps = maps.map((map) => ({
      id: map.id,
      slug: map.slug,
      title: getLocalizedField(map.title, map.titleI18n, lang) || map.title,
      description: getLocalizedField(map.description, map.descriptionI18n, lang) || map.description,
      summary: getLocalizedField(map.summary, map.summaryI18n, lang) || map.summary,
      status: map.status,
      version: map.version,
      year: map.year,
      period: map.period,
      yearMin: map.yearMin,
      yearMax: map.yearMax,
      category: map.category
        ? {
            id: map.category.id,
            slug: map.category.slug,
            title: getLocalizedField(map.category.title, map.category.titleI18n, lang) || map.category.title,
          }
        : null,
      thumbnail: map.thumbnail
        ? {
            url: map.thumbnail.url,
            altText: getLocalizedField(null, map.thumbnail.altTextI18n, lang),
          }
        : null,
      layerCount: map._count.layers,
      layerTypes: [...new Set(map.layers.map((l: any) => l.layer.type as string))],
      resourceCount: map._count.resources,
      createdAt: map.createdAt.toISOString(),
      updatedAt: map.updatedAt.toISOString(),
    }));

    return {
      maps: transformedMaps,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    console.error("Error listing maps:", error);
    throw new Error("Failed to list maps");
  }
}

// Get single map by slug (for API)
export async function getMapBySlug(
  slug: string,
  options: GetMapOptions = {}
) {
  const { lang, includeLayers = true, includeResources = false } = options;

  try {
    const map = await prisma.map.findUnique({
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
        tags: {
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
          },
        }),
      },
    });

    if (!map) {
      return null;
    }

    // Transform data with i18n support
    return {
      id: map.id,
      slug: map.slug,
      title: getLocalizedField(map.title, map.titleI18n, lang) || map.title,
      description: getLocalizedField(map.description, map.descriptionI18n, lang) || map.description,
      summary: getLocalizedField(map.summary, map.summaryI18n, lang) || map.summary,
      status: map.status,
      version: map.version,
      year: map.year,
      period: map.period,
      yearMin: map.yearMin,
      yearMax: map.yearMax,
      config: map.config,
      globalStyleConfig: map.globalStyleConfig,
      codebookText: getLocalizedField(map.codebookText, map.codebookTextI18n, lang) || map.codebookText,
      referenceLinks: map.referenceLinks,
      category: map.category
        ? {
            id: map.category.id,
            slug: map.category.slug,
            title: getLocalizedField(map.category.title, map.category.titleI18n, lang) || map.category.title,
          }
        : null,
      regions: map.regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
      })),
      tags: map.tags.map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        name: getLocalizedField(tag.name, tag.nameI18n, lang) || tag.name,
      })),
      thumbnail: map.thumbnail
        ? {
            url: map.thumbnail.url,
            altText: getLocalizedField(null, map.thumbnail.altTextI18n, lang),
          }
        : null,
      ...(includeLayers && {
        layers: ((map as Record<string, unknown>).layers as MapLayerAssociationWithLayer[]).map((assoc) => ({
          id: assoc.layer.id,
          slug: assoc.layer.slug,
          layerId: assoc.layerId,
          name: getLocalizedField(assoc.layer.name, assoc.layer.nameI18n, lang) || assoc.layer.name,
          description: getLocalizedField(assoc.layer.description, assoc.layer.descriptionI18n, lang) || assoc.layer.description,
          type: assoc.layer.type,
          sourceType: assoc.layer.sourceType,
          sourceUrl: assoc.layer.sourceUrl,
          geoJsonData: assoc.layer.geoJsonData,
          downloadUrl: assoc.layer.downloadUrl,
          filename: assoc.layer.filename,
          styleConfig: {
            ...((assoc.layer.styleConfig as Record<string, unknown>) || {}),
            ...((assoc.styleOverride as Record<string, unknown>) || {}),
          },
          interactionConfig: assoc.interactionConfig,
          isVisible: assoc.isVisible,
          isVisibleByDefault: assoc.isVisibleByDefault,
          zIndex: assoc.zIndex,
          createdAt: assoc.layer.createdAt.toISOString(),
          updatedAt: assoc.layer.updatedAt.toISOString(),
        })),
      }),
      ...(includeResources && {
        resources: ((map as Record<string, unknown>).resources as MapResourceItem[]).map((resource) => ({
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
      createdAt: map.createdAt.toISOString(),
      updatedAt: map.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getting map:", error);
    throw new Error("Failed to get map");
  }
}


/**
 * ========================================
 * NEW LAYER ASSOCIATION FUNCTIONS
 * For working with standalone Layers
 * ========================================
 */

// (Functions will be added via separate file)

export async function getMapDeployments(slug: string) {
  return prisma.mapDeployment.findMany({
    where: { map: { slug } },
    orderBy: { deployedAt: 'desc' },
    take: 20,
    select: { id: true, version: true, changeLog: true, gitSha: true, deployedAt: true },
  });
}
