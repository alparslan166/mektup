"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

        await prisma.letter.update({
            where: { id: letterId },
            data: { status }
        });

        revalidatePath("/admin/mektuplar");
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

        await prisma.letter.update({
            where: { id: letterId },
            data: {
                trackingCode,
                status: "SHIPPED"
            }
        });

        // Here we would normally send an email to the user
        // console.log(`Sending email to customer with tracking code: ${trackingCode}`);

        revalidatePath("/admin/mektuplar");
        return { success: true };
    } catch (error) {
        console.error("UPDATE_TRACKING_CODE_ERROR", error);
        return { error: "Takip kodu kaydedilemedi." };
    }
}
