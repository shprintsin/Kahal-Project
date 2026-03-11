"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

export async function getRegions() {
  const regions = await prisma.region.findMany({
    orderBy: {
      slug: 'asc',
    },
  });

  return regions;
}

export async function getRegion(id: string) {
  const region = await prisma.region.findUnique({
    where: { id },
  });

  if (!region) throw new Error("Region not found");
  return region;
}

interface RegionInput {
  slug: string;
  name?: string;
  nameI18n?: Record<string, string>;
  name_i18n?: Record<string, string>;
}

export async function createRegion(regionData: RegionInput) {
  const data = {
    slug: regionData.slug,
    name: regionData.name || regionData.slug,
    nameI18n: regionData.nameI18n || regionData.name_i18n || {},
  };

  const createdRegion = await prisma.region.create({
    data,
  });

  revalidatePath("/admin/regions");
  return createdRegion;
}

export async function updateRegion(id: string, regionData: RegionInput) {
  const data = {
    slug: regionData.slug,
    name: regionData.name,
    nameI18n: regionData.nameI18n || regionData.name_i18n,
  };

  const updatedRegion = await prisma.region.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/regions");
  revalidatePath(`/admin/regions/${id}`);
  return updatedRegion;
}

export async function deleteRegion(id: string) {
  await prisma.region.delete({
    where: { id },
  });

  revalidatePath("/admin/regions");
}
