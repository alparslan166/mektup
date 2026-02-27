"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreditService } from "@/services/creditService";

export async function addCreditToUser(email: string, amount: number) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Bu işlemi yapmak için yetkiniz bulunmuyor." };
        }

        if (!email || amount <= 0) {
            return { error: "Geçerli bir e-posta ve miktar giriniz." };
        }

        const user = await prisma.user.findUnique({
            where: { email: email.trim() }
        });

        if (!user) {
            return { error: "Bu e-posta adresine sahip bir kullanıcı bulunamadı." };
        }

        const newBalance = await CreditService.addCredit(
            user.id,
            amount,
            "Sistem Yöneticisi tarafından (Admin Paneli) manuel bakiye yüklemesi",
            "ADMIN_PANEL_DEPOSIT"
        );

        return {
            success: true,
            message: `${user.name || user.email} hesabına başarıyla ${amount} 🪙 yüklendi. Yeni bakiye: ${newBalance} 🪙`
        };

    } catch (error: any) {
        console.error("ADD_CREDIT_ADMIN_ERROR:", error);
        return { error: error.message || "Bakiye yüklenirken beklenmeyen bir hata oluştu." };
    }
}

export async function searchUsers(query: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Yetkisiz işlem." };
        }

        if (!query || query.length < 2) {
            return { users: [] };
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } }
                ]
            },
            select: { id: true, email: true, name: true },
            take: 10
        });

        return { users };
    } catch (error: any) {
        console.error("SEARCH_USERS_ERROR:", error);
        return { error: error.message || "Kullanıcılar aranırken bir hata oluştu." };
    }
}
