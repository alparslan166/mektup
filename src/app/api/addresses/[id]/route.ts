import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT (update) an address
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const body = await req.json();
        const { title, name, city, addressText, phone } = body;

        // Check if the address belongs to the user
        const existingAddress = await (prisma as any).address.findUnique({
            where: { id: id },
        });

        if (!existingAddress || existingAddress.userId !== userId) {
            return NextResponse.json({ error: "Adres bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        const updatedAddress = await (prisma as any).address.update({
            where: { id: id },
            data: {
                title,
                name,
                city,
                addressText,
                phone,
            },
        });

        return NextResponse.json(updatedAddress);
    } catch (error) {
        console.error("ADDRESS_PUT_ERROR", error);
        return NextResponse.json({ error: "Adres güncellenemedi." }, { status: 500 });
    }
}

// DELETE an address
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        // Check if the address belongs to the user
        const existingAddress = await (prisma as any).address.findUnique({
            where: { id: id },
        });

        if (!existingAddress || existingAddress.userId !== userId) {
            return NextResponse.json({ error: "Adres bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        await (prisma as any).address.delete({
            where: { id: id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("ADDRESS_DELETE_ERROR", error);
        return NextResponse.json({ error: "Adres silinemedi." }, { status: 500 });
    }
}
