"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
        throw new Error("Yetkisiz işlem.");
    }
    return session;
}

export async function getFAQs() {
    try {
        return await prisma.faq.findMany({
            orderBy: { order: "asc" }
        });
    } catch (error) {
        console.error("GET_FAQS_ERROR", error);
        return [];
    }
}

export async function addFAQ(question: string, answer: string, order: number = 0) {
    try {
        await checkAdmin();
        const faq = await prisma.faq.create({
            data: { question, answer, order }
        });
        revalidatePath("/sss");
        return { success: true, data: faq };
    } catch (error: any) {
        console.error("ADD_FAQ_ERROR", error);
        return { success: false, error: error.message };
    }
}

export async function updateFAQ(id: string, question: string, answer: string, order: number) {
    try {
        await checkAdmin();
        const faq = await prisma.faq.update({
            where: { id },
            data: { question, answer, order }
        });
        revalidatePath("/sss");
        return { success: true, data: faq };
    } catch (error: any) {
        console.error("UPDATE_FAQ_ERROR", error);
        return { success: false, error: error.message };
    }
}

export async function deleteFAQ(id: string) {
    try {
        await checkAdmin();
        await prisma.faq.delete({
            where: { id }
        });
        revalidatePath("/sss");
        return { success: true };
    } catch (error: any) {
        console.error("DELETE_FAQ_ERROR", error);
        return { success: false, error: error.message };
    }
}

export async function seedFAQs(faqs: { question: string, answer: string, order: number }[]) {
    try {
        await checkAdmin();
        // Clear existing? Or just add? User said "kaydet kenara seed ile yükleriz"
        // Let's create them if they don't exist
        for (const faq of faqs) {
            await prisma.faq.create({
                data: faq
            });
        }
        revalidatePath("/sss");
        return { success: true };
    } catch (error: any) {
        console.error("SEED_FAQS_ERROR", error);
        return { success: false, error: error.message };
    }
}
