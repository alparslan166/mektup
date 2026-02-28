"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreditService } from "@/services/creditService";
import { getPricingSettings } from "@/app/actions/settingsActions";
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
            include: { referredBy: true }
        });

        if (!currentUser) {
            return { success: false, error: "Kullanıcı bulunamadı." };
        }

        if (currentUser.referredById) {
            return { success: false, error: "Zaten bir referans kodu kullanmışsınız." };
        }

        if (currentUser.referralCode === trimmedCode) {
            return { success: false, error: "Kendi referans kodunuzu kullanamazsınız." };
        }

        // Find the user who owns this code
        const referrer = await prisma.user.findUnique({
            where: { referralCode: trimmedCode }
        });

        if (!referrer) {
            return { success: false, error: "Geçersiz referans kodu." };
        }

        // Prevent reciprocal referrals (A refers B, B refers A)
        if (referrer.referredById === currentUser.id) {
            return { success: false, error: "Karşılıklı referans kullanılamaz." };
        }

        // Get reward amount from settings
        const pricing = await getPricingSettings();
        const rewardAmount = pricing.success && pricing.data ? pricing.data.referralRewardAmount : 15;

        // Start a transaction to award credits and link users
        await prisma.$transaction(async (tx) => {
            // Update current user to link to referrer
            await tx.user.update({
                where: { id: currentUser.id },
                data: { referredById: referrer.id }
            });

            // Award credits to the referrer
            await CreditService.addCredits(
                referrer.id,
                rewardAmount,
                `Arkadaş Davet Ödülü (${currentUser.name || currentUser.email}) 🤝`,
                undefined,
                tx
            );

            // Award credits to the current user (referred)
            await CreditService.addCredits(
                currentUser.id,
                rewardAmount,
                "Hoş Geldin Referans Ödülü 🎊",
                undefined,
                tx
            );
        });

        revalidatePath("/profil");
        return { success: true, message: `Başarılı! ${rewardAmount} kredi hesabınıza yüklendi.` };

    } catch (error) {
        console.error("REDEEM_REFERRAL_ERROR", error);
        return { success: false, error: "Bir hata oluştu. Lütfen tekrar deneyin." };
    }
}
