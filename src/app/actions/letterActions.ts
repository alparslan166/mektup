"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createLetter(letterData: any) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { error: "Kullanıcı bulunamadı." };
        }

        // 1. Create the permanent letter
        const letter = await prisma.letter.create({
            data: {
                userId: user.id,
                data: letterData,
                status: "PAID"
            }
        });

        // 2. Clear the draft
        await prisma.draft.deleteMany({
            where: { userId: user.id }
        });

        return { success: true, letterId: letter.id };
    } catch (error) {
        console.error("CREATE_LETTER_ERROR", error);
        return { error: "Mektup kaydedilemedi." };
    }
}

export async function getLetters() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return [];
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return [];

        return await prisma.letter.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("GET_LETTERS_ERROR", error);
        return [];
    }
}
