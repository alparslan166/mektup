import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
    try {
        const formData = await req.json();
        const { file, fileName, type } = formData;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json({
                error: "Vercel Blob token'ı eksik. Lütfen BLOB_READ_WRITE_TOKEN ortam değişkenini ekleyin."
            }, { status: 500 });
        }

        // Base64 to Buffer
        const base64Data = file.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Vercel Blob
        const blob = await put(fileName, buffer, {
            access: 'public',
            contentType: type === 'photo' ? 'image/jpeg' : 'application/pdf', // Simplified, but good enough
        });

        return NextResponse.json({
            url: blob.url,
            name: fileName,
            type: type
        });
    } catch (error) {
        console.error("UPLOAD_ERROR", error);
        return NextResponse.json({ error: "Yükleme başarısız oldu: " + (error as Error).message }, { status: 500 });
    }
}
