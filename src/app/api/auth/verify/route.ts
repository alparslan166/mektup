import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return NextResponse.json(
                { message: "Doğrulama bağlantısı geçersiz veya süresi dolmuş." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });

        if (!user) {
            return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
        }

        // Mark user as verified
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });

        // Delete the token
        await prisma.verificationToken.delete({
            where: { token },
        });

        return NextResponse.redirect(new URL("/auth/login?verified=true", req.url));
    } catch (error) {
        console.error("VERIFICATION_ERROR", error);
        return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
