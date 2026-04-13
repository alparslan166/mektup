"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPricingSettings } from "./settingsActions";

export interface ActiveDiscount {
  type: "second_letter" | "referral" | "comment";
  label: string;
  percentage: number;
}

/**
 * Kullanıcının aktif indirimlerini kontrol eder.
 * Kampanyalar sayfasındaki kurallara göre:
 * 1. 2. Mektup İndirimi: Admin panelinde ayarlanan % (varsayılan %20)
 * 2. Referans İndirimi: Admin panelinde ayarlanan % (varsayılan %15)
 * 3. Yorum İndirimi: Admin panelinde ayarlanan % (varsayılan %10)
 *
 * Sadece en yüksek indirim uygulanır (birden fazla varsa en büyüğü kazanır).
 */
export async function getActiveDiscounts(): Promise<{
  success: boolean;
  discounts: ActiveDiscount[];
  bestDiscount: ActiveDiscount | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: true, discounts: [], bestDiscount: null };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        secondLetterRewardReceived: true,
        firstCommentRewardReceived: true,
        referredById: true,
      },
    });

    if (!user) {
      return { success: true, discounts: [], bestDiscount: null };
    }

    // Admin panelinden indirim yüzdelerini çek
    const pricingRes = await getPricingSettings();
    const secondLetterDiscountPct = pricingRes.data?.secondLetterRewardAmount ?? 20;
    const referralDiscountPct = pricingRes.data?.referralRewardAmount ?? 15;
    const commentDiscountPct = pricingRes.data?.commentRewardAmount ?? 10;

    const discounts: ActiveDiscount[] = [];

    // 1. İkinci Mektup İndirimi
    if (!user.secondLetterRewardReceived) {
      const letterCount = await prisma.letter.count({
        where: { userId: user.id },
      });

      if (letterCount === 1) {
        discounts.push({
          type: "second_letter",
          label: "2. Mektup İndirimi",
          percentage: secondLetterDiscountPct,
        });
      }
    }

    // 2. Referans İndirimi
    if (user.referredById) {
      const usedReferralDiscount = await prisma.letter.count({
        where: {
          userId: user.id,
          data: {
            path: ["appliedDiscount"],
            equals: "referral",
          },
        },
      });

      if (usedReferralDiscount === 0) {
        discounts.push({
          type: "referral",
          label: "Referans İndirimi",
          percentage: referralDiscountPct,
        });
      }
    } else {
      const referredCount = await prisma.user.count({
        where: { referredById: user.id },
      });

      if (referredCount > 0) {
        const usedReferralDiscount = await prisma.letter.count({
          where: {
            userId: user.id,
            data: {
              path: ["appliedDiscount"],
              equals: "referral",
            },
          },
        });

        if (usedReferralDiscount === 0) {
          discounts.push({
            type: "referral",
            label: "Referans İndirimi",
            percentage: referralDiscountPct,
          });
        }
      }
    }

    // 3. Yorum İndirimi
    if (!user.firstCommentRewardReceived) {
      const commentCount = await prisma.comment.count({
        where: { userId: user.id },
      });

      if (commentCount > 0) {
        discounts.push({
          type: "comment",
          label: "Yorum İndirimi",
          percentage: commentDiscountPct,
        });
      }
    }

    // En yüksek indirim
    const bestDiscount =
      discounts.length > 0
        ? discounts.reduce((max, d) =>
            d.percentage > max.percentage ? d : max,
          )
        : null;

    return { success: true, discounts, bestDiscount };
  } catch (error) {
    console.error("GET_ACTIVE_DISCOUNTS_ERROR", error);
    return { success: true, discounts: [], bestDiscount: null };
  }
}
