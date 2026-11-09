import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanupDocumentBlob, documentErrorResponse, documentOrder, publicDocumentSelect, requireDocumentAdmin, uploadDocumentPhoto } from "@/lib/izara/server";
import { DocumentError, MAX_DOCUMENTS, parseTitle } from "@/lib/izara/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireDocumentAdmin(request, false);
    const documents = await prisma.izaraDocument.findMany({ orderBy: documentOrder, select: publicDocumentSelect });
    return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
export async function POST(request: Request) {
  let uploaded: { pathname: string } | undefined;
  try {
    await requireDocumentAdmin(request);
    const data = await request.formData();
    const title = parseTitle(data.get("title"));
    const file = data.get("photo");
    if (!(file instanceof File)) throw new DocumentError("Belge fotoğrafı gerekli.");
    if (await prisma.izaraDocument.count() >= MAX_DOCUMENTS) throw new DocumentError("En fazla 50 belge ekleyebilirsiniz.");
    const blob = await uploadDocumentPhoto(file); uploaded = blob;
    const document = await prisma.$transaction(async tx => {
      // Serialize writes so simultaneous additions cannot exceed the limit or share a position.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(49827401)`;
      if (await tx.izaraDocument.count() >= MAX_DOCUMENTS) throw new DocumentError("En fazla 50 belge ekleyebilirsiniz.");
      const last = await tx.izaraDocument.aggregate({ _max: { order: true } });
      return tx.izaraDocument.create({ data: { title, imageUrl: blob.url, blobPath: blob.pathname, order: (last._max.order ?? -1) + 1 }, select: publicDocumentSelect });
    });
    uploaded = undefined;
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (uploaded) await cleanupDocumentBlob(uploaded.pathname);
    return documentErrorResponse(error);
  }
}
