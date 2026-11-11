import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ABOUT_ID, publicAboutSelect } from "@/lib/izara/about";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const about = await prisma.izaraAbout.findUnique({ where: { id: ABOUT_ID }, select: publicAboutSelect });
    return NextResponse.json({ about }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Hakkımızda içeriği şu anda alınamıyor." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
