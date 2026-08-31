"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  sendOrderReceivedEmail,
  sendInboxNotificationEmail,
} from "./emailActions";
import { getPricingSettings } from "./settingsActions";
import { getActiveDiscounts } from "./discountActions";

type LetterActionResult =
  | { success: true; letterId: string }
  | { error: string };

type AuthResult =
  | { user: { id: string; email: string | null } }
  | { error: string };

async function getAuthenticatedUser(senderEmail?: string): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    const emailToUse = senderEmail?.trim() || "misafir@mektup.com";
    const guestUser = await prisma.user.upsert({
      where: { email: emailToUse },
      update: {},
      create: {
        email: emailToUse,
        name: "Misafir Kullanıcı",
        role: "USER",
        termsAccepted: true,
      },
    });
    return { user: guestUser };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "Kullanıcı bulunamadı." };
  }

  return { user };
}

async function calculateLetterTotals(user: any, letter: any, extras: any) {
  const pricingRes = await getPricingSettings();

  const envelopePriceDelta =
    letter.envelopeColor !== "Beyaz"
      ? pricingRes.data?.envelopeColorPrice || 10
      : 0;
  const paperPriceDelta =
    letter.paperColor !== "Beyaz" ? pricingRes.data?.paperColorPrice || 10 : 0;

  let baseLetterPrice =
    (pricingRes.data?.letterSendPrice || 100) +
    envelopePriceDelta +
    paperPriceDelta;

  const isGuest = user.email === "misafir@mektup.com" || !user.password;

  const letterCount = isGuest
    ? 0
    : await prisma.letter.count({
        where: { userId: user.id },
      });

  const isFreeLetter = isGuest ? false : letterCount % 6 === 5;

  if (isFreeLetter) {
    baseLetterPrice = 0;
    console.log(
      `Hediye Mektup Uygulandı! Kullanıcı ID: ${user.id}, Mevcut Sayı: ${letterCount}`,
    );
  }

  const scentPrice =
    extras.scent === "Yok" ? 0 : pricingRes.data?.scentCreditPrice || 20;

  const photoCreditPrice = pricingRes.data?.photoCreditPrice || 10;
  const rawPhotoCount = extras.photos?.length || 0;
  let actualPhotoCount = rawPhotoCount;

  if (actualPhotoCount >= 10) {
    actualPhotoCount = actualPhotoCount - 2;
  } else if (actualPhotoCount >= 5) {
    actualPhotoCount = actualPhotoCount - 1;
  }

  let photoPrice = actualPhotoCount * photoCreditPrice;

  if (rawPhotoCount === 3 || rawPhotoCount === 4) {
    const discountedPhotoIndex = 8;
    photoPrice = (rawPhotoCount - 1) * photoCreditPrice + discountedPhotoIndex;
  }

  const docPrice =
    (extras.documents?.length || 0) * (pricingRes.data?.docCreditPrice || 5);

  const postcardCreditPrice = pricingRes.data?.postcardCreditPrice || 15;
  const rawPostcardCount = extras.postcards?.length || 0;
  let actualPostcardCount = rawPostcardCount;

  if (actualPostcardCount >= 10) {
    actualPostcardCount = actualPostcardCount - 2;
  } else if (actualPostcardCount >= 5) {
    actualPostcardCount = actualPostcardCount - 1;
  }

  let postcardPrice = actualPostcardCount * postcardCreditPrice;

  if (rawPostcardCount === 3 || rawPostcardCount === 4) {
    const discountedPostcardIndex = Math.round(postcardCreditPrice * 0.8);
    postcardPrice =
      (rawPostcardCount - 1) * postcardCreditPrice + discountedPostcardIndex;
  }

  const calendarPrice = extras.includeCalendar
    ? (extras.photos?.length || 0) >= 3
      ? 0
      : pricingRes.data?.calendarCreditPrice || 30
    : 0;

  const subtotalAmount =
    baseLetterPrice +
    scentPrice +
    photoPrice +
    docPrice +
    postcardPrice +
    calendarPrice;

  const discountRes = isGuest
    ? { bestDiscount: null }
    : await getActiveDiscounts();
  const bestDiscount = discountRes.bestDiscount;
  const discountPercentage = bestDiscount ? bestDiscount.percentage : 0;
  const discountAmount = Math.round(
    subtotalAmount * (discountPercentage / 100),
  );
  const taxableAmount = Math.max(0, subtotalAmount - discountAmount);
  const vatAmount = Math.round(taxableAmount * 0.2);
  const totalAmount = Math.max(1, taxableAmount + vatAmount);

  return {
    totalAmount,
    subtotalAmount,
    discountAmount,
    vatAmount,
    discountPercentage,
    appliedDiscount: bestDiscount?.type || null,
  };
}

