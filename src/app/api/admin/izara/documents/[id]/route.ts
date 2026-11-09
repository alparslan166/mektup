import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanupDocumentBlob, documentErrorResponse, publicDocumentSelect, requireDocumentAdmin, uploadDocumentPhoto } from "@/lib/izara/server";
import { DocumentError, parseTitle } from "@/lib/izara/validation";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  let uploaded: { pathname: string } | undefined;
  try {
    await requireDocumentAdmin(request);
    const { id } = await params;
    const data = await request.formData();
    const title = parseTitle(data.get("title"));
    const file = data.get("photo");
    if (file !== null && !(file instanceof File)) throw new DocumentError("Fotoğraf geçersiz.");
    const blob = file instanceof File ? await uploadDocumentPhoto(file) : null;
    if (blob) uploaded = blob;
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(49827401)`;
      const existing = await tx.izaraDocument.findUnique({ where: { id } });
      if (!existing) throw new DocumentError("Belge bulunamadı.", 404);
      const document = await tx.izaraDocument.update({ where: { id }, data: { title, ...(blob ? { imageUrl: blob.url, blobPath: blob.pathname } : {}) }, select: publicDocumentSelect });
      return { document, oldPath: existing.blobPath };
    });
    uploaded = undefined;
    if (blob) await cleanupDocumentBlob(result.oldPath);
    return NextResponse.json({ document: result.document });
  } catch (error) {
    if (uploaded) await cleanupDocumentBlob(uploaded.pathname);
    return documentErrorResponse(error);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    await requireDocumentAdmin(request);
    const { id } = await params;
    const existing = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(49827401)`;
      const document = await tx.izaraDocument.findUnique({ where: { id } });
      if (!document) throw new DocumentError("Belge bulunamadı.", 404);
      await tx.izaraDocument.delete({ where: { id } });
      return document;
    });
    await cleanupDocumentBlob(existing.blobPath);
    return NextResponse.json({ success: true });
  } catch (error) { return documentErrorResponse(error); }
}
