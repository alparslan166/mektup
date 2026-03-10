import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: "public",
        });

        return NextResponse.json({
            url: blob.url,
            // Keeping these for compatibility with existing frontend logic if possible
            publicUrl: blob.url,
            previewUrl: blob.url,
        });
    } catch (error) {
        console.error("VERCEL_BLOB_UPLOAD_ERROR", error);
        return NextResponse.json({ error: "Görsel yüklenemedi: " + (error as Error).message }, { status: 500 });
    }
}
