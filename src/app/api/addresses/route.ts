import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all addresses for the logged-in user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const addresses = await (prisma as any).address.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error("ADDRESS_GET_ERROR", error);
        return NextResponse.json({ error: "Adresler yüklenemedi." }, { status: 500 });
    }
}

// POST a new address
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const body = await req.json();
        const { title, name, city, addressText, phone, isPrison, prisonName, fatherName, wardNumber, prisonNote } = body;

        // Validation: For standard addresses, title, name, city, and addressText are required.
        // For prison addresses, title, name, city, prisonName, and wardNumber are required.
        const isValid = isPrison
            ? (title && name && city && prisonName && wardNumber)
            : (title && name && city && addressText);

        if (!isValid) {
            return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
        }

        const address = await (prisma as any).address.create({
            data: {
                userId: userId,
                title,
                name,
                city,
                addressText,
                phone,
                isPrison: !!isPrison,
                prisonName,
                fatherName,
                wardNumber,
                prisonNote,
            },
        });

        return NextResponse.json(address);
    } catch (error) {
        console.error("ADDRESS_POST_ERROR", error);
        return NextResponse.json({ error: "Adres kaydedilemedi." }, { status: 500 });
    }
}
