"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendIncomingLetterNotificationEmail } from "@/app/actions/emailActions";
import { getPricingSettings } from "./settingsActions";
import { CreditService } from "@/services/creditService";

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

        const mappedLetters = letters.map(letter => ({
            ...letter,
            images: letter.isRead ? letter.images : [], // Hide images if not read yet
            imageCount: letter.images?.length || 0
        }));

        return { success: true, letters: mappedLetters };
    } catch (error) {
        console.error("GET_INCOMING_LETTERS_ERROR", error);
        return { success: false, error: "Mektuplar getirilemedi." };
    }
}

// User: Mark an incoming letter as read (and deduct credits)
export async function markIncomingLetterAsRead(letterId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: "Oturum açmalısınız." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return { success: false, error: "Kullanıcı bulunamadı." };
        }

        const letter = await prisma.incomingLetter.findUnique({
            where: { id: letterId }
        });

        if (!letter) {
            return { success: false, error: "Mektup bulunamadı." };
        }

        if (letter.isRead) {
            return { success: true }; // Already read, no charge
        }

        // Fiyatı getir
        const pricingRes = await getPricingSettings();
        const openPrice = pricingRes.data?.incomingLetterOpenPrice || 50;

        // Krediyi düşür
        try {
            await CreditService.spendCredit(
                user.id,
                openPrice,
                "Gelen mektup okuma bedeli",
                letterId
            );
        } catch (creditError: any) {
            return { success: false, error: creditError.message || "Bakiye işlemi başarısız.", isCreditError: true, requiredCredit: openPrice };
        }

        // Başarılıysa okundu işaretle (Atomic olarak yalnız isRead=false olanları günceller)
        const updateResult = await prisma.incomingLetter.updateMany({
            where: { id: letterId, isRead: false },
            data: { isRead: true },
        });

        // Eğer update edilemediyse (başka bir istek bizden önce update etmiş demektir), krediyi iade et
        if (updateResult.count === 0) {
            await CreditService.refundCredit(
                user.id,
                openPrice,
                "Mektup kilidi çifte çekim iptali iadesi",
                letterId
            );
            return { success: true };
        }

        // Update başarılı oldu, güncel mektubu döndür
        const updatedLetter = await prisma.incomingLetter.findUnique({
            where: { id: letterId }
        });

        return { success: true, letter: updatedLetter };
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
