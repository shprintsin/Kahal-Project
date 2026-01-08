'use server';

import prisma from '@/lib/prisma';
import { CollectionWithSeries, SeriesWithVolumes, VolumeWithPages } from '@/types/collections';

export async function getAllCollectionsWithSeries(): Promise<CollectionWithSeries[]> {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        series: {
          include: {
            volumes: true,
          },
          orderBy: {
            indexNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // or name
      },
    });
    
    // Parse JSON fields if necessary, or rely on type compatibility
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getAllSeries(): Promise<SeriesWithVolumes[]> {
  try {
    const series = await prisma.series.findMany({
      include: {
        volumes: {
          orderBy: {
            indexNumber: 'asc',
          }
        },
        collection: true,
      },
      orderBy: {
        indexNumber: 'asc',
      },
    });
    return JSON.parse(JSON.stringify(series));
  } catch (error) {
    console.error('Error fetching all series:', error);
    return [];
  }
}

export async function getCollectionWithSeries(slug: string): Promise<CollectionWithSeries | null> {
    // Note: Collection doesn't have a slug field in schema, primarily used ID or we need to find by something else.
    // Wait, Schema says Collection ID is UUID. It does NOT have a slug!
    // But `getCollection(slug)` in `lib/api.ts` was used.
    // Let's check `lib/api.ts` implementation later. Use ID for now if possible?
    // User URL structure: /collections/[collectionId]. So it IS ID.
    
    try {
      const collection = await prisma.collection.findUnique({
        where: { id: slug }, // Assuming slug is actually ID based on route [collectionId]
        include: {
          series: {
             include: {
                volumes: true
             },
             orderBy: {
                indexNumber: 'asc'
             }
          }
        }
      });
      return JSON.parse(JSON.stringify(collection));
    } catch (error) {
       console.error(`Error fetching collection ${slug}:`, error);
       return null;
    }
}

export async function getSeriesWithVolumes(collectionId: string, seriesSlug: string): Promise<SeriesWithVolumes | null> {
  try {
    const series = await prisma.series.findFirst({
      where: {
        slug: seriesSlug,
        collectionId: collectionId
      },
      include: {
        volumes: {
           orderBy: { indexNumber: 'asc' }
        },
        collection: true
      }
    });
    return JSON.parse(JSON.stringify(series));
  } catch (error) {
     console.error(`Error fetching series ${seriesSlug}:`, error);
     return null;
  }
}

export async function getVolumeWithPages(collectionId: string, seriesSlug: string, volumeSlug: string): Promise<VolumeWithPages | null> {
  try {
     const volume = await prisma.volume.findFirst({
       where: {
         slug: volumeSlug,
         series: {
            slug: seriesSlug,
            collectionId: collectionId
         }
       },
       include: {
         pages: {
           orderBy: { sequenceIndex: 'asc' },
           include: {
             images: true,
             texts: true
           }
         },
         series: {
            include: {
              collection: true
            }
         }
       }
     });
     return JSON.parse(JSON.stringify(volume));
  } catch (error) {
      console.error(`Error fetching volume ${volumeSlug}:`, error);
      return null;
  }
}
