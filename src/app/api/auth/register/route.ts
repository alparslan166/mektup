import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CreditService } from "@/services/creditService";
import { getPricingSettings } from "@/app/actions/settingsActions";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
    try {
        const { name, email, password, referralCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Eksik bilgi girdiniz." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Bu e-posta adresi zaten kullanımda." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a referral code for the new user
        const newReferralCode = nanoid(8);

        // Check if there's a referrer
        let referrerId = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: referralCode }
            });
            if (referrer) {
                referrerId = referrer.id;
            }
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                referralCode: newReferralCode,
                referredById: referrerId
            },
        });

        // Award rewards if there's a referrer
        if (referrerId) {
            const pricing = await getPricingSettings();
            const rewardAmount = pricing.success && pricing.data ? pricing.data.referralRewardAmount : 15;

            // Award to referrer
            await CreditService.addCredits(
                referrerId,
                rewardAmount,
                `Yeni Arkadaş Davet Ödülü (${name}) 🤝`
            );

            // Award to referred user
            await CreditService.addCredits(
                user.id,
                rewardAmount,
                "Hoş Geldin Referans Ödülü 🎊"
            );
        }

        return NextResponse.json(
            { message: "Kullanıcı başarıyla oluşturuldu.", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("REGISTRATION_ERROR", error);
        return NextResponse.json(
            { message: "Sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
