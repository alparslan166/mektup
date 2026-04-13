"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createGiftOrder(data: {
  giftId: string;

  // Alıcı
  receiverName: string;
  addressText: string;
  city?: string;
  phone?: string;
  notes?: string;

  // Gönderici
  senderName?: string;
  senderCity?: string;
  senderAddress?: string;

  // Cezaevi detayları
  isPrison?: boolean;
  prisonName?: string;
  fatherName?: string;
  wardNumber?: string;
  prisonNote?: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: "Oturum açmanız gerekiyor." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { error: "Kullanıcı bulunamadı." };
    }

    const gift = await prisma.gift.findUnique({
      where: { id: data.giftId },
    });

    if (!gift) {
      return { error: "Hediye bulunamadı." };
    }

    const giftPrice = gift.price || 0;

    // Ödeme sağlayıcı entegrasyonu eklendiğinde bu adım gerçek tahsilatla değiştirilecek.

    // Ödeme başarıyla alınırsa GiftOrder tablosunu kaydet
    const order = await prisma.giftOrder.create({
      data: {
        userId: user.id,
        giftId: gift.id,

        // Alıcı
        receiverName: data.receiverName,
        addressText: data.addressText,
        city: data.city,
        phone: data.phone,
        notes: data.notes,

        // Gönderici
        senderName: data.senderName,
        senderCity: data.senderCity,
        senderAddress: data.senderAddress,

        // Cezaevi Detayları
        isPrison: data.isPrison || false,
        prisonName: data.prisonName,
        fatherName: data.fatherName,
        wardNumber: data.wardNumber,
        prisonNote: data.prisonNote,

        pricePaid: giftPrice,
        status: "PAID",
      },
    });

    // İsterse CreditTransaction'a Order ID verilebilir (düşüş sırasında vermedik ama sorun değil)

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("CREATE_GIFT_ORDER_ERROR:", error);
    return { error: "Siparişiniz oluşturulurken bir hata meydana geldi." };
  }
}
