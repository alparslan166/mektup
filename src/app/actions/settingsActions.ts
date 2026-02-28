"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const COMPANY_ADDRESS_KEY = "company_reply_address";
const LETTER_SEND_PRICE_KEY = "letter_send_price";
const INCOMING_LETTER_OPEN_PRICE_KEY = "incoming_letter_open_price";
const PHOTO_CREDIT_PRICE_KEY = "photo_credit_price";
const POSTCARD_CREDIT_PRICE_KEY = "postcard_credit_price";
const SCENT_CREDIT_PRICE_KEY = "scent_credit_price";
const DOC_CREDIT_PRICE_KEY = "doc_credit_price";
const CALENDAR_CREDIT_PRICE_KEY = "calendar_credit_price";
const ENVELOPE_COLOR_PRICE_KEY = "envelope_color_price";
const PAPER_COLOR_PRICE_KEY = "paper_color_price";
const COMMENT_REWARD_AMOUNT_KEY = "comment_reward_amount";
const SECOND_LETTER_REWARD_AMOUNT_KEY = "second_letter_reward_amount";
const REFERRAL_REWARD_AMOUNT_KEY = "referral_reward_amount";

// Get the company reply address
export async function getCompanyAddress(): Promise<{ success: boolean; address?: string }> {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: COMPANY_ADDRESS_KEY },
        });
        return { success: true, address: setting?.value || "" };
    } catch (error) {
        console.error("GET_COMPANY_ADDRESS_ERROR", error);
        return { success: false };
    }
}

// Admin: Update the company reply address
export async function updateCompanyAddress(address: string): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        await prisma.siteSetting.upsert({
            where: { key: COMPANY_ADDRESS_KEY },
            update: { value: address },
            create: { key: COMPANY_ADDRESS_KEY, value: address },
        });
        return { success: true };
    } catch (error) {
        console.error("UPDATE_COMPANY_ADDRESS_ERROR", error);
        return { success: false, error: "Adres güncellenemedi." };
    }
}

// Get Pricing Settings
export async function getPricingSettings(): Promise<{
    success: boolean;
    data?: {
        letterSendPrice: number;
        incomingLetterOpenPrice: number;
        photoCreditPrice: number;
        postcardCreditPrice: number;
        scentCreditPrice: number;
        docCreditPrice: number;
        calendarCreditPrice: number;
        envelopeColorPrice: number;
        paperColorPrice: number;
        commentRewardAmount: number;
        secondLetterRewardAmount: number;
        referralRewardAmount: number;
    }
}> {
    try {
        const [sendSetting, openSetting, photoSetting, postcardSetting, scentSetting, docSetting, calendarSetting, envelopeColorSetting, paperColorSetting, commentRewardAmountSetting, secondLetterRewardAmountSetting, referralRewardAmountSetting] = await Promise.all([
            prisma.siteSetting.findUnique({ where: { key: LETTER_SEND_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: INCOMING_LETTER_OPEN_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: PHOTO_CREDIT_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: POSTCARD_CREDIT_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: SCENT_CREDIT_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: DOC_CREDIT_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: CALENDAR_CREDIT_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: ENVELOPE_COLOR_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: PAPER_COLOR_PRICE_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: COMMENT_REWARD_AMOUNT_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: SECOND_LETTER_REWARD_AMOUNT_KEY } }),
            prisma.siteSetting.findUnique({ where: { key: REFERRAL_REWARD_AMOUNT_KEY } }),
        ]);

        return {
            success: true,
            data: {
                letterSendPrice: sendSetting?.value ? parseFloat(sendSetting.value) : 100, // Varsayılan 100 kredi
                incomingLetterOpenPrice: openSetting?.value ? parseFloat(openSetting.value) : 50, // Varsayılan 50 kredi
                photoCreditPrice: photoSetting?.value ? parseFloat(photoSetting.value) : 10, // Varsayılan 10 kredi
                postcardCreditPrice: postcardSetting?.value ? parseFloat(postcardSetting.value) : 15, // Varsayılan 15 kredi
                scentCreditPrice: scentSetting?.value ? parseFloat(scentSetting.value) : 20, // Varsayılan 20 kredi
                docCreditPrice: docSetting?.value ? parseFloat(docSetting.value) : 5, // Varsayılan 5 kredi
                calendarCreditPrice: calendarSetting?.value ? parseFloat(calendarSetting.value) : 30, // Varsayılan 30 kredi
                envelopeColorPrice: envelopeColorSetting?.value ? parseFloat(envelopeColorSetting.value) : 10, // Varsayılan 10 kredi
                paperColorPrice: paperColorSetting?.value ? parseFloat(paperColorSetting.value) : 10, // Varsayılan 10 kredi
                commentRewardAmount: commentRewardAmountSetting?.value ? parseFloat(commentRewardAmountSetting.value) : 50, // Varsayılan 50 kredi ödül
                secondLetterRewardAmount: secondLetterRewardAmountSetting?.value ? parseFloat(secondLetterRewardAmountSetting.value) : 50, // Varsayılan 50 kredi ödül
                referralRewardAmount: referralRewardAmountSetting?.value ? parseFloat(referralRewardAmountSetting.value) : 15, // Varsayılan 15 kredi ödül
            }
        };
    } catch (error) {
        console.error("GET_PRICING_SETTINGS_ERROR", error);
        return { success: false };
    }
}

