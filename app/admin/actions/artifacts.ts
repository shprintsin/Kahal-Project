"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

export async function getArtifacts() {
  const artifacts = await prisma.artifact.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      regions: true,
      periods: true,
      tags: true,
      pages: true,
      places: true,
      artifactCategory: true,
    }
  });
  return artifacts;
}

export async function getArtifact(id: string) {
  const artifact = await prisma.artifact.findUnique({
    where: { id },
    include: {
      regions: true,
      periods: true,
      tags: true,
      pages: {
        include: {
          images: {
            include: {
              storageFile: true
            }
          }
        },
        orderBy: {
            sequenceIndex: 'asc'
        }
      },
      places: true,
      artifactCategory: true,
    }
  });

  if (!artifact) throw new Error("Artifact not found");
  return artifact;
}

import { ArtifactData } from "../types/artifact";

export async function createArtifact(data: ArtifactData) {
  const newArtifact = await prisma.artifact.create({
    data: {
      slug: data.slug,
      title: data.title || "",
      titleI18n: data.titleI18n || {},
      description: data.description || null,
      descriptionI18n: data.descriptionI18n || {},
      content: data.content || "",
      contentI18n: data.contentI18n || {},
      year: data.year || null,
      dateDisplay: data.dateDisplay || null,
      dateSort: data.dateSort ? new Date(data.dateSort) : null,
      excerpt: data.excerpt || null,
      excerptI18n: data.excerptI18n || {},
      displayScans: data.displayScans !== undefined ? data.displayScans : true,
      displayTexts: data.displayTexts !== undefined ? data.displayTexts : true,
      sources: data.sources || [],
      
      artifactCategory: data.artifactCategoryId ? { connect: { id: data.artifactCategoryId } } : undefined,

      regions: {
        connect: data.regionIds?.map((id) => ({ id })) || [],
      },
      periods: {
        connect: data.periodIds?.map((id) => ({ id })) || [],
      },
      tags: {
        connect: data.tagIds?.map((id) => ({ id })) || [],
      },
      pages: {
        connect: data.pageIds?.map((id) => ({ id })) || [],
      },
      places: {
        connect: data.placeIds?.map((id) => ({ id })) || [],
      },
    },
  });

  revalidatePath("/admin/artifacts");
  return newArtifact;
}

export async function updateArtifact(id: string, data: ArtifactData) {
  const updatedArtifact = await prisma.artifact.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      titleI18n: data.titleI18n || {},
      description: data.description || null,
      descriptionI18n: data.descriptionI18n || {},
      content: data.content || "",
      contentI18n: data.contentI18n || {},
      year: data.year || null,
      dateDisplay: data.dateDisplay || null,
      dateSort: data.dateSort ? new Date(data.dateSort) : null,
      excerpt: data.excerpt || null,
      excerptI18n: data.excerptI18n || {},
      displayScans: data.displayScans,
      displayTexts: data.displayTexts,
      sources: data.sources || [],
      
      artifactCategory: data.artifactCategoryId ? { connect: { id: data.artifactCategoryId } } : { disconnect: true },

      regions: {
        set: data.regionIds?.map((id) => ({ id })) || [],
      },
      periods: {
        set: data.periodIds?.map((id) => ({ id })) || [],
      },
      tags: {
        set: data.tagIds?.map((id) => ({ id })) || [],
      },
      pages: {
        set: data.pageIds?.map((id) => ({ id })) || [],
      },
      places: {
        set: data.placeIds?.map((id) => ({ id })) || [],
      },
    },
  });

  revalidatePath("/admin/artifacts");
  return updatedArtifact;
}

// ... existing exports

export async function getArtifactsStructured() {
  const categories = await prisma.artifactCategory.findMany({
    include: {
      artifacts: {
        orderBy: { title: 'asc' } // or createdAt
      }
    },
    orderBy: { title: 'asc' }
  });

  // Also get uncategorized artifacts
  const uncategorized = await prisma.artifact.findMany({
    where: { artifactCategoryId: null },
    orderBy: { title: 'asc' }
  });

  return { categories, uncategorized };
}

export async function addPagesToArtifact(artifactId: string, pageIds: string[]) {
    await prisma.artifact.update({
        where: { id: artifactId },
        data: {
            pages: {
                connect: pageIds.map(id => ({ id }))
            }
        }
    });
    revalidatePath("/admin/artifacts");
}

export async function deleteArtifact(id: string) {
  await prisma.artifact.delete({
    where: { id },
  });

  revalidatePath("/admin/artifacts");
}
