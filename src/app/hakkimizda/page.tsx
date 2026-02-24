import React from "react";
import Link from "next/link";
import { ArrowLeft, Feather } from "lucide-react";

export const metadata = {
    title: "Hakkımızda | Geleceğe Mektup",
    description: "Geleceğe Mektup platformunun hikayesi ve kuruluş amacı.",
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
                    Hikayemiz
                </h1>

                <div className="prose prose-sm sm:prose-base text-ink max-w-none space-y-6">
                    <p className="text-lg leading-relaxed font-medium">
                        Her şey, dijitalleşen dünyada kaybettiğimiz o somut, dokunulabilir anıları geri getirme arzusuyla başladı. Hızla akıp giden zamanın içinde, duygularımızı bir kağıda dökmenin ve o kağıdın yıllar sonra bir posta kutusunda belirmesinin büyüsüne inanıyoruz.
                    </p>

                    <p className="leading-relaxed">
                        Geleceğe Mektup, sevdiklerinize veya kendinize, zamanın ötesinde bir hediye vermeniz için tasarlandı. Sadece bir mesaj göndermiyoruz; o mesajın yazıldığı anki hisleri, özenle seçilmiş kağıdın dokusunu, zarfın kokusunu ve o nostaljik bekleyiş heyecanını mühürleyip geleceğe taşıyoruz.
                    </p>

                    <h2 className="font-playfair text-2xl font-bold text-wood mt-10 mb-4">Amacımız</h2>
                    <p className="leading-relaxed">
                        Dijital mesajların saniyeler içinde unutulduğu bir çağda, kalıcı izler bırakmak. Yazının gücünü fiziksel bir deneyimle birleştirerek, insanların hayatında tebessüm yaratacak, saklanmaya değer anılar oluşturmak.
                    </p>

                    <div className="bg-paper-light border-l-4 border-seal p-6 my-8 rounded-r-lg italic">
                        &quot;Bir mektup, ruhlar arasındaki en samimi köprüdür.&quot;
                    </div>

                    <h2 className="font-playfair text-2xl font-bold text-wood mt-10 mb-4">Nasıl Çalışıyoruz?</h2>
                    <p className="leading-relaxed">
                        Siz duygularınızı kelimelere dökersiniz, biz ise o kelimeleri en yüksek kalitede kağıtlar, özenle seçilmiş zarflar ve nostaljik kokularla fiziksel bir mektuba dönüştürürüz. Belirlediğiniz tarih geldiğinde, mektubunuz güvenli bir şekilde alıcısına ulaştırılmak üzere yola çıkar. Modern dünyanın hızından uzak, eski zamanların zarafetiyle...
                    </p>
                </div>
            </div>
        </div>
    );
}
