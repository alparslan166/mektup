"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateGiftOrderStatus(orderId: string, newStatus: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return { error: "Yetkisiz işlem." };
        }

        const validStatuses = ["PAID", "PREPARING", "SHIPPED", "COMPLETED"];
        if (!validStatuses.includes(newStatus)) {
            return { error: "Geçersiz sipariş durumu." };
        }

        await prisma.giftOrder.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        revalidatePath("/admin/gifts/orders");
        return { success: true };
    } catch (error) {
        console.error("GIFT_ORDER_UPDATE_ERROR:", error);
        return { error: "Sipariş durumu güncellenirken hata oluştu." };
    }
}
