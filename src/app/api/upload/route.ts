import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json({
                error: "Vercel Blob token'ı eksik. Lütfen Vercel Dashboard'dan Storage > Blob kurulumunu yapın."
            }, { status: 500 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        return NextResponse.json({
            url: blob.url,
            name: file.name,
            type: type
        });
    } catch (error) {
        console.error("UPLOAD_ERROR", error);
        return NextResponse.json({ error: "Yükleme başarısız oldu: " + (error as Error).message }, { status: 500 });
    }
}
