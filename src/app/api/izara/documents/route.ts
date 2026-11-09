import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { documentOrder, publicDocumentSelect } from "@/lib/izara/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const documents = await prisma.izaraDocument.findMany({ orderBy: documentOrder, select: publicDocumentSelect });
    return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Belgeler şu anda alınamıyor." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
