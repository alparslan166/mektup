"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const COMPANY_ADDRESS_KEY = "company_reply_address";

// Get the company reply address
export async function getCompanyAddress(): Promise<{ success: boolean; address?: string }> {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: COMPANY_ADDRESS_KEY },
        });
        return { success: true, address: setting?.value || "" };
    } catch (error) {
        console.error("GET_COMPANY_ADDRESS_ERROR", error);
        return { success: false };
    }
}

// Admin: Update the company reply address
export async function updateCompanyAddress(address: string): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        await prisma.siteSetting.upsert({
            where: { key: COMPANY_ADDRESS_KEY },
            update: { value: address },
            create: { key: COMPANY_ADDRESS_KEY, value: address },
        });
        return { success: true };
    } catch (error) {
        console.error("UPDATE_COMPANY_ADDRESS_ERROR", error);
        return { success: false, error: "Adres güncellenemedi." };
    }
}
