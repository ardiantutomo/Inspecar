import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { DATA_DIR } from "@/lib/env";
import { MAX_PHOTOS_PER_ITEM, MAX_UPLOAD_BYTES } from "@/lib/photos-limits";

export { MAX_PHOTOS_PER_ITEM, MAX_UPLOAD_BYTES };

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

/** Akar penyimpanan foto. `turbopackIgnore` dipakai karena letaknya ditentukan
 * env saat runtime, bukan saat build. */
function dataPath(...segments: string[]): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), DATA_DIR, ...segments);
}

function photoDir(inspectionId: string): string {
  return dataPath("photos", inspectionId);
}

export class PhotoError extends Error {}

/**
 * Foto dari HP besar dan membawa metadata lokasi. Disimpan setelah di-resize dan
 * di-strip: cukup untuk bukti kondisi, tanpa membocorkan lokasi pemilik.
 */
export async function savePhoto(
  inspectionId: string,
  itemId: string,
  file: File,
): Promise<{ id: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new PhotoError("Format foto tidak didukung. Pakai JPG, PNG, atau HEIC.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new PhotoError("Ukuran foto lebih dari 12 MB. Kecilkan dulu lalu unggah lagi.");
  }

  const existing = await prisma.photo.count({ where: { inspectionId, itemId } });
  if (existing >= MAX_PHOTOS_PER_ITEM) {
    throw new PhotoError(`Maksimal ${MAX_PHOTOS_PER_ITEM} foto per pemeriksaan.`);
  }

  const input = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const id = randomUUID();
  const dir = photoDir(inspectionId);
  await mkdir(dir, { recursive: true });
  const storageKey = path.join("photos", inspectionId, `${id}.jpg`);
  await writeFile(path.join(dir, `${id}.jpg`), processed.data);

  const row = await prisma.photo.create({
    data: {
      id,
      inspectionId,
      itemId,
      storageKey,
      mimeType: "image/jpeg",
      width: processed.info.width,
      height: processed.info.height,
      byteSize: processed.data.byteLength,
    },
  });

  return { id: row.id };
}

export async function readPhotoBytes(storageKey: string): Promise<Buffer> {
  return readFile(dataPath(storageKey));
}

export async function deletePhoto(id: string, inspectionId: string): Promise<void> {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.inspectionId !== inspectionId) return;
  await prisma.photo.delete({ where: { id } });
  await unlink(dataPath(photo.storageKey)).catch(() => {});
}
