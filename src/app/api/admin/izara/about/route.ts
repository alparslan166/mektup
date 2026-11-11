import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { documentErrorResponse, requireDocumentAdmin } from "@/lib/izara/server";
import { ABOUT_ID, parseAbout, publicAboutSelect } from "@/lib/izara/about";
import { DocumentError } from "@/lib/izara/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireDocumentAdmin(request, false);
    const about = await prisma.izaraAbout.findUnique({ where: { id: ABOUT_ID }, select: publicAboutSelect });
    return NextResponse.json({ about }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
export async function PUT(request: Request) {
  try {
    await requireDocumentAdmin(request);
    let json: unknown;
    try { json = await request.json(); } catch { throw new DocumentError("İstek geçersiz."); }
    const data = parseAbout(json);
    const about = await prisma.izaraAbout.upsert({ where: { id: ABOUT_ID }, create: { id: ABOUT_ID, ...data }, update: data, select: publicAboutSelect });
    return NextResponse.json({ about });
  } catch (error) { return documentErrorResponse(error); }
}
