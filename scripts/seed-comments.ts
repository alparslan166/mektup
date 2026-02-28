import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Mevcut yorumlar siliniyor...');
    await prisma.comment.deleteMany({});

    const users = await prisma.user.findMany({
        take: 10, // İlk 10 kullanıcıyı alalım yorum atanlar farklı görünsün
    });

    if (users.length === 0) {
        console.error('❌ Sistemde kullanıcı bulunamadı. Lütfen önce kullanıcı oluşturun.');
        return;
    }

    const commentBodies = [
        "Harika bir hizmet, mektubum çok hızlı ulaştı. Teşekkürler!",
        "Cezaevindeki yakınıma ulaşmak artık çok daha kolay. Çok memnun kaldım.",
        "Arayüz çok kullanışlı ve modern. Tebrikler.",
        "Mektup yazmak hiç bu kadar keyifli olmamıştı. Herkese tavsiye ederim.",
        "Hızlı ve güvenilir. Mektubun takibini yapabilmek çok güzel bir özellik.",
        "Mektupların kalitesi çok iyi. Bastırılan kağıtlar özenle seçilmiş belli.",
        "Mektubuma eklediğim fotoğraflar çok net çıkmış. Çok sağ olun.",
        "Müşteri hizmetleri çok ilgili, her soruma anında cevap aldım.",
        "Fiyatlar sunduğunuz hizmete göre oldukça uygun. Teşekkürler.",
        "Artık postaneye gitme derdi bitti. Evimden rahatça mektup gönderiyorum.",
        "Ödeme yöntemleri güvenli ve hızlı. Hiç sorun yaşamadım.",
        "Sitenin tasarımı çok hoşuma gitti, her şey elinizin altında.",
        "Mektuplar çok özenli paketleniyor, zarar görmeden ulaşıyor.",
        "Kredi sistemi çok mantıklı olmuş, kullanımı kolaylaştırıyor.",
        "Türkiye'nin her yerine bu kadar hızlı hizmet vermeniz takdire şayan.",
        "Gerçekten söz verdiğiniz gibi zamanında teslimat yapıyorsunuz.",
        "İçerideki sevdiklerimize ulaşmanın en modern yolu. Allah razı olsun.",
        "Uygulamanız hayatımızı kolaylaştırdı, teşekkür ederiz.",
        "Her şey mükemmel, hiçbir eksik yok. Tebrik ederim.",
        "Mektup içeriğini oluştururken sunduğunuz seçenekler çok zengin.",
        "Gelen cevapları sistemden okuyabilmek harika bir özellik.",
        "Sürekli kullanacağım bir platform, herkese öneriyorum.",
        "Mektup yazarken kendimi çok rahat hissettim, editör çok başarılı.",
        "Böyle bir hizmetin varlığı bizi çok mutlu etti.",
        "Zaman tasarrufu ve kolaylık bir arada. Harikasınız.",
        "Hizmet kalitenizden asla ödün vermeyin, çok memnunuz.",
        "Mektuplarımın her aşamasından haberdar oluyorum, içim çok rahat.",
        "Küçük bir sorun yaşamıştım ama ekip anında çözdü, ilginiz için teşekkürler.",
        "Emeği geçen herkese çok teşekkür ederim, çok hayırlı bir iş yapıyorsunuz.",
        "Kullanıcı deneyimi odaklı bir site olmuş, 5 yıldızı hak ediyor.",
        "Mektup yazmayı bana sevdiren uygulama, teşekkürler.",
        "Profesyonel bir ekip ile çalıştığınız belli, her şey çok düzenli.",
        "Siteniz mobil cihazlarda da çok iyi çalışıyor, her yerden erişebiliyorum.",
        "Mektuplar tam istediğim gibi ulaştı, baskı kalitesi şahane.",
        "Sistemin işleyişi çok şeffaf, güven veriyor.",
        "Her seferinde aynı özen ve hız, gerçekten şaşırtıcı.",
        "Yorumları okuyarak gelmiştim, gerçekten anlatıldığı kadar varmış.",
        "Başkalarına da anlatacağım, herkes bu kolaylıktan faydalanmalı.",
        "Dijitalleşen dünyada en anlamlı hizmetlerden biri.",
        "Artık sevdiklerimle aramdaki mesafe sadece bir tık.",
        "Hızlı kayıt, hızlı ödeme, hızlı gönderim. Tam istediğim gibi.",
        "Mektubun içine eklediğim kartpostal çok beğenilmiş, teşekkürler.",
        "Hizmetinizden çok memnunum, başarılarınızın devamını dilerim.",
        "Detaylara verdiğiniz önem için teşekkürler, her şey çok ince düşünülmüş.",
        "Gönül rahatlığıyla mektup gönderebileceğiniz tek adres."
    ];

    const titles = [
        "Mükemmel Hizmet", "Teşekkürler", "Harika Tasarım", "Hızlı Teslimat",
        "Çok Memnunum", "Kaliteli Baskı", "Güvenilir Platform", "Modern Çözüm",
        "Emeğinize Sağlık", "Tavsiye Ederim", "Kolay Kullanım", "İyi ki Varsınız"
    ];

    console.log('🌱 45 adet yorum ekleniyor...');

    for (let i = 0; i < 45; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomRating = Math.floor(Math.random() * 3) + 3; // 3, 4 veya 5
        const body = commentBodies[i % commentBodies.length];
        const title = titles[Math.floor(Math.random() * titles.length)];

        await prisma.comment.create({
            data: {
                userId: randomUser.id,
                title: title,
                body: body,
                rating: randomRating,
            }
        });
    }

    console.log('✅ Tohumlama başarıyla tamamlandı!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
