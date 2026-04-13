"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function redeemReferralCode(code: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Lütfen önce giriş yapın." };
    }

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      return { success: false, error: "Lütfen bir kod girin." };
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { referredBy: true },
    });

    if (!currentUser) {
      return { success: false, error: "Kullanıcı bulunamadı." };
    }

    if (currentUser.referredById) {
      return {
        success: false,
        error: "Zaten bir referans kodu kullanmışsınız.",
      };
    }

    if (currentUser.referralCode === trimmedCode) {
      return {
        success: false,
        error: "Kendi referans kodunuzu kullanamazsınız.",
      };
    }

    // Find the user who owns this code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: trimmedCode },
    });

    if (!referrer) {
      return { success: false, error: "Geçersiz referans kodu." };
    }

    // Check if referrer already has a referral reward
    const existingReferrals = await prisma.user.count({
      where: { referredById: referrer.id },
    });

    if (existingReferrals >= 1) {
      return { success: false, error: "Bu kodun kullanım limiti dolmuştur." };
    }

    // Prevent reciprocal referrals (A refers B, B refers A)
    if (referrer.referredById === currentUser.id) {
      return { success: false, error: "Karşılıklı referans kullanılamaz." };
    }

    // Start a transaction to link users
    await prisma.$transaction(async (tx) => {
      // Update current user to link to referrer
      await tx.user.update({
        where: { id: currentUser.id },
        data: { referredById: referrer.id },
      });
    });

    // İndirim yüzdesini çek
    const { getPricingSettings } = await import("./settingsActions");
    const pricingRes = await getPricingSettings();
    const discountPct = pricingRes.data?.referralRewardAmount ?? 15;

    revalidatePath("/profil");
    return { success: true, message: "Referans kodu başarıyla uygulandı.", discountPercentage: discountPct };
  } catch (error) {
    console.error("REDEEM_REFERRAL_ERROR", error);
    return { success: false, error: "Bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
