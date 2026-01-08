"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";

export async function getPeriods() {
  const periods = await prisma.period.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  return periods;
}

export async function getPeriod(id: string) {
  const period = await prisma.period.findUnique({
    where: { id },
  });

  if (!period) throw new Error("Period not found");
  return period;
}

export async function createPeriod(periodData: any) {
  const data: any = {
    name: periodData.name,
    slug: periodData.slug,
    nameI18n: periodData.nameI18n || periodData.name_i18n || {},
    dateStart: periodData.dateStart ? new Date(periodData.dateStart) : null,
    dateEnd: periodData.dateEnd ? new Date(periodData.dateEnd) : null,
  };

  const newPeriod = await prisma.period.create({
    data,
  });

  revalidatePath("/admin/periods");
  return newPeriod;
}

export async function updatePeriod(id: string, periodData: any) {
  const data: any = {
    name: periodData.name,
    slug: periodData.slug,
    nameI18n: periodData.nameI18n || periodData.name_i18n || {},
    dateStart: periodData.dateStart ? new Date(periodData.dateStart) : null,
    dateEnd: periodData.dateEnd ? new Date(periodData.dateEnd) : null,
  };

  const updatedPeriod = await prisma.period.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/periods");
  return updatedPeriod;
}

export async function deletePeriod(id: string) {
  await prisma.period.delete({
    where: { id },
  });

  revalidatePath("/admin/periods");
}
