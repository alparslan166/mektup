"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderReceivedEmail } from "./emailActions";

export async function createLetter(letterData: any) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { error: "Oturum açmanız gerekiyor." };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { error: "Kullanıcı bulunamadı." };
        }

        const { letter, extras, address } = letterData;

        // server-side price calculation for security
        const baseLetterPrice = 120;
        const scentPrice = extras.scent === "Yok" ? 0 : 20;
        const photoPrice = (extras.photos?.length || 0) * 10;
        const docPrice = (extras.documents?.length || 0) * 5;
        const postcardPrice = (extras.postcards?.length || 0) * 15;
        const calendarPrice = extras.includeCalendar ? ((extras.photos?.length || 0) >= 3 ? 0 : 30) : 0;
        const shippingPrice = 45;

        const totalAmount = baseLetterPrice + scentPrice + photoPrice + docPrice + postcardPrice + calendarPrice + shippingPrice;

        // 1. Create the permanent letter
        const createdLetter = await prisma.letter.create({
            data: {
                userId: user.id,
                data: letterData,
                status: "PAID",
                senderName: address.senderName,
                receiverName: address.receiverName,
                receiverCity: address.receiverCity,
                totalAmount: totalAmount
            }
        });

        // 2. Clear the draft
        await prisma.draft.deleteMany({
            where: { userId: user.id }
        });

        // 3. Send email notification
        if (user.email) {
            await sendOrderReceivedEmail(user.email, createdLetter.id);
        }

        return { success: true, letterId: createdLetter.id };
    } catch (error) {
        console.error("CREATE_LETTER_ERROR", error);
        return { error: "Mektup kaydedilemedi." };
    }
}

export async function getLetters() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return [];
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return [];

        return await prisma.letter.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("GET_LETTERS_ERROR", error);
        return [];
    }
}
