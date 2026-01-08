import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        thumbnail: true,
        collection: {
          select: {
            id: true,
            name: true,
            nameI18n: true,
          }
        },
        _count: {
          select: {
            volumes: true,
          }
        }
      },
      orderBy: {
        indexNumber: 'asc',
      }
    });

    const formattedSeries = series.map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      nameI18n: s.nameI18n,
      description: s.description,
      descriptionI18n: s.descriptionI18n,
      indexNumber: s.indexNumber,
      yearMin: s.yearMin,
      yearMax: s.yearMax,
      thumbnail: s.thumbnail,
      volumeCount: s._count.volumes,
      volume_count: s._count.volumes,
      collection: s.collection,
      createdAt: s.createdAt.toISOString(),
      volumes: [],
    }));

    return NextResponse.json(formattedSeries);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}
