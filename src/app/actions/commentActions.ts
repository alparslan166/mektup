"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      where: { parentId: null },
      include: {
        user: {
          select: { name: true, image: true },
        },
        replies: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
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
  rating,
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
    // İlk yorum mu kontrol et
    const existingCommentCount = await prisma.comment.count({
      where: { userId, parentId: null },
    });

    const comment = await prisma.comment.create({
      data: {
        title,
        body,
        rating,
        userId,
      },
    });

    // İlk yorum ise indirim bilgisini döndür
    if (existingCommentCount === 0) {
      const { getPricingSettings } = await import("./settingsActions");
      const pricingRes = await getPricingSettings();
      const discountPct = pricingRes.data?.commentRewardAmount ?? 10;

      return {
        success: true,
        data: comment,
        isFirstComment: true,
        discountPercentage: discountPct,
      };
    }

    return {
      success: true,
      data: comment,
      isFirstComment: false,
      discountPercentage: 0,
    };
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR", error);
    return { success: false, error: "Yorum gönderilirken bir hata oluştu." };
  }
}

export async function replyToComment({
  parentId,
  body,
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
        rating: 5, // Default rating for replies
      },
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
      where: { id: commentId },
    });

    return { success: true };
  } catch (error) {
    console.error("DELETE_COMMENT_ERROR", error);
    return { success: false, error: "Yorum silinirken bir hata oluştu." };
  }
}
