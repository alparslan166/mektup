"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getReceivedLetters() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any).id) {
            return { success: false, error: "Yetkisiz erişim." };
        }

        const userId = (session.user as any).id;

        const letters = await prisma.letter.findMany({
            where: {
                receiverId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, letters };
    } catch (error) {
        console.error("Error fetching received letters:", error);
        return { success: false, error: "Mektuplar yüklenirken bir hata oluştu." };
    }
}

export async function getNotificationPreference() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) return { success: false };

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: { inboxNotifications: true }
        });

        return { success: true, enabled: user?.inboxNotifications ?? true };
    } catch (error) {
        return { success: false };
    }
}

export async function toggleInboxNotifications(enabled: boolean) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) return { success: false, error: "Yetkisiz." };

        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: { inboxNotifications: enabled }
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Ayarlar güncellenemedi." };
    }
}

export async function searchUsers(query: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) return { success: false, error: "Yetkisiz." };

        if (query.length < 3) return { success: true, users: [] };

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } }
                ],
                NOT: {
                    id: (session.user as any).id
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: 5
        });

        return { success: true, users };
    } catch (error) {
        console.error("SEARCH_USERS_ERROR", error);
        return { success: false, error: "Kullanıcı aranamadı." };
    }
}
