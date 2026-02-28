import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CreditService } from "@/services/creditService";
import { getPricingSettings } from "@/app/actions/settingsActions";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "@/app/actions/emailActions";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { name, email, password, referralCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "Bu e-posta zaten kullanımda." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = nanoid(8);

        // Check if referred by someone
        let referredBy = null;
        if (referralCode) {
            referredBy = await prisma.user.findUnique({
                where: { referralCode },
            });
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                referralCode: newReferralCode,
                referredById: referredBy ? referredBy.id : null,
                emailVerified: null, // Set to null until verified
            },
        });

        // Award rewards even before verification to keep referral chain intact
        if (referredBy) {
            const pricing = await getPricingSettings();
            const rewardAmount = pricing.success && pricing.data ? pricing.data.referralRewardAmount : 15;

            // Award to referrer
            await CreditService.addCredits(
                referredBy.id,
                rewardAmount,
                `Yeni Arkadaş Davet Ödülü (${name}) 🤝`
            );

            // Award to new user
            await CreditService.addCredits(
                user.id,
                rewardAmount,
                "Hoş Geldin Referans Ödülü 🎊"
            );
        }

        // Create verification token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: token,
                expires: expires,
            },
        });

        // Send verification email
        await sendVerificationEmail(email, token);

        return NextResponse.json(
            { message: "Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
