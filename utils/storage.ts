import { mkdir, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { execFile } from "child_process";
import { tmpdir } from "os";

const SSH_KEY = process.env.SSH_KEY_PATH || "C:/cde/keys/ssh-key-2026-03-09.key";
const SSH_HOST = process.env.SSH_UPLOAD_HOST || "";
const SSH_USER = process.env.SSH_UPLOAD_USER || "opc";
const REMOTE_UPLOAD_DIR = process.env.REMOTE_UPLOAD_DIR || "/home/opc/uploads";
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || "/uploads";

const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

function isRemoteMode(): boolean {
  return !!SSH_HOST;
}

function ensureRelativeKey(key: string): string {
  return key.startsWith("/") ? key.slice(1) : key;
}

export function getPublicUrl(key: string): string {
  const clean = ensureRelativeKey(key);
  return `${UPLOAD_BASE_URL}/${clean}`;
}

function scpToServer(localPath: string, remoteKey: string): Promise<void> {
  const remotePath = `${REMOTE_UPLOAD_DIR}/${remoteKey}`;
  const remoteDir = path.posix.dirname(remotePath);

  return new Promise((resolve, reject) => {
    const sshArgs = [
      "-i", SSH_KEY,
      "-o", "StrictHostKeyChecking=no",
      `${SSH_USER}@${SSH_HOST}`,
      `mkdir -p ${remoteDir}`,
    ];

    execFile("ssh", sshArgs, (mkdirErr) => {
      if (mkdirErr) {
        reject(new Error(`SSH mkdir failed: ${mkdirErr.message}`));
        return;
      }

      const scpArgs = [
        "-i", SSH_KEY,
        "-o", "StrictHostKeyChecking=no",
        localPath,
        `${SSH_USER}@${SSH_HOST}:${remotePath}`,
      ];

      execFile("scp", scpArgs, (scpErr) => {
        if (scpErr) {
          reject(new Error(`SCP failed: ${scpErr.message}`));
          return;
        }
        resolve();
      });
    });
  });
}

async function writeLocalFile(buffer: Buffer, key: string): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  const dir = path.dirname(filePath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(filePath, buffer);
}

export async function uploadFile(file: File, key: string): Promise<string> {
  const clean = ensureRelativeKey(key);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isRemoteMode()) {
    const tmpPath = path.join(tmpdir(), `upload_${Date.now()}_${path.basename(clean)}`);
    await writeFile(tmpPath, buffer);
    try {
      await scpToServer(tmpPath, clean);
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  } else {
    await writeLocalFile(buffer, clean);
  }

  return getPublicUrl(clean);
}

export async function uploadBuffer(buffer: Buffer, key: string): Promise<string> {
  const clean = ensureRelativeKey(key);

  if (isRemoteMode()) {
    const tmpPath = path.join(tmpdir(), `upload_${Date.now()}_${path.basename(clean)}`);
    await writeFile(tmpPath, buffer);
    try {
      await scpToServer(tmpPath, clean);
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  } else {
    await writeLocalFile(buffer, clean);
  }

  return getPublicUrl(clean);
}

export async function deleteFile(key: string): Promise<void> {
  const clean = ensureRelativeKey(key);

  if (isRemoteMode()) {
    const remotePath = `${REMOTE_UPLOAD_DIR}/${clean}`;
    return new Promise((resolve, reject) => {
      execFile("ssh", [
        "-i", SSH_KEY,
        "-o", "StrictHostKeyChecking=no",
        `${SSH_USER}@${SSH_HOST}`,
        `rm -f ${remotePath}`,
      ], (err) => {
        if (err) reject(new Error(`SSH rm failed: ${err.message}`));
        else resolve();
      });
    });
  } else {
    const filePath = path.join(LOCAL_UPLOAD_DIR, clean);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }
}
