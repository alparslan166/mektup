"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; email: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const userId = (session.user as any).id;

        // Check if email is already taken by another user
        if (data.email !== session.user?.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                return { error: "bu e-posta adresi zaten kullanımda." };
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email
            }
        });

        revalidatePath("/profil");
        return { success: true };
    } catch (error) {
        console.error("UPDATE_PROFILE_ERROR", error);
        return { error: "Profil güncellenemedi." };
    }
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.password) {
            return { error: "Kullanıcı bulunamadı veya şifre tanımlı değil." };
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            return { error: "Mevcut şifre hatalı." };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("UPDATE_PASSWORD_ERROR", error);
        return { error: "Şifre güncellenemedi." };
    }
}

export async function getUserProfile() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).id) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        });

        if (!user) {
            return { error: "Kullanıcı bulunamadı." };
        }

        return { success: true, user };
    } catch (error) {
        console.error("GET_USER_PROFILE_ERROR", error);
        return { error: "Profil bilgileri alınamadı." };
    }
}

export async function acceptTermsAction() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Oturum açmanız gerekiyor." };
    }

    try {
        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                termsAccepted: true,
            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Accept terms error:", error);
        return { success: false, message: "Sözleşme onaylanırken bir hata oluştu." };
    }
}
