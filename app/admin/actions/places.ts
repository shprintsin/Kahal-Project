"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { Prisma } from "@prisma/client";

// Helper to generate slug for places (simplified version to satisfy build)
export async function generatePlaceSlug(data: { geoname: string; countryCode: string; admin1?: string }) {
  // Logic to generate a code like POL_MSV_WRSZ
  // This is a placeholder implementation
  const country = (data.countryCode || "XXX").substring(0, 3).toUpperCase();
  
  // Simple consonant extraction or substring
  const getCode = (str: string, len: number) => {
     return str.replace(/[aeiou]/gi, '').substring(0, len).toUpperCase().padEnd(len, 'X');
  };

  const admin = data.admin1 ? getCode(data.admin1, 3) : "XXX";
  const city = getCode(data.geoname, 4);
  
  return `${country}_${admin}_${city}`;
}

// ===================================================

// Standard CRUD Actions (Restored)
// ===================================================

export async function getPlaces() {
  const places = await prisma.place.findMany({
    orderBy: {
      geoname: 'asc',
    },
    include: {
      _count: {
        select: {
          artifacts: true,
        }
      }
    }
  });

  return places;
}

export async function getPlace(id: string) {
  const place = await prisma.place.findUnique({
    where: { id },
  });

  if (!place) throw new Error("Place not found");
  return place;
}

export async function createPlace(placeData: any) {
  const data: any = {
    geoname: placeData.geoname,
    geocode: placeData.geocode,
    lat: placeData.lat ? parseFloat(placeData.lat) : null,
    lon: placeData.lon ? parseFloat(placeData.lon) : null,
    countryCode: placeData.countryCode,
    admin1: placeData.admin1,
    admin2: placeData.admin2,
  };

  const createdPlace = await prisma.place.create({
    data,
  });

  revalidatePath("/admin/places");
  return createdPlace;
}

export async function updatePlace(id: string, placeData: any) {
  const data: any = {
    geoname: placeData.geoname,
    geocode: placeData.geocode,
    lat: placeData.lat ? parseFloat(placeData.lat) : null,
    lon: placeData.lon ? parseFloat(placeData.lon) : null,
    countryCode: placeData.countryCode,
    admin1: placeData.admin1,
    admin2: placeData.admin2,
  };

  const updatedPlace = await prisma.place.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/places");
  return updatedPlace;
}

export async function deletePlace(id: string) {
  await prisma.place.delete({
    where: { id },
  });

  revalidatePath("/admin/places");
}


// ===================================================
// API Endpoint Server Actions
// ===================================================

export interface ListPlacesOptions {
  search?: string;
  countryCode?: string;
  admin1?: string;
  bounds?: string; // minLat,minLon,maxLat,maxLon
  hasCoordinates?: boolean;
  page?: number;
  limit?: number;
}

export interface GetPlaceOptions {
  includeAdministrative?: boolean;
  includeArtifacts?: boolean;
}

export interface SearchOptions {
  limit?: number;
  countryCode?: string;
}

// List places with filtering and pagination
export async function listPlacesAPI(options: ListPlacesOptions = {}) {
  const {
    search,
    countryCode,
    admin1,
    bounds,
    hasCoordinates,
    page = 1,
    limit = 50,
  } = options;

  try {
    const where: Prisma.PlaceWhereInput = {
      ...(search && {
        geoname: { contains: search, mode: "insensitive" },
      }),
      ...(countryCode && { countryCode }),
      ...(admin1 && { admin1 }),
      ...(hasCoordinates && {
        lat: { not: null },
        lon: { not: null },
      }),
    };

    // Handle bounds filter if provided
    if (bounds) {
      const [minLat, minLon, maxLat, maxLon] = bounds.split(",").map(Number);
      if (
        !isNaN(minLat) &&
        !isNaN(minLon) &&
        !isNaN(maxLat) &&
        !isNaN(maxLon)
      ) {
        where.lat = { gte: minLat, lte: maxLat };
        where.lon = { gte: minLon, lte: maxLon };
      }
    }

    // Pagination
    const skip = (page - 1) * Math.min(limit, 200);
    const take = Math.min(limit, 200);

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip,
        take,
        orderBy: { geoname: "asc" },
        include: {
          _count: {
            select: {
              artifacts: true,
              administrativePlaces: true,
            },
          },
        },
      }),
      prisma.place.count({ where }),
    ]);

    const transformedPlaces = places.map((place) => ({
      id: place.id,
      geoname: place.geoname,
      geocode: place.geocode,
      lat: place.lat,
      lon: place.lon,
      countryCode: place.countryCode,
      admin1: place.admin1,
      admin2: place.admin2,
      artifactCount: place._count.artifacts,
      administrativePlaceCount: place._count.administrativePlaces,
    }));

    return {
      places: transformedPlaces,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    console.error("Error listing places:", error);
    throw new Error("Failed to list places");
  }
}

// Get single place by geocode
export async function getPlaceByGeocode(geocode: string, options: GetPlaceOptions = {}) {
  const { includeAdministrative = false, includeArtifacts = false } = options;

  try {
    const place = await prisma.place.findUnique({
      where: { geocode },
      include: {
        ...(includeAdministrative && {
          administrativePlaces: {
            orderBy: { year: "desc" },
          },
        }),
        ...(includeArtifacts && {
          artifacts: {
            take: 20,
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        }),
      },
    });

    if (!place) {
      return null;
    }

    return {
      id: place.id,
      geoname: place.geoname,
      geocode: place.geocode,
      lat: place.lat,
      lon: place.lon,
      countryCode: place.countryCode,
      admin1: place.admin1,
      admin2: place.admin2,
      administrativePlaces: (place as any).administrativePlaces,
      artifacts: (place as any).artifacts,
    };
  } catch (error) {
    console.error("Error getting place:", error);
    throw new Error("Failed to get place");
  }
}

// Search places by name (autocomplete)
export async function searchPlaces(query: string, options: SearchOptions = {}) {
  const { limit = 10, countryCode } = options;

  if (!query || query.length < 2) {
    return { results: [], total: 0 };
  }

  try {
    const where: Prisma.PlaceWhereInput = {
      geoname: { contains: query, mode: "insensitive" },
      ...(countryCode && { countryCode }),
    };

    const places = await prisma.place.findMany({
      where,
      take: Math.min(limit, 50),
      select: {
        id: true,
        geoname: true,
        geocode: true,
        lat: true,
        lon: true,
        countryCode: true,
        admin1: true,
      },
      orderBy: { geoname: "asc" },
    });

    const results = places.map((place) => ({
      ...place,
      displayName: [place.geoname, place.admin1, place.countryCode]
        .filter(Boolean)
        .join(", "),
    }));

    return {
      results,
      total: results.length,
    };
  } catch (error) {
    console.error("Error searching places:", error);
    throw new Error("Failed to search places");
  }
}
