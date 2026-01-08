"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";

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
    },
  });

  if (!map) throw new Error("Map not found");
  return map;
}

export async function createMap(mapData: any) {
  // console.log("=== CREATE MAP START ===");
  // console.log("Received mapData:", JSON.stringify(mapData, null, 2));

  // Extract layers from config
  const layers = mapData.config?.layers || [];
  // console.log(`Extracted ${layers.length} layers from config`);

  // Create map-level config WITHOUT layers
  const mapConfig = {
    tile: mapData.config?.tile,
    zoom: mapData.config?.zoom,
    center: mapData.config?.center,
    customCSS: mapData.config?.customCSS,
  };
  // console.log("Map-level config:", JSON.stringify(mapConfig, null, 2));

  const data: any = {
    slug: mapData.slug,
    status: mapData.status || 'draft',
    titleI18n: mapData.title_i18n || mapData.titleI18n,
    descriptionI18n: mapData.description_i18n || mapData.descriptionI18n,
    areaI18n: mapData.area_i18n || mapData.areaI18n,
    year: mapData.year,
    version: mapData.version,
    thumbnailUrl: mapData.thumbnail_url || mapData.thumbnailUrl,
    downloadUrl: mapData.download_url || mapData.downloadUrl,
    downloadSizeBytes: mapData.download_size_bytes || mapData.downloadSizeBytes,
    config: mapConfig, // Only map-level config, no layers
    globalStyleConfig: mapData.global_style_config || mapData.globalStyleConfig,
    referenceLinks: mapData.reference_links || mapData.referenceLinks,
  };

  // console.log("Creating map with data:", JSON.stringify(data, null, 2));

  const createdMap = await prisma.map.create({
    data,
  });

  // console.log("Map created with ID:", createdMap.id);

  // Create MapLayer records for each layer
  if (layers.length > 0) {
    // console.log(`Creating ${layers.length} MapLayer records...`);
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      // console.log(`Creating layer ${i + 1}/${layers.length}:`, layer.name);
      // console.log('Full layer object:', JSON.stringify(layer, null, 2));
      
      // Determine source type and data storage
      const sourceType = layer.sourceType || (layer.url ? 'url' : 'database');
      const hasGeoJsonData = layer.data && Object.keys(layer.data).length > 0;
      
      // Convert layer type to Prisma enum format
      const prismaLayerType = layer.type === 'polygon' ? 'POLYGONS' : 
                              layer.type === 'point' ? 'POINTS' : 
                              layer.type.toUpperCase();
      
      // console.log(`Layer "${layer.name}" - sourceType: ${sourceType}, hasData: ${hasGeoJsonData}, hasUrl: ${!!layer.url}, type: ${prismaLayerType}`);

      await prisma.mapLayerAssociation.create({
        data: {
          mapId: createdMap.id,
          layerId: layer.layerId || layer.id, // Associate with existing Layer
          zIndex: i,
          isVisible: layer.visible !== false,
          isVisibleByDefault: layer.visible !== false,
          styleOverride: {
            style: layer.style,
            labels: layer.labels,
            popup: layer.popup,
            filter: layer.filter,
          },
          interactionConfig: layer.interactionConfig || {},
        },
      });
      
      if (sourceType === 'database') {
        // console.log(`Layer "${layer.name}" saved to database with ${hasGeoJsonData ? 'GeoJSON data' : 'no data'}`);
      } else {
        // console.log(`Layer "${layer.name}" saved with sourceUrl: "${layer.url || 'none'}"`);
      }
    }
    // console.log("All layers created successfully");
  }

  revalidatePath("/admin/maps");
  // console.log("=== CREATE MAP END ===");
  return createdMap;
}

