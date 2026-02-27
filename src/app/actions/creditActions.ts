"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreditService } from "@/services/creditService";
import prisma from "@/lib/prisma";

export async function getCreditBalanceAction() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        return { success: false, error: "Oturum açmalısınız." };
    }

    try {
        const userId = (session.user as any).id;
        const balance = await CreditService.getCreditBalance(userId);
        return { success: true, balance };
    } catch (error) {
        console.error("GET_CREDIT_BALANCE_ERROR", error);
        return { success: false, error: "Bakiye alınırken bir hata oluştu." };
    }
}

export async function getCreditTransactionsAction() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        return { success: false, error: "Oturum açmalısınız." };
    }

    try {
        const userId = (session.user as any).id;
        const transactions = await prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, transactions };
    } catch (error) {
        console.error("GET_CREDIT_TRANSACTIONS_ERROR", error);
        return { success: false, error: "İşlem geçmişi alınırken bir hata oluştu." };
    }
}