// Admin: Update Pricing Settings
export async function updatePricingSettings(
    letterSendPrice: number,
    incomingLetterOpenPrice: number,
    photoCreditPrice: number,
    postcardCreditPrice: number,
    scentCreditPrice: number,
    docCreditPrice: number,
    calendarCreditPrice: number,
    envelopeColorPrice: number,
    paperColorPrice: number,
    commentRewardAmount: number,
    secondLetterRewardAmount: number,
    referralRewardAmount: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Yetkiniz yok." };
    }

    try {
        await prisma.$transaction([
            prisma.siteSetting.upsert({
                where: { key: LETTER_SEND_PRICE_KEY },
                update: { value: letterSendPrice.toString() },
                create: { key: LETTER_SEND_PRICE_KEY, value: letterSendPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: INCOMING_LETTER_OPEN_PRICE_KEY },
                update: { value: incomingLetterOpenPrice.toString() },
                create: { key: INCOMING_LETTER_OPEN_PRICE_KEY, value: incomingLetterOpenPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: PHOTO_CREDIT_PRICE_KEY },
                update: { value: photoCreditPrice.toString() },
                create: { key: PHOTO_CREDIT_PRICE_KEY, value: photoCreditPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: POSTCARD_CREDIT_PRICE_KEY },
                update: { value: postcardCreditPrice.toString() },
                create: { key: POSTCARD_CREDIT_PRICE_KEY, value: postcardCreditPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: SCENT_CREDIT_PRICE_KEY },
                update: { value: scentCreditPrice.toString() },
                create: { key: SCENT_CREDIT_PRICE_KEY, value: scentCreditPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: DOC_CREDIT_PRICE_KEY },
                update: { value: docCreditPrice.toString() },
                create: { key: DOC_CREDIT_PRICE_KEY, value: docCreditPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: CALENDAR_CREDIT_PRICE_KEY },
                update: { value: calendarCreditPrice.toString() },
                create: { key: CALENDAR_CREDIT_PRICE_KEY, value: calendarCreditPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: ENVELOPE_COLOR_PRICE_KEY },
                update: { value: envelopeColorPrice.toString() },
                create: { key: ENVELOPE_COLOR_PRICE_KEY, value: envelopeColorPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: PAPER_COLOR_PRICE_KEY },
                update: { value: paperColorPrice.toString() },
                create: { key: PAPER_COLOR_PRICE_KEY, value: paperColorPrice.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: COMMENT_REWARD_AMOUNT_KEY },
                update: { value: commentRewardAmount.toString() },
                create: { key: COMMENT_REWARD_AMOUNT_KEY, value: commentRewardAmount.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: SECOND_LETTER_REWARD_AMOUNT_KEY },
                update: { value: secondLetterRewardAmount.toString() },
                create: { key: SECOND_LETTER_REWARD_AMOUNT_KEY, value: secondLetterRewardAmount.toString() },
            }),
            prisma.siteSetting.upsert({
                where: { key: REFERRAL_REWARD_AMOUNT_KEY },
                update: { value: referralRewardAmount.toString() },
                create: { key: REFERRAL_REWARD_AMOUNT_KEY, value: referralRewardAmount.toString() },
            })
        ]);

        return { success: true };
    } catch (error) {
        console.error("UPDATE_PRICING_SETTINGS_ERROR", error);
        return { success: false, error: "Fiyatlandırma ayarları güncellenemedi." };
    }
}