export async function updateMap(id: string, mapData: any) {
  // console.log("=== UPDATE MAP START ===");
  // console.log("Map ID:", id);
  // console.log("Received mapData:", JSON.stringify(mapData, null, 2));

  // Extract layers from config
  const layers = mapData.config?.layers || [];
  // console.log(`Extracted ${layers.length} layers from config`);

  // Create map-level config WITHOUT layers
  const mapConfig = {
    tile: mapData.config?.tile,
    zoom: mapData.config?.zoom,
    center: mapData.config?.center,
    customCSS: mapData.config?.customCSS,
  };

  const data: any = {
    slug: mapData.slug,
    status: mapData.status || 'draft',
    titleI18n: mapData.title_i18n || mapData.titleI18n,
    descriptionI18n: mapData.description_i18n || mapData.descriptionI18n,
    areaI18n: mapData.area_i18n || mapData.areaI18n,
    year: mapData.year,
    version: mapData.version,
    thumbnailUrl: mapData.thumbnail_url || mapData.thumbnailUrl,
    downloadUrl: mapData.download_url || mapData.downloadUrl,
    downloadSizeBytes: mapData.download_size_bytes || mapData.downloadSizeBytes,
    config: mapConfig, // Only map-level config, no layers
    globalStyleConfig: mapData.global_style_config || mapData.globalStyleConfig,
    referenceLinks: mapData.reference_links || mapData.referenceLinks,
  };

  // console.log("Updating map with data:", JSON.stringify(data, null, 2));

  const updatedMap = await prisma.map.update({
    where: { id },
    data,
  });

  // console.log("Map updated successfully");

  // Delete existing layer associations and recreate
  // console.log("Deleting existing layer associations...");
  await prisma.mapLayerAssociation.deleteMany({
    where: { mapId: id },
  });

  // Create new MapLayer records
  if (layers.length > 0) {
    // console.log(`Creating ${layers.length} MapLayer records...`);
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      // console.log(`Creating layer ${i + 1}/${layers.length}:`, layer.name);
      
      // Determine source type and data storage
      const sourceType = layer.sourceType || (layer.url ? 'url' : 'database');
      const hasGeoJsonData = layer.data && Object.keys(layer.data).length > 0;
      
      // Convert layer type to Prisma enum format
      const prismaLayerType = layer.type === 'polygon' ? 'POLYGONS' : 
                              layer.type === 'point' ? 'POINTS' : 
                              layer.type.toUpperCase();
      
      // console.log(`Layer "${layer.name}" - sourceType: ${sourceType}, hasData: ${hasGeoJsonData}, hasUrl: ${!!layer.url}, type: ${prismaLayerType}`);

      await prisma.mapLayerAssociation.create({
        data: {
          mapId: id,
          layerId: layer.layerId || layer.id, // Associate with existing Layer
          zIndex: i,
          isVisible: layer.visible !== false,
          isVisibleByDefault: layer.visible !== false,
          styleOverride: {
            style: layer.style,
            labels: layer.labels,
            popup: layer.popup,
            filter: layer.filter,
          },
          interactionConfig: layer.interactionConfig || {},
        },
      });
      
      if (sourceType === 'database') {
        // console.log(`Layer "${layer.name}\" saved to database with ${hasGeoJsonData ? 'GeoJSON data' : 'no data'}`);
      } else {
        // console.log(`Layer "${layer.name}" saved with sourceUrl: "${layer.url || 'none'}"`);
      }
    }
    // console.log("All layers created successfully");
  }

  revalidatePath("/admin/maps");
  revalidatePath(`/admin/maps/${id}`);
  // console.log("=== UPDATE MAP END ===");
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

export async function createLayerAssociation(layerData: any) {
  const data: any = {
    mapId: layerData.map_id || layerData.mapId,
    layerId: layerData.layer_id || layerData.layerId,
    zIndex: layerData.z_index || layerData.zIndex || 0,
    isVisible: layerData.is_visible ?? layerData.isVisible ?? true,
    isVisibleByDefault: layerData.is_visible_by_default ?? layerData.isVisibleByDefault ?? true,
    styleOverride: layerData.style_override || layerData.styleOverride,
    interactionConfig: layerData.interaction_config || layerData.interactionConfig || {},
  };

  const createdAssociation = await prisma.mapLayerAssociation.create({
    data,
    include: {
      layer: true,
    },
  });

  if (createdAssociation.mapId) {
    revalidatePath(`/admin/maps/${createdAssociation.mapId}`);
  }
  return createdAssociation;
}

export async function updateLayerAssociation(id: string, layerData: any) {
  const data: any = {
    layerId: layerData.layer_id || layerData.layerId,
    zIndex: layerData.z_index || layerData.zIndex,
    isVisible: layerData.is_visible ?? layerData.isVisible,
    isVisibleByDefault: layerData.is_visible_by_default ?? layerData.isVisibleByDefault,
    styleOverride: layerData.style_override || layerData.styleOverride,
    interactionConfig: layerData.interaction_config || layerData.interactionConfig,
  };

  const updatedAssociation = await prisma.mapLayerAssociation.update({
    where: { id },
    data,
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
    ...(status && { status: status as any }),
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
        where: where as any,
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
              layers: true,
              resources: true,
            },
          },
        },
      }),
      prisma.map.count({ where: where as any }),
    ]);

    // Transform data with i18n support
    const transformedMaps = maps.map((map) => ({
      id: map.id,
      slug: map.slug,
      title: getLocalizedField(map.title, map.titleI18n, lang) || map.title,
      description: getLocalizedField(map.description, map.descriptionI18n, lang) || map.description,
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
      status: map.status,
      version: map.version,
      year: map.year,
      period: map.period,
      yearMin: map.yearMin,
      yearMax: map.yearMax,
      config: map.config,
      globalStyleConfig: map.globalStyleConfig,
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
        layers: (map as any).layers.map((layer: any) => ({
          id: layer.id,
          name: getLocalizedField(layer.name, layer.nameI18n, lang) || layer.name,
          description: getLocalizedField(layer.description, layer.descriptionI18n, lang) || layer.description,
          type: layer.type,
          sourceType: layer.sourceType,
          sourceUrl: layer.sourceUrl,
          geoJsonData: layer.geoJsonData,
          downloadUrl: layer.downloadUrl,
          filename: layer.filename,
          styleConfig: layer.styleConfig,
          interactionConfig: layer.interactionConfig,
          isVisible: layer.isVisible,
          isVisibleByDefault: layer.isVisibleByDefault,
          zIndex: layer.zIndex,
          createdAt: layer.createdAt.toISOString(),
          updatedAt: layer.updatedAt.toISOString(),
        })),
      }),
      ...(includeResources && {
        resources: (map as any).resources.map((resource: any) => ({
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
