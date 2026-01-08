"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

export async function getArtifactCategories() {
  return await prisma.artifactCategory.findMany({
    orderBy: { title: 'asc' },
  });
}

export async function getArtifactCategory(id: string) {
  const category = await prisma.artifactCategory.findUnique({
    where: { id },
  });
  if (!category) throw new Error("Category not found");
  return category;
}

export async function createArtifactCategory(data: any) {
  const created = await prisma.artifactCategory.create({
    data: {
      title: data.title,
      slug: data.slug,
      titleI18n: data.titleI18n || {},
    },
  });
  revalidatePath("/admin/artifact-categories");
  return created;
}

export async function updateArtifactCategory(id: string, data: any) {
  const updated = await prisma.artifactCategory.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      titleI18n: data.titleI18n || {},
    },
  });
  revalidatePath("/admin/artifact-categories");
  return updated;
}

export async function deleteArtifactCategory(id: string) {
  await prisma.artifactCategory.delete({ where: { id } });
  revalidatePath("/admin/artifact-categories");
}
