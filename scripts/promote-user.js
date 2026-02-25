const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function promoteToAdmin(email) {
    if (!email) {
        console.error("Lütfen bir email adresi belirtin.");
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: "ADMIN" },
        });
        console.log(`Başarılı! ${email} kullanıcısı artık ADMİN.`);
    } catch (error) {
        console.error("Hata: Kullanıcı bulunamadı veya güncellenemedi.", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
promoteToAdmin(email);
