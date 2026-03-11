import React from "react";
import Link from "next/link";
import { ArrowLeft, Feather } from "lucide-react";

export const metadata = {
    title: "Hakkımızda | mektuplas.com",
    description: "mektuplas.com hikayesi ve kuruluş amacı.",
};

export default function HakkimizdaPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute opacity-10 top-12 right-12 pointer-events-none">
                    <Feather size={120} />
                </div>

                <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-wood-dark mb-8">
                    Hakkımızda
                </h1>

                <div className="prose prose-sm sm:prose-base text-ink max-w-none space-y-6">
                    <p className="text-lg leading-relaxed font-medium">
                        mektuplas.com dilediğiniz anda, kağıt ve kalem ile uğraşmadan kolayca mektup gönderebilmenizi sağlayan bir uygulamadır.
                    </p>

                    <p className="leading-relaxed">
                        Sitemiz üzerinden yazacağınız mektubun fiziki hali özel yazıcılar aracılığıyla basılıp zarflanır ve PTT aracılığı ile adrese teslim edilir. Aynı şekilde seçeceğiniz hediyeler özel paketlerimizle özenle paketlenip adrese teslim edilir.
                    </p>

                    <h2 className="font-playfair text-2xl font-bold text-wood mt-10 mb-4">Sistem Nasıl Çalışıyor?</h2>
                    <p className="leading-relaxed">
                        Yazdığınız mektuplar seçtiğiniz desenlerdeki kağıtlara basılır, yine fotoğraf ve kartpostal gibi diğer içeriklerle beraber, seçtiğiniz desenlerdeki zarflara konularak PTT ile dünyanın her yerindeki alıcıya ulaştırılır.
                    </p>
                </div>
            </div>
        </div>
    );
}
