/**
 * Server Actions for Map-Layer Association operations
 * Working with the new standalone Layer architecture
 */

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getLocalizedField } from "./utils";

/**
 * Add a Layer to a Map
 */
export async function addLayerToMap(
  mapId: string,
  layerId: string,
  config?: {
    zIndex?: number;
    isVisible?: boolean;
    isVisibleByDefault?: boolean;
    styleOverride?: any;
    interactionConfig?: any;
  }
) {
  try {
    // Check if association already exists
    const existing = await prisma.mapLayerAssociation.findFirst({
      where: { mapId, layerId },
    });

    if (existing) {
      throw new Error("Layer is already added to this map");
    }

    const association = await prisma.mapLayerAssociation.create({
      data: {
        mapId,
        layerId,
        zIndex: config?.zIndex ?? 0,
        isVisible: config?.isVisible ?? true,
        isVisibleByDefault: config?.isVisibleByDefault ?? true,
        styleOverride: config?.styleOverride,
        interactionConfig: config?.interactionConfig ?? {},
      },
    });

    revalidatePath(`/admin/maps/${mapId}`);
    return association;
  } catch (error) {
    console.error("Error adding layer to map:", error);
    throw error;
  }
}

/**
 * Remove a Layer from a Map
 */
export async function removeLayerFromMap(mapId: string, layerId: string) {
  try {
    await prisma.mapLayerAssociation.deleteMany({
      where: { mapId, layerId },
    });

    revalidatePath(`/admin/maps/${mapId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing layer from map:", error);
    throw error;
  }
}

/**
 * Update Layer configuration in a Map
 */
export async function updateLayerInMap(
  mapId: string,
  layerId: string,
  config: {
    zIndex?: number;
    isVisible?: boolean;
    isVisibleByDefault?: boolean;
    styleOverride?: any;
    interactionConfig?: any;
  }
) {
  try {
    const association = await prisma.mapLayerAssociation.findFirst({
      where: { mapId, layerId },
    });

    if (!association) {
      throw new Error("Layer association not found");
    }

    const updated = await prisma.mapLayerAssociation.update({
      where: { id: association.id },
      data: {
        ...(config.zIndex !== undefined && { zIndex: config.zIndex }),
        ...(config.isVisible !== undefined && { isVisible: config.isVisible }),
        ...(config.isVisibleByDefault !== undefined && {
          isVisibleByDefault: config.isVisibleByDefault,
        }),
        ...(config.styleOverride !== undefined && { styleOverride: config.styleOverride }),
        ...(config.interactionConfig !== undefined && {
          interactionConfig: config.interactionConfig,
        }),
      },
    });

    revalidatePath(`/admin/maps/${mapId}`);
    return updated;
  } catch (error) {
    console.error("Error updating layer in map:", error);
    throw error;
  }
}

/**
 * Create a new Map with existing Layers
 */
export async function createMapWithLayers(
  mapData: any,
  layerAssociations: Array<{
    layerId: string;
    zIndex?: number;
    isVisible?: boolean;
    isVisibleByDefault?: boolean;
    styleOverride?: any;
    interactionConfig?: any;
  }>
) {
  try {
    // console.log("=== CREATE MAP WITH LAYERS START ===");
    // console.log("Map data:", mapData.slug);
    // console.log("Layer associations:", layerAssociations.length);

    // Create map-level config WITHOUT layers
    const mapConfig = {
      tile: mapData.config?.tile,
      zoom: mapData.config?.zoom,
      center: mapData.config?.center,
      customCSS: mapData.config?.customCSS,
    };

    const data: any = {
      slug: mapData.slug,
      status: mapData.status || "draft",
      titleI18n: mapData.title_i18n || mapData.titleI18n,
      descriptionI18n: mapData.description_i18n || mapData.descriptionI18n,
      year: mapData.year,
      yearMin: mapData.yearMin,
      yearMax: mapData.yearMax,
      period: mapData.period,
      version: mapData.version,
      categoryId: mapData.categoryId,
      config: mapConfig,
      globalStyleConfig: mapData.global_style_config || mapData.globalStyleConfig,
      referenceLinks: mapData.reference_links || mapData.referenceLinks,
    };

    const createdMap = await prisma.map.create({
      data,
    });

    // console.log("Map created with ID:", createdMap.id);

    // Create layer associations
    if (layerAssociations.length > 0) {
      // console.log(`Creating ${layerAssociations.length} layer associations...`);

      for (const assoc of layerAssociations) {
        await prisma.mapLayerAssociation.create({
          data: {
            mapId: createdMap.id,
            layerId: assoc.layerId,
            zIndex: assoc.zIndex ?? 0,
            isVisible: assoc.isVisible ?? true,
            isVisibleByDefault: assoc.isVisibleByDefault ?? true,
            styleOverride: assoc.styleOverride,
            interactionConfig: assoc.interactionConfig ?? {},
          },
        });
      }

      // console.log("All layer associations created");
    }

    // console.log("=== CREATE MAP WITH LAYERS END ===");

    revalidatePath("/admin/maps");
    return createdMap;
  } catch (error) {
    console.error("Error creating map with layers:", error);
    throw error;
  }
}

/**
 * Update Map's layer associations
 */
export async function updateMapLayers(
  mapId: string,
  layerAssociations: Array<{
    layerId: string;
    zIndex?: number;
    isVisible?: boolean;
    isVisibleByDefault?: boolean;
    styleOverride?: any;
    interactionConfig?: any;
  }>
) {
  try {
    // console.log("=== UPDATE MAP LAYERS START ===");
    // console.log("Map ID:", mapId);
    // console.log("New layer associations:", layerAssociations.length);

    // Delete all existing associations
    await prisma.mapLayerAssociation.deleteMany({
      where: { mapId },
    });

    // console.log("Deleted existing associations");

    // Create new associations
    for (const assoc of layerAssociations) {
      await prisma.mapLayerAssociation.create({
        data: {
          mapId,
          layerId: assoc.layerId,
          zIndex: assoc.zIndex ?? 0,
          isVisible: assoc.isVisible ?? true,
          isVisibleByDefault: assoc.isVisibleByDefault ?? true,
          styleOverride: assoc.styleOverride,
          interactionConfig: assoc.interactionConfig ?? {},
        },
      });
    }

    // console.log("Created new associations");
    // console.log("=== UPDATE MAP LAYERS END ===");

    revalidatePath(`/admin/maps/${mapId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating map layers:", error);
    throw error;
  }
}

/**
 * Get Map with Layer associations (new architecture)
 */
export async function getMapWithLayers(id: string, lang?: string) {
  try {
    const map = await prisma.map.findUnique({
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
        layers: {
          include: {
            layer: {
              include: {
                category: true,
                tags: true,
                regions: true,
              },
            },
          },
          orderBy: {
            zIndex: "asc",
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
      },
    });

    if (!map) {
      return null;
    }

    // Transform with i18n
    return {
      ...map,
      title: getLocalizedField(map.title, map.titleI18n, lang) || map.title,
      description: getLocalizedField(map.description, map.descriptionI18n, lang) || map.description,
      category: map.category
        ? {
            ...map.category,
            title: getLocalizedField(map.category.title, map.category.titleI18n, lang) || map.category.title,
          }
        : null,
      layers: map.layers.map((assoc: any) => ({
        associationId: assoc.id,
        zIndex: assoc.zIndex,
        isVisible: assoc.isVisible,
        isVisibleByDefault: assoc.isVisibleByDefault,
        styleOverride: assoc.styleOverride,
        interactionConfig: assoc.interactionConfig,
        layer: {
          ...assoc.layer,
          name: getLocalizedField(assoc.layer.name, assoc.layer.nameI18n, lang) || assoc.layer.name,
          description:
            getLocalizedField(assoc.layer.description, assoc.layer.descriptionI18n, lang) || assoc.layer.description,
        },
      })),
      tags: map.tags.map((tag: any) => ({
        ...tag,
        name: getLocalizedField(tag.name, tag.nameI18n, lang) || tag.name,
      })),
      regions: map.regions.map((region: any) => ({
        ...region,
        name: getLocalizedField(region.name, region.nameI18n, lang) || region.name,
      })),
    };
  } catch (error) {
    console.error("Error getting map with layers:", error);
    throw error;
  }
}
