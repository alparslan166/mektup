import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
    title: "Gizlilik ve Güvenlik | Geleceğe Mektup",
    description: "Kişisel verilerinizin korunması ve gizlilik haklarınız.",
};

export default function GizlilikPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute opacity-5 top-12 right-12 pointer-events-none">
                    <Shield size={120} />
                </div>

                <h1 className="font-playfair text-4xl font-bold text-wood-dark mb-8 border-b border-paper-dark pb-6">
                    Gizlilik ve Güvenlik Politikası
                </h1>

                <div className="prose prose-sm sm:prose-base text-ink max-w-none space-y-6">
                    <p>
                        Geleceğe Mektup olarak müşterilerimizin güvenliğine ve gizliliğine son derece önem veriyoruz. Mektuplarınız, fotoğraflarınız ve kişisel bilgileriniz 256-Bit şifreleme yöntemleriyle güvenli sunucularda saklanmakta olup, yasal zorunluluklar haricinde hiçbir üçüncü şahıs veya kurumla paylaşılmamaktadır.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">1. Toplanan Veriler</h3>
                    <p>
                        Sistemimiz üzerinden mektup oluşturduğunuzda tarafımızca; Adınız Soyadınız, iletişim (telefon/e-posta) ve teslimat adresi bilgilerinizin yanı sıra mektubunuzun içeriği ve eklediğiniz dosyalar şifreli olarak veritabanımızda tutulur.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">2. Mahremiyet İlkesi</h3>
                    <p>
                        Yazdığınız mektupların içeriği operasyon ekibimiz dahil olmak üzere hiçbir çalışanımız veya 3. şahıs tarafından <strong>okunamaz</strong>. Mektuplar, otomatik paketleme sistemlerimizle doğrudan mühürlü zarflara aktarılır ve gizlilik kurallarına uygun olarak alıcısına gönderilmek üzere hazırlanır.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">3. Ödeme Güvenliği</h3>
                    <p>
                        Ödeme işlemlerinizde kullanılan kredi kartı bilgileri sistemimizde depolanmaz. Tüm ödemeler BDDK onaylı, 3D Secure ve SSL sertifikalı güvenli ödeme kuruluşları (PayTR, Iyzico vb.) aracılığıyla gerçekleştirilir.
                    </p>

                    <p className="text-sm text-ink-light italic mt-12 pt-6 border-t border-paper-dark">
                        Son Güncelleme: 1 Ocak 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
