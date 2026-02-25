import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    try {
        const { fileName, fileType } = await req.json();

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "fileName ve fileType gerekli." }, { status: 400 });
        }

        const fileExtension = fileName.split('.').pop();
        const key = `${uuidv4()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        // Generate a read-only presigned URL for immediate preview (valid for 1 hour)
        const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        });
        const previewUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            previewUrl,
            key
        });
    } catch (error) {
        console.error("S3_PRESIGNED_URL_ERROR", error);
        return NextResponse.json({ error: "S3 bağlantısı oluşturulamadı: " + (error as Error).message }, { status: 500 });
    }
}
