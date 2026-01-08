"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/utils/r2";

// Get file type prefix based on mime type
function getFilePrefix(mimeType: string, filename: string): string {
  if (mimeType.startsWith("image/")) {
    return "thumbnail/";
  } else if (mimeType === "application/pdf") {
    return "pdfs/";
  } else if (mimeType === "application/geo+json" || filename.endsWith(".geojson")) {
    return "geojson/";
  } else if (
    mimeType === "text/csv" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    filename.endsWith(".csv") ||
    filename.endsWith(".xlsx") ||
    filename.endsWith(".xls") ||
    (mimeType === "application/json" && !filename.endsWith(".geojson"))
  ) {
    return "data/";
  }
  return "other/";
}

export async function getMedia(type?: "image" | "pdf" | "geojson" | "data") {
  let whereClause = {};

  // Filter by type if specified
  if (type) {
    const prefix = type === "image" ? "thumbnail/" : 
                   type === "pdf" ? "pdfs/" : 
                   type === "geojson" ? "geojson/" : 
                   "data/";
    whereClause = {
      url: {
        contains: prefix,
      },
    };
  }

  const media = await prisma.media.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return media || [];
}

export async function uploadMediaFile(file: File) {
  try {
    // Get appropriate prefix based on file type
    const prefix = getFilePrefix(file.type, file.name);
    const fileName = `${prefix}${Date.now()}-${file.name}`;
    
    // Upload to R2
    const publicUrl = await uploadToR2(file, fileName);

    // Create media record in database
    const mediaData = await prisma.media.create({
      data: {
        filename: file.name,
        url: publicUrl,
        altTextI18n: {},
      },
    });

    revalidatePath("/admin/media");
    return mediaData;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function deleteMedia(id: string) {
  await prisma.media.delete({
    where: { id },
  });

  revalidatePath("/admin/media");
}

export async function updateMediaAltText(id: string, altText: Record<string, string>) {
  const data = await prisma.media.update({
    where: { id },
    data: {
      altTextI18n: altText,
    },
  });

  revalidatePath("/admin/media");
  return data;
}
