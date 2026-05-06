"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import { pickI18n } from "@/lib/i18n/fallback";

export async function getArtifactCategories() {
  const items = await prisma.artifactCategory.findMany();
  return items.sort((a, b) =>
    pickI18n(a.title, 'en').localeCompare(pickI18n(b.title, 'en'))
  );
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
      title: data.title || {},
      slug: data.slug,
    },
  });
  revalidatePath("/admin/artifact-categories");
  return created;
}

export async function updateArtifactCategory(id: string, data: any) {
  const updated = await prisma.artifactCategory.update({
    where: { id },
    data: {
      title: data.title || {},
      slug: data.slug,
    },
  });
  revalidatePath("/admin/artifact-categories");
  return updated;
}

export async function deleteArtifactCategory(id: string) {
  await prisma.artifactCategory.delete({ where: { id } });
  revalidatePath("/admin/artifact-categories");
}
