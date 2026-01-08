"use server";

/**
 * Static Server Actions for Generic CRUD
 * These must be statically exported to be callable by Client Components.
 */

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filters?: Record<string, any>;
}

export interface ListResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function genericList(
  modelName: string,
  searchableFields: string[],
  options: ListOptions = {}
): Promise<ListResult<any>> {
  // Convert model name to camelCase for Prisma client
  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const model = (prisma as any)[modelKey];
  if (!model) throw new Error(`Model ${modelName} not found (tried key: ${modelKey})`);
  
  const {
    page = 1,
    limit = 20,
    search,
    sort = "id", // Changed from "createdAt" to "id" for universal compatibility
    order = "desc",
    filters = {},
  } = options;
  
  const where: any = {};
  
  if (search && searchableFields.length > 0) {
    where.OR = searchableFields.map(field => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      where[key] = value;
    }
  }
  
  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);
  
  const [items, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take,
      orderBy: { [sort]: order },
    }),
    model.count({ where }),
  ]);
  
  return {
    items,
    pagination: {
      page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function genericGet(modelName: string, id: string) {
  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const model = (prisma as any)[modelKey];
  return await model.findUnique({ where: { id } });
}

export async function genericCreate(
  modelName: string,
  basePath: string,
  fieldKeys: string[],
  data: any
) {
  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const model = (prisma as any)[modelKey];
  
  const cleanData: any = {};
  for (const key of fieldKeys) {
    if (data[key] !== undefined) {
      cleanData[key] = data[key];
    }
  }
  
  const item = await model.create({ data: cleanData });
  revalidatePath(basePath);
  return item;
}

export async function genericUpdate(
  modelName: string,
  basePath: string,
  fieldKeys: string[],
  id: string,
  data: any
) {
  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const model = (prisma as any)[modelKey];
  
  const cleanData: any = {};
  for (const key of fieldKeys) {
    if (data[key] !== undefined) {
      cleanData[key] = data[key];
    }
  }
  
  const item = await model.update({
    where: { id },
    data: cleanData,
  });
  
  revalidatePath(basePath);
  revalidatePath(`${basePath}/${id}`);
  return item;
}

export async function genericDelete(
  modelName: string,
  basePath: string,
  id: string
) {
  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const model = (prisma as any)[modelKey];
  await model.delete({ where: { id } });
  revalidatePath(basePath);
}
