import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const formData = await req.json();
        const { file, fileName, type } = formData;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        // Since we are receiving base64 or similar from the client to simplify the fetch
        // Real prod apps would use standard Multipart, but for quick implementation with fetch:
        const base64Data = file.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const uniqueFileName = `${uuidv4()}_${fileName}`;
        const uploadDir = join(process.cwd(), "public/uploads");
        const filePath = join(uploadDir, uniqueFileName);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${uniqueFileName}`;

        return NextResponse.json({
            url: publicUrl,
            name: fileName,
            type: type
        });
    } catch (error) {
        console.error("UPLOAD_ERROR", error);
        return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
    }
}
