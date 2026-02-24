"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveDraft(data: any, draftId?: string | null) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { error: "Kullanıcı bulunamadı." };
        }

        let finalDraftId;

        if (draftId) {
            // Update existing draft using updateMany to safely handle missing records (P2025)
            const updateResult = await prisma.draft.updateMany({
                where: { id: draftId, userId: user.id }, // Ensure user owns it
                data: { data: data }
            });

            if (updateResult.count > 0) {
                finalDraftId = draftId;
            } else {
                // Draft didn't exist or didn't belong to the user (e.g., cleared DB but local storage kept old token).
                // Gracefully fallback to creating a new one with the current data.
                const newDraft = await prisma.draft.create({
                    data: {
                        userId: user.id,
                        data: data
                    }
                });
                finalDraftId = newDraft.id;
            }
        } else {
            // Create new draft
            const newDraft = await prisma.draft.create({
                data: {
                    userId: user.id,
                    data: data
                }
            });
            finalDraftId = newDraft.id;
        }

        revalidatePath("/taslaklar");
        return { success: true, draftId: finalDraftId };
    } catch (error) {
        console.error("SAVE_DRAFT_ERROR", error);
        return { error: "Draft kaydedilemedi." };
    }
}

export async function getUserDrafts() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return [];
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return [];

        const drafts = await prisma.draft.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
        });

        return drafts;
    } catch (error) {
        console.error("GET_DRAFTS_ERROR", error);
        return [];
    }
}

export async function getDraft(draftId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return null;

        const draft = await prisma.draft.findUnique({
            where: { id: draftId, user: { email: session.user.email } } // verify ownership
        });

        return draft ? { ...draft.data as object, draftId: draft.id } : null;
    } catch (error) {
        console.error("GET_DRAFT_ERROR", error);
        return null;
    }
}

export async function deleteDraft(draftId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { error: "Unauthorized" };

        await prisma.draft.delete({
            where: { id: draftId, user: { email: session.user.email } } // verify ownership
        });

        revalidatePath("/taslaklar");
        return { success: true };
    } catch (error) {
        console.error("DELETE_DRAFT_ERROR", error);
        return { error: "Silinirken hata oluştu" };
    }
}
