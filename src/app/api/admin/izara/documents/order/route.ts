import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { documentErrorResponse, requireDocumentAdmin } from "@/lib/izara/server";
import { DocumentError, parseOrder } from "@/lib/izara/validation";
export async function PUT(request: Request) {
  try {
    await requireDocumentAdmin(request);
    const { ids } = await request.json();
    const ordered = parseOrder(ids);
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(49827401)`;
      const all = await tx.izaraDocument.findMany({ select: { id: true } });
      const currentIds = new Set(all.map(d => d.id));
      if (all.length !== ordered.length || ordered.some(id => !currentIds.has(id))) throw new DocumentError("Belge listesi değişmiş. Sayfayı yenileyip tekrar deneyin.", 409);
      for (const [order, id] of ordered.entries()) await tx.izaraDocument.update({ where: { id }, data: { order } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return documentErrorResponse(error); }
}
