"use server";

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends emails using Resend.
 * Ensure RESEND_API_KEY is defined in .env
 */
export async function sendEmail({
    to,
    subject,
    text,
    html
}: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) {
    // Falls back to logging if API key is missing
    if (!resend) {
        console.log(`[EMAIL_DRY_RUN] To: ${to} | Subject: ${subject}`);
        return { success: true, dryRun: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Mektuplas <onboarding@resend.dev>", // Replace with your verified domain
            to: [to],
            subject: subject,
            text: text,
            html: html || text,
        });

        if (error) {
            console.error("RESEND_ERROR", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("EMAIL_SEND_EXCEPTION", error);
        return { success: false, error };
    }
}

export async function sendOrderReceivedEmail(email: string, orderId: string) {
    return await sendEmail({
        to: email,
        subject: "Mektubunuz Alındı! - Mektuplas.com",
        text: `Mektubunuz başarıyla sistemimize ulaştı. Sipariş No: ${orderId}. Mektubunuzu hazırlamaya başladık.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a3728; font-family: 'Playfair Display', serif;">Mektubunuz Alındı!</h1>
                <p>Mektubunuz başarıyla sistemimize ulaştı ve nostaljik yolculuğuna başlamak üzere.</p>
                <div style="background: #fdfaf6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Sipariş No:</strong> <span style="color: #c48a5c;">#${orderId.toUpperCase()}</span></p>
                </div>
                <p>Mektubunuzu en kısa sürede özenle hazırlamaya başlayacağız. Süreci "Gönderilenler" sekmesinden takip edebilirsiniz.</p>
                <a href="https://mektuplas.com/gonderilenler" style="display: inline-block; background: #c48a5c; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Mektubumu Takip Et</a>
            </div>
        `
    });
}

export async function sendPreparingEmail(email: string, orderId: string) {
    return await sendEmail({
        to: email,
        subject: "Mektubunuz Hazırlanıyor! - Mektuplas.com",
        text: `Mektubunuz özenle hazırlanmaya başlandı. Sipariş No: ${orderId}.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a3728;">Mektubunuz Hazırlanıyor</h1>
                <p>Harika bir haber! Mektubunuzu hazırlamaya başladık.</p>
                <p>Zarfınız seçildi, kağıdınız hazırlandı ve mektubunuz nostaljik mühürle kapatılmak üzere sıraya alındı.</p>
                <div style="background: #fdfaf6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Sipariş No:</strong> #${orderId.toUpperCase()}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Durum:</strong> <span style="color: #f97316;">Hazırlanıyor</span></p>
                </div>
                <p>Mektubunuz kargoya verildiğinde size tekrar haber vereceğiz.</p>
            </div>
        `
    });
}

export async function sendTrackingCodeEmail(email: string, orderId: string, trackingCode: string) {
    const trackingUrl = `https://gonderitakip.ptt.gov.tr/Track/GetResult?barcode=${trackingCode}`;

    return await sendEmail({
        to: email,
        subject: "Mektubunuz Kargoya Verildi! - Mektuplas.com",
        text: `Siparişiniz kargoya verildi. Sipariş No: ${orderId}, Takip Kodu: ${trackingCode}. PTT Kargo üzerinden takip edebilirsiniz.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a3728;">Mektubunuz Yola Çıktı!</h1>
                <p>Beklenen an geldi! Mektubunuz kargoya verildi ve alıcısına doğru yola çıktı.</p>
                <div style="background: #fdfaf6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Sipariş No:</strong> #${orderId.toUpperCase()}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Takip Kodu:</strong> <code style="background: #eee; padding: 2px 5px; border-radius: 3px;">${trackingCode}</code></p>
                </div>
                <p>PTT Kargo üzerinden gönderinizi anlık olarak takip edebilirsiniz:</p>
                <a href="${trackingUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Kargomu Takip Et</a>
                <p style="font-size: 12px; color: #666; margin-top: 20px;">Not: Takip kodunun kargo sisteminde aktifleşmesi birkaç saat sürebilir.</p>
            </div>
        `
    });
} export async function sendCompletedEmail(email: string, orderId: string) {
    return await sendEmail({
        to: email,
        subject: "Mektubunuz Teslim Edildi! - Mektuplas.com",
        text: `Harika haber! Siparişinizdeki mektup alıcısına başarıyla teslim edildi. Sipariş No: ${orderId}.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a3728;">Mektubunuz Teslim Edildi! 📮</h1>
                <p>Beklenen an geldi! Mektubunuz alıcısına başarıyla ulaştı ve teslim edildi.</p>
                <div style="background: #fdfaf6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Sipariş No:</strong> #${orderId.toUpperCase()}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Durum:</strong> <span style="color: #10b981;">Teslim Edildi</span></p>
                </div>
                <p>Nostaljik bir dokunuşla duygularınızı iletmemize aracı olduğunuz için teşekkür ederiz.</p>
                <p>Yeni bir mektup yazmak isterseniz sizi her zaman bekleriz.</p>
                <a href="https://mektuplas.com/mektup-yaz" style="display: inline-block; background: #10b981; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Yeni Mektup Yaz</a>
            </div>
        `
    });
}

export async function sendInboxNotificationEmail(email: string, senderName: string) {
    return await sendEmail({
        to: email,
        subject: "Yeni Bir Mektubunuz Var! 📮 - Mektuplas.com",
        text: `${senderName} tarafından size yeni bir mektup gönderildi. Gelen kutunuzu kontrol edebilirsiniz.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a3728; font-family: serif;">Yeni Bir Mektubunuz Var! 📮</h1>
                <p>Heyecan verici bir haber! <strong>\${senderName}</strong> size mektuplas.com üzerinden yeni bir dijital mektup gönderdi.</p>
                <div style="background: #fdfaf6; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px dashed #c48a5c;">
                    <p style="margin: 0; font-size: 16px; color: #4a3728;">Duyguların kağıda dökülmüş hali dijital kapınızda bekliyor.</p>
                </div>
                <p>Mektubunuzu okumak ve PDF olarak indirmek için hemen gelen kutunuzu ziyaret edin:</p>
                <a href="https://mektuplas.com/gelen-kutusu" style="display: inline-block; background: #c48a5c; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Gelen Kutuma Git</a>
                <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                    Bildirim ayarlarınızı gelen kutusu sayfasından dilediğiniz zaman değiştirebilirsiniz.
                </p>
            </div>
        `
    });
}
