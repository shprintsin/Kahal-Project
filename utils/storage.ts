import { mkdir, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const STORAGE_CONFIG = {
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"),
  baseUrl: process.env.UPLOAD_BASE_URL || "/uploads",
} as const;

function ensureRelativeKey(key: string): string {
  return key.startsWith("/") ? key.slice(1) : key;
}

function getAbsolutePath(key: string): string {
  const clean = ensureRelativeKey(key);
  return path.join(STORAGE_CONFIG.uploadDir, clean);
}

export function getPublicUrl(key: string): string {
  const clean = ensureRelativeKey(key);
  return `${STORAGE_CONFIG.baseUrl}/${clean}`;
}

export async function uploadFile(
  file: File,
  key: string
): Promise<string> {
  const clean = ensureRelativeKey(key);
  const filePath = getAbsolutePath(clean);
  const dir = path.dirname(filePath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return getPublicUrl(clean);
}

export async function uploadBuffer(
  buffer: Buffer,
  key: string,
): Promise<string> {
  const clean = ensureRelativeKey(key);
  const filePath = getAbsolutePath(clean);
  const dir = path.dirname(filePath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(filePath, buffer);

  return getPublicUrl(clean);
}

export async function deleteFile(key: string): Promise<void> {
  const filePath = getAbsolutePath(key);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}
