"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

// Category Actions
export async function getCategories() {
    try {
        return await prisma.giftCategory.findMany({
            include: {
                gifts: {
                    orderBy: {
                        order: "asc"
                    }
                }
            },
            orderBy: {
                order: "asc"
            }
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(name: string) {
    await ensureAdmin();
    const category = await prisma.giftCategory.create({
        data: { name }
    });
    revalidatePath("/admin/gifts");
    revalidatePath("/hediyeler");
    return category;
}

export async function updateCategory(id: string, name: string) {
    await ensureAdmin();
    const category = await prisma.giftCategory.update({
        where: { id },
        data: { name }
    });
    revalidatePath("/admin/gifts");
    revalidatePath("/hediyeler");
    return category;
}

export async function deleteCategory(id: string) {
    await ensureAdmin();
    await prisma.giftCategory.delete({
        where: { id }
    });
    revalidatePath("/admin/gifts");
    revalidatePath("/hediyeler");
}

// Gift Actions
export async function createGift(data: { name: string; description?: string; price?: number; image?: string; categoryId: string }) {
    await ensureAdmin();
    const gift = await prisma.gift.create({
        data
    });
    revalidatePath("/admin/gifts");
    revalidatePath("/hediyeler");
    return gift;
}

export async function updateGift(id: string, data: { name: string; description?: string; price?: number; image?: string }) {
    await ensureAdmin();
    console.log("UPDATING GIFT:", { id, data });
    try {
        const gift = await prisma.gift.update({
            where: { id },
            data
        });
        console.log("UPDATE SUCCESSFUL:", gift.id);
        revalidatePath("/admin/gifts");
        revalidatePath("/hediyeler");
        return gift;
    } catch (error) {
        console.error("PRISMA UPDATE ERROR:", error);
        throw error;
    }
}

export async function deleteGift(id: string) {
    await ensureAdmin();
    await prisma.gift.delete({
        where: { id }
    });
    revalidatePath("/admin/gifts");
    revalidatePath("/hediyeler");
}

export async function reorderCategories(ids: string[]) {
    await ensureAdmin();
    try {
        // Use a transaction to update all orders
        await prisma.$transaction(
            ids.map((id, index) =>
                prisma.giftCategory.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );
        revalidatePath("/admin/gifts");
        revalidatePath("/hediyeler");
    } catch (error) {
        console.error("Error reordering categories:", error);
        throw error;
    }
}

export async function reorderGifts(ids: string[]) {
    await ensureAdmin();
    try {
        await prisma.$transaction(
            ids.map((id, index) =>
                prisma.gift.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );
        revalidatePath("/admin/gifts");
        revalidatePath("/hediyeler");
    } catch (error) {
        console.error("Error reordering gifts:", error);
        throw error;
    }
}
