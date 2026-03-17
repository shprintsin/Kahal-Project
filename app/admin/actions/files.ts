"use server";

import prisma from "@/lib/prisma";
import { uploadBuffer, deleteFile, getPublicUrl } from "@/utils/storage";
import { revalidatePath } from "next/cache";

export async function uploadPageFile(formData: FormData) {
  const collectionId = formData.get('collectionId') as string;
  const volumeId = formData.get('volumeId') as string;
  const pageId = formData.get('pageId') as string;
  const file = formData.get('file') as File;
  const fileType = formData.get('fileType') as string || 'png';

  if (!file || !collectionId || !volumeId || !pageId) {
    return { success: false, error: "Missing fields" };
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: "Only images are supported for page uploads currently" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const key = `collections/${collectionId}/${volumeId}/${fileType}/${fileName}`;
  const contentType = file.type || 'application/octet-stream';

  try {
    const fileUrl = await uploadBuffer(buffer, key);

    const storageFile = await prisma.storageFile.create({
      data: {
        bucketName: "uploads",
        storageKey: key,
        filename: fileName,
        mimeType: contentType,
        sizeBytes: buffer.length,
        publicUrl: fileUrl,
        isPublic: true,
      },
    });

    let volumePage = await prisma.volumePage.findFirst({
      where: {
        volumeId: volumeId,
        label: pageId,
      },
    });

    if (!volumePage) {
      const lastPage = await prisma.volumePage.findFirst({
        where: { volumeId: volumeId },
        orderBy: { sequenceIndex: 'desc' },
      });

      volumePage = await prisma.volumePage.create({
        data: {
          volumeId: volumeId,
          label: pageId,
          sequenceIndex: (lastPage?.sequenceIndex ?? 0) + 1,
        },
      });
    }

    await prisma.pageImage.create({
      data: {
        pageId: volumePage.id,
        storageFileId: storageFile.id,
        useType: "original_scan"
      }
    });

    revalidatePath(`/collections/${collectionId}/${volumeId}`);
    return { success: true, url: fileUrl };

  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function deletePageFile(collectionId: string, volumeId: string, pageId: string, storagePath: string) {
  try {
    await deleteFile(storagePath);

    const storageFile = await prisma.storageFile.findUnique({ where: { storageKey: storagePath } });

    if (storageFile) {
      await prisma.pageImage.deleteMany({ where: { storageFileId: storageFile.id } });
      await prisma.storageFile.delete({ where: { id: storageFile.id } });
    }

    revalidatePath(`/collections/${collectionId}/${volumeId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function batchDeleteFiles(
  collectionId: string,
  volumeId: string,
  deletions: { pageId: string; fileType: string; path: string }[]
) {
  const results = await Promise.allSettled(
    deletions.map(async ({ pageId, path: filePath }) => {
      return deletePageFile(collectionId, volumeId, pageId, filePath);
    })
  );

  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        pageId: deletions[idx].pageId,
        success: false,
        error: result.reason
      };
    }
  });
}
