"use server";

import prisma from "@/lib/prisma";
import { s3, R2_CONFIG } from "@/utils/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

  // Only handling images for now as per schema PageImage
  if (!file.type.startsWith('image/')) {
       return { success: false, error: "Only images are supported for page uploads currently" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const r2Key = `collections/${collectionId}/${volumeId}/${fileType}/${fileName}`;
  const contentType = file.type || 'application/octet-stream';

  try {
    // 1. Upload to R2
    await s3.send(new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: r2Key,
      Body: buffer,
      ContentType: contentType
    }));

    const fileUrl = `${R2_CONFIG.publicUrl}/${r2Key}`;

    // 2. Create StorageFile record
    const storageFile = await prisma.storageFile.create({
      data: {
        bucketName: R2_CONFIG.bucket,
        storageKey: r2Key,
        filename: fileName,
        mimeType: contentType,
        sizeBytes: buffer.length,
        publicUrl: fileUrl,
        isPublic: true,
      },
    });

    // 3. Check if page exists, if not create it
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

    // 4. Create PageImage
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

export async function deletePageFile(collectionId: string, volumeId: string, pageId: string, path: string) {
     try {
        // 1. Delete from R2
        await s3.send(new DeleteObjectCommand({
           Bucket: R2_CONFIG.bucket,
           Key: path
        }));

        // 2. Find StorageFile
        const storageFile = await prisma.storageFile.findUnique({ where: { storageKey: path } });
        
        if (storageFile) {
            // Delete PageImage(s) linking to this StorageFile
            // Note: Since PageImage is 'page_images' in DB, and relations are setup.
            await prisma.pageImage.deleteMany({ where: { storageFileId: storageFile.id } });
            
            // Delete StorageFile
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
    deletions.map(async ({ pageId, path }) => {
        return deletePageFile(collectionId, volumeId, pageId, path);
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
