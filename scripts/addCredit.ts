import { PrismaClient } from '@prisma/client';
import { CreditService } from '../src/services/creditService';

const prisma = new PrismaClient();

async function main() {
    // 1. Terminalden gelen argümanları al (email ve miktar)
    const email = process.argv[2];
    const amount = Number(process.argv[3]);

    if (!email || isNaN(amount) || amount <= 0) {
        console.error("❌ Hatalı kullanım!");
        console.error("Doğru Kullanım: npx tsx scripts/addCredit.ts <kullanici_email> <miktar>");
        console.error("Örnek: npx tsx scripts/addCredit.ts musteri@gmail.com 500");
        process.exit(1);
    }

    try {
        // 2. Kullanıcıyı bul
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error(`❌ Hata: ${email} adresine sahip bir kullanıcı bulunamadı.`);
            process.exit(1);
        }

        // 3. Krediyi yükle (CreditService üzerinden transaction ve şifreleme ile)
        console.log(`⏳ ${email} hesabına ${amount} 🪙 yükleniyor...`);

        const newBalance = await CreditService.addCredit(
            user.id,
            amount,
            "Sistem Yöneticisi tarafından manuel bakiye yüklemesi",
            "MANUAL_DEPOSIT_SCRIPT"
        );

        console.log(`\n✅ İşlem Başarılı!`);
        console.log(`👤 Kullanıcı: ${user.name || user.email}`);
        console.log(`💰 Yüklenen: +${amount} 🪙`);
        console.log(`💳 Yeni Toplam Bakiye: ${newBalance} 🪙`);

    } catch (e: any) {
        console.error("\n❌ İşlem sırasında bir hata oluştu:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
