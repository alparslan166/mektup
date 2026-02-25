"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAllLetters() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const letters = await prisma.letter.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return letters;
}

export async function updateLetterStatus(letterId: string, status: string) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const updatedLetter = await prisma.letter.update({
        where: { id: letterId },
        data: { status },
    });

    revalidatePath("/admin");
    return updatedLetter;
}
