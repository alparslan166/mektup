import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Eksik bilgi girdiniz." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Bu e-posta adresi zaten kullanımda." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "Kullanıcı başarıyla oluşturuldu.", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("REGISTRATION_ERROR", error);
        return NextResponse.json(
            { message: "Sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