async function markDiscountAsUsed(userId: string, discountType: string | null) {
  if (!discountType) return;

  if (discountType === "second_letter") {
    await prisma.user.update({
      where: { id: userId },
      data: { secondLetterRewardReceived: true },
    });
  } else if (discountType === "comment") {
    await prisma.user.update({
      where: { id: userId },
      data: { firstCommentRewardReceived: true },
    });
  }
}

async function completeLetterPayment(
  letterId: string,
): Promise<LetterActionResult> {
  const letter = await prisma.letter.findUnique({
    where: { id: letterId },
  });

  if (!letter) {
    return { error: "Mektup bulunamadı." };
  }

  if (letter.status === "PAID") {
    return { success: true, letterId: letter.id };
  }

  const finalizedLetter = await prisma.letter.update({
    where: { id: letter.id },
    data: { status: "PAID" },
  });

  const letterData = (letter.data as any) || {};
  const appliedDiscount =
    typeof letterData.appliedDiscount === "string"
      ? letterData.appliedDiscount
      : null;

  await markDiscountAsUsed(letter.userId, appliedDiscount);

  await prisma.draft.deleteMany({
    where: { userId: letter.userId },
  });

  const sender = await prisma.user.findUnique({
    where: { id: letter.userId },
    select: { email: true },
  });

  if (sender?.email) {
    const orderNumber =
      typeof letterData.orderNumber === "string" &&
      letterData.orderNumber.trim().length > 0
        ? letterData.orderNumber
        : finalizedLetter.id;
    await sendOrderReceivedEmail(sender.email, orderNumber);
  }

  if (letter.receiverId) {
    const receiver = await prisma.user.findUnique({
      where: { id: letter.receiverId },
      select: { email: true, inboxNotifications: true },
    });

    if (receiver && receiver.email && receiver.inboxNotifications) {
      await sendInboxNotificationEmail(receiver.email, letter.senderName || "");
    }
  }

  return { success: true, letterId: finalizedLetter.id };
}

