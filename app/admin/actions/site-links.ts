"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

export async function getSiteLinks() {
  return prisma.siteLink.findMany({
    where: { status: "published" },
    orderBy: { order: "asc" },
  });
}

export async function getSiteLink(id: string) {
  return prisma.siteLink.findUnique({ where: { id } });
}

export async function createSiteLink(data: {
  title: string;
  titleI18n?: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  icon?: string;
  url: string;
  order?: number;
  status?: string;
}) {
  const link = await prisma.siteLink.create({ data: data as Parameters<typeof prisma.siteLink.create>[0]["data"] });
  revalidatePath("/admin/site-links");
  return link;
}

export async function updateSiteLink(
  id: string,
  data: {
    title?: string;
    titleI18n?: Record<string, string>;
    description?: string;
    descriptionI18n?: Record<string, string>;
    icon?: string;
    url?: string;
    order?: number;
    status?: string;
  }
) {
  const link = await prisma.siteLink.update({ where: { id }, data: data as Parameters<typeof prisma.siteLink.update>[0]["data"] });
  revalidatePath("/admin/site-links");
  return link;
}

export async function deleteSiteLink(id: string) {
  await prisma.siteLink.delete({ where: { id } });
  revalidatePath("/admin/site-links");
}
