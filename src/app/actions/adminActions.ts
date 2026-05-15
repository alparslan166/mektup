"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  sendOrderReceivedEmail,
  sendTrackingCodeEmail,
  sendPreparingEmail,
  sendCompletedEmail,
} from "./emailActions";

export async function getAllLetters() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { error: "Yetkiniz yok." };
    }

    const letters = await prisma.letter.findMany({
      where: { receiverId: null }, // Only show physical letters in admin panel
      orderBy: { createdAt: "desc" }, // Newest at the top
      include: { user: true },
    });

    return { success: true, letters };
  } catch (error) {
    console.error("GET_ALL_LETTERS_ERROR", error);
    return { error: "Mektuplar getirilemedi." };
  }
}

export async function updateLetterStatus(letterId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { error: "Yetkiniz yok." };
    }

    const letter = await prisma.letter.update({
      where: { id: letterId },
      data: { status },
      include: { user: true },
    });

    const orderRef =
      ((letter.data as any)?.orderNumber as string | undefined) || letter.id;

    if (letter.user?.email) {
      if (status === "PAID") {
        await sendOrderReceivedEmail(letter.user.email, orderRef);
      } else if (status === "PREPARING") {
        await sendPreparingEmail(letter.user.email, orderRef);
      } else if (status === "SHIPPED") {
        await sendTrackingCodeEmail(
          letter.user.email,
          orderRef,
          letter.trackingCode || undefined,
        );
      } else if (status === "COMPLETED") {
        await sendCompletedEmail(letter.user.email, orderRef);
      }
    }

    revalidatePath("/admin/mektuplar");
    revalidatePath("/gonderilenler");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_LETTER_STATUS_ERROR", error);
    return { error: "Durum güncellenemedi." };
  }
}

export async function updateTrackingCode(
  letterId: string,
  trackingCode: string,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { error: "Yetkiniz yok." };
    }

    const updatedLetter = await prisma.letter.update({
      where: { id: letterId },
      data: {
        trackingCode,
        status: "SHIPPED",
      },
      include: { user: true },
    });

    const orderRef =
      ((updatedLetter.data as any)?.orderNumber as string | undefined) ||
      updatedLetter.id;

    if (updatedLetter.user?.email) {
      await sendTrackingCodeEmail(
        updatedLetter.user.email,
        orderRef,
        trackingCode,
      );
    }

    revalidatePath("/admin/mektuplar");
    revalidatePath("/gonderilenler");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_TRACKING_CODE_ERROR", error);
    return { error: "Takip kodu kaydedilemedi." };
  }
}
