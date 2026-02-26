"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTrackingCodeEmail, sendPreparingEmail } from "./emailActions";

export async function getAllLetters() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Yetkiniz yok." };
        }

        const letters = await prisma.letter.findMany({
            orderBy: { createdAt: "asc" }, // Newest at the bottom as requested ("en son gelen en altta")
            include: { user: true }
        });

        return { success: true, letters };
    } catch (error) {
        console.error("GET_ALL_LETTERS_ERROR", error);
        return { error: "Mektuplar getirilemedi." };
    }
}

export async function updateLetterStatus(letterId: string, status: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Yetkiniz yok." };
        }

        const letter = await prisma.letter.update({
            where: { id: letterId },
            data: { status },
            include: { user: true }
        });

        // Trigger emails based on status
        if (status === "PREPARING" && letter.user?.email) {
            await sendPreparingEmail(letter.user.email, letter.id);
        }

        revalidatePath("/admin/mektuplar");
        revalidatePath("/gonderilenler");
        return { success: true };
    } catch (error) {
        console.error("UPDATE_LETTER_STATUS_ERROR", error);
        return { error: "Durum güncellenemedi." };
    }
}

export async function updateTrackingCode(letterId: string, trackingCode: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Yetkiniz yok." };
        }

        const updatedLetter = await prisma.letter.update({
            where: { id: letterId },
            data: {
                trackingCode,
                status: "SHIPPED"
            },
            include: { user: true }
        });

        if (updatedLetter.user?.email) {
            await sendTrackingCodeEmail(updatedLetter.user.email, updatedLetter.id, trackingCode);
        }

        revalidatePath("/admin/mektuplar");
        revalidatePath("/gonderilenler");
        return { success: true };
    } catch (error) {
        console.error("UPDATE_TRACKING_CODE_ERROR", error);
        return { error: "Takip kodu kaydedilemedi." };
    }
}