export async function createPendingLetter(
  letterData: any,
): Promise<LetterActionResult> {
  try {
    const { letter, extras, address } = letterData;
    if (!letter || !extras || !address) {
      return { error: "Mektup bilgileri eksik." };
    }
    const senderEmail = address?.senderEmail;
    const auth = await getAuthenticatedUser(senderEmail);
    if ("error" in auth) return { error: auth.error };
    const { user } = auth;
    const orderNumber =
      typeof letterData.orderNumber === "string" &&
      letterData.orderNumber.trim().length > 0
        ? letterData.orderNumber.trim()
        : null;

    const pricing = await calculateLetterTotals(user, letter, extras);

    if (orderNumber) {
      const existingPending = await prisma.letter.findFirst({
        where: {
          userId: user.id,
          status: "PENDING_PAYMENT",
        },
        orderBy: { createdAt: "desc" },
      });

      const existingOrderNumber =
        existingPending?.data &&
        typeof existingPending.data === "object" &&
        "orderNumber" in existingPending.data
          ? (existingPending.data as Record<string, unknown>).orderNumber
          : null;

      if (existingPending && existingOrderNumber === orderNumber) {
        const updatedLetter = await prisma.letter.update({
          where: { id: existingPending.id },
          data: {
            receiverId: address.receiverId || null,
            data: {
              ...letterData,
              orderNumber,
              appliedDiscount: pricing.appliedDiscount,
              discountPercentage: pricing.discountPercentage,
              discountAmount: pricing.discountAmount,
              vatAmount: pricing.vatAmount,
              subtotalAmount: pricing.subtotalAmount,
            },
            senderName: address.senderName,
            receiverName: address.receiverName,
            receiverCity: address.receiverCity,
            totalAmount: pricing.totalAmount,
            inboxConsent: extras.wantReplyInInbox || false,
            inboxConsentDate: extras.inboxConsentDate
              ? new Date(extras.inboxConsentDate)
              : null,
          },
        });

        return { success: true, letterId: updatedLetter.id };
      }
    }

    const createdLetter = await prisma.letter.create({
      data: {
        userId: user.id,
        receiverId: address.receiverId || null,
        data: {
          ...letterData,
          orderNumber,
          appliedDiscount: pricing.appliedDiscount,
          discountPercentage: pricing.discountPercentage,
          discountAmount: pricing.discountAmount,
          vatAmount: pricing.vatAmount,
          subtotalAmount: pricing.subtotalAmount,
        },
        status: "PENDING_PAYMENT",
        senderName: address.senderName,
        receiverName: address.receiverName,
        receiverCity: address.receiverCity,
        totalAmount: pricing.totalAmount,
        inboxConsent: extras.wantReplyInInbox || false,
        inboxConsentDate: extras.inboxConsentDate
          ? new Date(extras.inboxConsentDate)
          : null,
      },
    });

    return { success: true, letterId: createdLetter.id };
  } catch (error) {
    console.error("CREATE_PENDING_LETTER_ERROR", error);
    return { error: "Mektup kaydedilemedi." };
  }
}

export async function finalizePendingLetter(
  letterId: string,
): Promise<LetterActionResult> {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) return { error: auth.error };
    const { user } = auth;

    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        userId: user.id,
      },
    });

    if (!letter) {
      return { error: "Mektup bulunamadı." };
    }

    return await completeLetterPayment(letter.id);
  } catch (error) {
    console.error("FINALIZE_PENDING_LETTER_ERROR", error);
    return { error: "Mektup kaydedilemedi." };
  }
}

export async function finalizePendingLetterBySystem(
  letterId: string,
): Promise<LetterActionResult> {
  try {
    return await completeLetterPayment(letterId);
  } catch (error) {
    console.error("FINALIZE_PENDING_LETTER_BY_SYSTEM_ERROR", error);
    return { error: "Mektup kaydedilemedi." };
  }
}

export async function createLetter(
  letterData: any,
): Promise<LetterActionResult> {
  const pendingResult = await createPendingLetter(letterData);
  if ("error" in pendingResult) {
    return { error: pendingResult.error || "Mektup kaydedilemedi." };
  }

  const finalizeResult = await finalizePendingLetter(pendingResult.letterId);
  if ("error" in finalizeResult) {
    return { error: finalizeResult.error || "Mektup kaydedilemedi." };
  }

  return { success: true, letterId: pendingResult.letterId };
}

export async function getLetters() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return [];

    return await prisma.letter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("GET_LETTERS_ERROR", error);
    return [];
  }
}

/**
 * Kullanıcının toplam ücretli mektup sayısını getirir (Kampanya takibi için)
 */
export async function getSentLetterCount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return 0;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return 0;

    return await prisma.letter.count({
      where: { userId: user.id },
    });
  } catch (error) {
    console.error("GET_SENT_LETTER_COUNT_ERROR", error);
    return 0;
  }
}
