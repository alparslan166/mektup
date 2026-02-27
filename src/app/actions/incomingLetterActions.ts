"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendIncomingLetterNotificationEmail } from "@/app/actions/emailActions";

// Admin: Create an incoming letter for a user (upload photos)
export async function createIncomingLetter(userId: string, images: string[], description?: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        const letter = await prisma.incomingLetter.create({
            data: {
                userId,
                images,
                description: description || null,
            },
        });

        // Send email notification to the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (user?.email) {
            await sendIncomingLetterNotificationEmail(user.email, user.name || "Değerli Kullanıcı");
        }

        return { success: true, letter };
    } catch (error) {
        console.error("CREATE_INCOMING_LETTER_ERROR", error);
        return { success: false, error: "Mektup oluşturulamadı." };
    }
}

// User: Get all incoming letters for the logged-in user
export async function getIncomingLetters() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: "Oturum açmalısınız." };
    }

    try {
        const letters = await prisma.incomingLetter.findMany({
            where: {
                user: { email: session.user.email },
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, letters };
    } catch (error) {
        console.error("GET_INCOMING_LETTERS_ERROR", error);
        return { success: false, error: "Mektuplar getirilemedi." };
    }
}

// User: Mark an incoming letter as read
export async function markIncomingLetterAsRead(letterId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: "Oturum açmalısınız." };
    }

    try {
        await prisma.incomingLetter.update({
            where: { id: letterId },
            data: { isRead: true },
        });
        return { success: true };
    } catch (error) {
        console.error("MARK_INCOMING_LETTER_READ_ERROR", error);
        return { success: false, error: "İşlem gerçekleştirilemedi." };
    }
}

// Admin: Search users by name or email
export async function searchUsersForAdmin(query: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
            },
            select: { id: true, name: true, email: true },
            take: 10,
        });
        return { success: true, users };
    } catch (error) {
        console.error("SEARCH_USERS_ERROR", error);
        return { success: false, error: "Arama yapılamadı." };
    }
}

// Admin: Get all incoming letters (for admin management page)
export async function getAllIncomingLetters() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        const letters = await prisma.incomingLetter.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
        return { success: true, letters };
    } catch (error) {
        console.error("GET_ALL_INCOMING_LETTERS_ERROR", error);
        return { success: false, error: "Mektuplar getirilemedi." };
    }
}
