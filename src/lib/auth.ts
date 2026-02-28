import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";
import { CreditService } from "@/services/creditService";
import { getPricingSettings } from "@/app/actions/settingsActions";
import { nanoid } from "nanoid";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            // This event runs when a user is created via an adapter (Google Login)
            const cookieStore = await cookies();
            const referralCode = cookieStore.get("next-auth.referral-code")?.value;
            const newReferralCode = nanoid(8);

            let referrerId: string | null = null;
            if (referralCode) {
                const referrer = await prisma.user.findUnique({
                    where: { referralCode }
                });
                if (referrer) {
                    referrerId = referrer.id;
                }
            }

            // Update user with referral code and referrer
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    referralCode: newReferralCode,
                    referredById: referrerId
                }
            });

            // Award rewards if there's a referrer
            if (referrerId) {
                const pricing = await getPricingSettings();
                const rewardAmount = pricing.success && pricing.data ? pricing.data.referralRewardAmount : 15;

                // Award to referrer
                await CreditService.addCredits(
                    referrerId,
                    rewardAmount,
                    `Yeni Arkadaş Davet Ödülü (${user.name}) 🤝`
                );

                // Award to new user
                await CreditService.addCredits(
                    user.id,
                    rewardAmount,
                    "Hoş Geldin Referans Ödülü 🎊"
                );
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
