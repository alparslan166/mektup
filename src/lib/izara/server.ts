import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { DOCUMENT_PREFIX, DocumentError, MAX_DOCUMENT_BYTES, validateFileDetails } from "./validation";

export const documentOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }];
export const publicDocumentSelect = { id: true, title: true, imageUrl: true, order: true };
export async function requireDocumentAdmin(request: Request, mutation = true) {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new DocumentError("Oturum açmanız gerekiyor.", 401);
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role !== "ADMIN") throw new DocumentError("Bu işlem için yönetici yetkisi gerekiyor.", 403);
  if (mutation) {
    const origin = request.headers.get("origin");
    const allowed = new Set([new URL(request.url).origin]);
    if (process.env.NEXTAUTH_URL) allowed.add(new URL(process.env.NEXTAUTH_URL).origin);
    if (!origin || !allowed.has(origin)) throw new DocumentError("İstek kaynağı doğrulanamadı.", 403);
    const length = Number(request.headers.get("content-length"));
    if (Number.isFinite(length) && length > MAX_DOCUMENT_BYTES + 64 * 1024) throw new DocumentError("Yükleme en fazla 4 MB olabilir.", 413);
  }
}
export async function uploadDocumentPhoto(file: File) {
  validateFileDetails(file);
  let bytes: Buffer;
  try {
    const original = Buffer.from(await file.arrayBuffer());
    const input = sharp(original, { limitInputPixels: 40_000_000, animated: false });
    const metadata = await input.metadata();
    const formatMime: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    if (!metadata.format || formatMime[metadata.format] !== file.type || (metadata.pages ?? 1) > 1 || !metadata.width || !metadata.height) throw new Error("Invalid image");
    // Re-encode to remove metadata and reject malformed/polyglot files.
    bytes = await input.rotate().resize({ width: 2400, height: 3200, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  } catch { throw new DocumentError("Fotoğraf açılamadı. Geçerli bir JPG, PNG veya WebP dosyası seçin."); }
  if (bytes.length > MAX_DOCUMENT_BYTES) throw new DocumentError("Fotoğraf çok büyük. Daha küçük bir görsel seçin.");
  return put(`${DOCUMENT_PREFIX}${randomUUID()}.webp`, bytes, { access: "public", contentType: "image/webp", addRandomSuffix: true });
}
export async function removeDocumentBlob(path: string) {
  if (!path.startsWith(DOCUMENT_PREFIX)) throw new Error("Unexpected blob path");
  await del(path);
}
export async function cleanupDocumentBlob(path: string) {
  try { await removeDocumentBlob(path); }
  catch { console.error("IZARA_DOCUMENT_BLOB_CLEANUP_FAILED", { path }); }
}
export function documentErrorResponse(error: unknown) {
  if (error instanceof DocumentError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("IZARA_DOCUMENT_ERROR", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: "Belge işlemi tamamlanamadı. Lütfen tekrar deneyin." }, { status: 500 });
}
