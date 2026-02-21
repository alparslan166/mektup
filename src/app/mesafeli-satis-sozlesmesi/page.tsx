import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
    title: "Mesafeli Satış Sözleşmesi | Geleceğe Mektup",
    description: "Hizmet alımına dair yasal mesafeli satış sözleşmesi.",
};

export default function MesafeliSatisPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute opacity-5 top-12 right-12 pointer-events-none">
                    <FileText size={120} />
                </div>

                <h1 className="font-playfair text-4xl font-bold text-wood-dark mb-8 border-b border-paper-dark pb-6">
                    Mesafeli Satış Sözleşmesi
                </h1>

                <div className="prose prose-sm sm:prose-base text-ink max-w-none space-y-6">
                    <p>
                        İşbu Sözleşme, Geleceğe Mektup (bundan böyle &quot;Satıcı&quot; veya &quot;Hizmet Sağlayıcı&quot; olarak anılacaktır) ile platform üzerinden hizmet satın alan kullanıcı (bundan böyle &quot;Alıcı&quot; olarak anılacaktır) arasındaki Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince hak ve yükümlülükleri düzenlemektedir.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">MADDE 1 – TARAFLAR</h3>
                    <p>
                        <strong>1.1. SATICI:</strong> Unvanı: Geleceğe Mektup Hizmetleri A.Ş.<br />
                        Adres: Nostalji Mah. Kalem Sk. No: 1 Kadıköy / İstanbul<br />
                        E-posta: info@gelecegemektup.com.tr
                    </p>
                    <p>
                        <strong>1.2. ALICI:</strong> Tüketici kimliğiyle siteyi kullanan veya hizmeti satın alan tüzel/gerçek kişi. Alıcının iletişim ve fatura bilgileri, sipariş sistemine girilen veriler esas alınarak dikkate alınır.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">MADDE 2 – KONU</h3>
                    <p>
                        İşbu Sözleşme&apos;nin konusu, Alıcı&apos;nın Satıcı&apos;ya ait internet sitesi üzerinden elektronik ortamda siparişini yaptığı ve Alıcı tarafından belirlenen ileri bir tarihte mektup ve ekstralarının teslim edilmesi hizmetinin satışı ile teslimi hususundadır.
                    </p>

                    <h3 className="font-playfair text-xl font-bold text-wood mt-8 mb-3">MADDE 3 – HİZMETİN İFASI VE CAYMA HAKKI</h3>
                    <p>
                        Hizmet tabiatı gereği &quot;kişiye özel üretilen mallar&quot; kapsamına girmektedir. Alıcının talimatıyla mektup fiziksel olarak basılıp zarflandıktan sonra (siparişten sonraki 2 saat içerisinde) **İptal ve İade hakkı kullanılamaz.** Mektubun kargoya verilme süresine kadar adres değişikliği talebinde bulunulabilir.
                    </p>

                    <p className="border-l-4 border-seal/30 bg-seal/5 p-4 rounded-r mt-8 text-sm italic">
                        Alıcı, işbu Sözleşme&apos;yi elektronik ortamda onaylamakla, mesafeli sözleşmelerin akdinden önce, Satıcı tarafından tüketiciye verilmesi gereken adres, siparişi verilen hizmetlere ait temel özellikler, hizmetlerin vergiler dahil fiyatı ile ödeme ve teslimat bilgilerini doğru ve eksiksiz olarak edindiğini teyit eder.
                    </p>

                    <p className="text-sm text-ink-light italic mt-12 pt-6 border-t border-paper-dark">
                        Son Güncelleme: 1 Ocak 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
