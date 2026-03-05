"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderReceivedEmail, sendInboxNotificationEmail } from "./emailActions";
import { getPricingSettings } from "./settingsActions";
import { CreditService } from "@/services/creditService";

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

        // Fiyatlandırma ayarlarını çek
        const pricingRes = await getPricingSettings();

        // Zarf ve Kağıt Renk Farkı
        const envelopePriceDelta = letter.envelopeColor !== "Beyaz" ? (pricingRes.data?.envelopeColorPrice || 10) : 0;
        const paperPriceDelta = letter.paperColor !== "Beyaz" ? (pricingRes.data?.paperColorPrice || 10) : 0;

        let baseLetterPrice = (pricingRes.data?.letterSendPrice || 100) + envelopePriceDelta + paperPriceDelta;

        // Kampanya: Her 5. Mektup Ücretsiz
        // Kampanya: 5 Ücretli + 1 Hediye (Her 6. Mektup Ücretsiz)
        const letterCount = await prisma.letter.count({
            where: { userId: user.id }
        });

        // Eğer gönderilen mektup sayısı 5, 11, 17 gibi ise (5+1 döngüsü) bir sonraki (şu anki) hediye olur
        const isFreeLetter = (letterCount % 6) === 5;

        if (isFreeLetter) {
            baseLetterPrice = 0; // Sadece temel mektup ücreti 0 olur
            console.log(`Hediye Mektup Uygulandı! Kullanıcı ID: ${user.id}, Mevcut Sayı: ${letterCount}`);
        }

        const scentPrice = extras.scent === "Yok" ? 0 : (pricingRes.data?.scentCreditPrice || 20);

        // Fotoğraf Fiyat Algoritması (Review ve PaymentStep ile Aynı)
        const photoCreditPrice = pricingRes.data?.photoCreditPrice || 10;
        const rawPhotoCount = extras.photos?.length || 0;
        let actualPhotoCount = rawPhotoCount;
        let photoPrice = 0;

        if (actualPhotoCount >= 10) {
            actualPhotoCount = actualPhotoCount - 2;
        } else if (actualPhotoCount >= 5) {
            actualPhotoCount = actualPhotoCount - 1;
        }

        photoPrice = actualPhotoCount * photoCreditPrice;

        if (rawPhotoCount === 3 || rawPhotoCount === 4) {
            let discountedPhotoIndex = 8;
            photoPrice = (rawPhotoCount - 1) * photoCreditPrice + discountedPhotoIndex;
        }

        const docPrice = (extras.documents?.length || 0) * (pricingRes.data?.docCreditPrice || 5);

        // Kartpostal Fiyat Algoritması
        const postcardCreditPrice = pricingRes.data?.postcardCreditPrice || 15;
        const rawPostcardCount = extras.postcards?.length || 0;
        let actualPostcardCount = rawPostcardCount;
        let postcardPrice = 0;

        if (actualPostcardCount >= 10) {
            actualPostcardCount = actualPostcardCount - 2;
        } else if (actualPostcardCount >= 5) {
            actualPostcardCount = actualPostcardCount - 1;
        }

        postcardPrice = actualPostcardCount * postcardCreditPrice;

        if (rawPostcardCount === 3 || rawPostcardCount === 4) {
            let discountedPostcardIndex = Math.round(postcardCreditPrice * 0.8);
            postcardPrice = (rawPostcardCount - 1) * postcardCreditPrice + discountedPostcardIndex;
        }
        const calendarPrice = extras.includeCalendar ? ((extras.photos?.length || 0) >= 3 ? 0 : (pricingRes.data?.calendarCreditPrice || 30)) : 0;
        // const shippingPrice = 0; // Krediye Dahil

        const totalAmount = baseLetterPrice + scentPrice + photoPrice + docPrice + postcardPrice + calendarPrice;

        // Kredi düşümünü gerçekleştir (Bakiye yetersizse hata fırlatır)
        try {
            await CreditService.spendCredit(
                user.id,
                totalAmount,
                `${address.receiverName || "Alıcı"} kişisine mektup gönderimi ${isFreeLetter ? "(Hediye Mektup 🎁)" : ""}`
            );
        } catch (creditError: any) {
            return { error: creditError.message || "Bakiye işlemi başarısız.", isCreditError: true };
        }

        // 1. Create the permanent letter
        const createdLetter = await prisma.letter.create({
            data: {
                userId: user.id,
                receiverId: address.receiverId || null,
                data: letterData,
                status: "PAID",
                senderName: address.senderName,
                receiverName: address.receiverName,
                receiverCity: address.receiverCity,
                totalAmount: totalAmount,
                inboxConsent: extras.wantReplyInInbox || false,
                inboxConsentDate: extras.inboxConsentDate ? new Date(extras.inboxConsentDate) : null
            }
        });

        // 2. Clear the draft
        await prisma.draft.deleteMany({
            where: { userId: user.id }
        });

        // 2.5 Kampanya: İkinci Mektup Ödülü
        // Bu işlemi daha sağlıklı yapmak için kulannıcıyı tekrar çekip flag kontrolü yapıyoruz
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { secondLetterRewardReceived: true }
        });

        if (currentUser && !currentUser.secondLetterRewardReceived) {
            const letterCount = await prisma.letter.count({
                where: { userId: user.id }
            });

            if (letterCount >= 2) {
                const rewardAmount = pricingRes.data?.secondLetterRewardAmount || 50;
                await CreditService.addCredits(
                    user.id,
                    rewardAmount,
                    "İkinci Mektup Kampanya Ödülü 🎁"
                );

                // Flag'i güncelle
                await prisma.user.update({
                    where: { id: user.id },
                    data: { secondLetterRewardReceived: true }
                });
            }
        }

        // 3. Send email notifications
        if (user.email) {
            await sendOrderReceivedEmail(user.email, createdLetter.id);
        }

        // 4. Send DM notification to receiver if applicable
        if (address.receiverId) {
            const receiver = await prisma.user.findUnique({
                where: { id: address.receiverId },
                select: { email: true, inboxNotifications: true }
            });

            if (receiver && receiver.email && receiver.inboxNotifications) {
                await sendInboxNotificationEmail(receiver.email, address.senderName);
            }
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

/**
 * Kullanıcının toplam ücretli mektup sayısını getirir (Kampanya takibi için)
 */
export async function getSentLetterCount() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return 0;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return 0;

        return await prisma.letter.count({
            where: { userId: user.id }
        });
    } catch (error) {
        console.error("GET_SENT_LETTER_COUNT_ERROR", error);
        return 0;
    }
}
