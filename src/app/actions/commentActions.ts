"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreditService } from "@/services/creditService";

const COMMENT_REWARD_AMOUNT_KEY = "comment_reward_amount";

export async function getComments() {
    try {
        const comments = await prisma.comment.findMany({
            where: { parentId: null },
            include: {
                user: {
                    select: { name: true, image: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { name: true, image: true }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: comments };
    } catch (error) {
        console.error("GET_COMMENTS_ERROR", error);
        return { success: false, error: "Yorumlar alınırken bir hata oluştu." };
    }
}

export async function createComment({
    title,
    body,
    rating
}: {
    title?: string;
    body: string;
    rating: number;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
        return { success: false, error: "Yorum yapmak için giriş yapmalısınız." };
    }

    const userId = (session.user as any).id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create the comment
            const comment = await tx.comment.create({
                data: {
                    title,
                    body,
                    rating,
                    userId
                }
            });

            // Check for reward
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { firstCommentRewardReceived: true }
            });

            let rewardApplied = false;
            let rewardAmount = 0;

            if (user && !user.firstCommentRewardReceived) {
                const rewardSetting = await tx.siteSetting.findUnique({
                    where: { key: COMMENT_REWARD_AMOUNT_KEY }
                });

                rewardAmount = rewardSetting?.value ? parseFloat(rewardSetting.value) : 50;

                // Add credits
                await CreditService.addCredits(userId, rewardAmount, "Yorum Ödülü", comment.id, tx as any);

                // Mark reward as received
                await tx.user.update({
                    where: { id: userId },
                    data: { firstCommentRewardReceived: true }
                });

                rewardApplied = true;
            }

            return { comment, rewardApplied, rewardAmount };
        });

        return { success: true, data: result.comment, rewardApplied: result.rewardApplied, rewardAmount: result.rewardAmount };
    } catch (error) {
        console.error("CREATE_COMMENT_ERROR", error);
        return { success: false, error: "Yorum gönderilirken bir hata oluştu." };
    }
}

export async function replyToComment({
    parentId,
    body
}: {
    parentId: string;
    body: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
        return { success: false, error: "Yanıt vermek için giriş yapmalısınız." };
    }

    const userId = (session.user as any).id;

    try {
        const reply = await prisma.comment.create({
            data: {
                body,
                parentId,
                userId,
                rating: 5 // Default rating for replies
            }
        });

        return { success: true, data: reply };
    } catch (error) {
        console.error("REPLY_TO_COMMENT_ERROR", error);
        return { success: false, error: "Yanıt gönderilirken bir hata oluştu." };
    }
}

export async function deleteComment(commentId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Bu işlem için yetkiniz yok." };
    }

    try {
        // Delete the comment and its replies
        // If the schema has onDelete: Cascade, this is simple. 
        // Otherwise we delete replies first.
        await prisma.comment.delete({
            where: { id: commentId }
        });

        return { success: true };
    } catch (error) {
        console.error("DELETE_COMMENT_ERROR", error);
        return { success: false, error: "Yorum silinirken bir hata oluştu." };
    }
}
