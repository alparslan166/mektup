import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    try {
        const { key } = await req.json();

        if (!key) {
            return NextResponse.json({ error: "key gerekli." }, { status: 400 });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        });

        // Generate a URL valid for 1 hour
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ url });
    } catch (error) {
        console.error("S3_GET_URL_ERROR", error);
        return NextResponse.json({ error: "S3 bağlantısı oluşturulamadı: " + (error as Error).message }, { status: 500 });
    }
}
