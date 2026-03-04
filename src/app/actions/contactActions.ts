"use server";

import prisma from "@/lib/prisma";

export async function getAdminWhatsAppNumber() {
    try {
        const admin = await prisma.user.findFirst({
            where: {
                role: "ADMIN",
                phone: {
                    not: null
                }
            },
            select: {
                phone: true
            }
        });

        if (admin && admin.phone) {
            return { success: true, phone: admin.phone };
        }

        // Fallback to a default number if no admin has a phone number set
        return { success: true, phone: "0 541 944 68 48" };
    } catch (error) {
        console.error("GET_ADMIN_WHATSAPP_ERROR", error);
        return { success: false, phone: "0 541 944 68 48" };
    }
}
