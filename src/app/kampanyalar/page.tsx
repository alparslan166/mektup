import React from 'react';
import Link from 'next/link';
import { Tag, MailPlus, Gift, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
    title: "Kampanyalar & İndirimler | Mektuplaş",
    description: "Mektuplaş'ın sizlere özel sunduğu indirimler, hediye kredi fırsatları ve mektup kampanyaları.",
};

export default function CampaignsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans">

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20">

                {/* Başlık Alanı */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-6 shadow-sm">
                        <Tag size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-playfair font-black text-ink mb-4">
                        Aktif Kampanyalarımız
                    </h1>
                    <p className="text-white font-kurale italic text-lg max-w-2xl mx-auto">
                        Mektuplaşırken daha fazla anı biriktirebilmeniz için hazırladığımız özel indirimler ve fırsatlar.
                    </p>
                </div>

                {/* Kampanyalar Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-8">

                    {/* Kampanya 1 */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-paper-dark shadow-xl shadow-rose-900/5 relative overflow-hidden group hover:border-rose-300 transition-colors flex flex-col">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors"></div>

                        <div className="bg-white border md:border-2 border-rose-100 text-rose-600 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
                            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
                            EN ÇOK TERCİH EDİLEN
                        </div>

                        <div className="flex flex-col xl:flex-row items-start gap-2 md:gap-4 mb-4 md:mb-6">
                            <div className="bg-rose-100 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-rose-600 shrink-0">
                                <MailPlus size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-playfair font-bold text-ink leading-tight">İkinci Mektubuna <br /><span className="text-rose-600 text-xl md:text-3xl">%20 İndirim!</span></h3>
                            </div>
                        </div>

                        <p className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1">
                            Sevdiklerinize yazacağınız ilk mektubunuzdan sonraki <strong>2. mektup gönderiminizde</strong> sistemimiz anında fiyattan %20 indirim (kredi) düşer! Daha çok yazın, daha kârlı çıkın.
                        </p>

                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto gap-3">
                            <span className="text-[10px] md:text-xs font-bold text-ink-light/70 uppercase tracking-wider">Otomatik Uygulanır</span>
                            <Link href="/mektup-yaz" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm">
                                Mektup Yaz <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Kampanya 2 (Gelecek Planlaması için Örnek) */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-paper-dark shadow-lg relative overflow-hidden group hover:border-seal-light transition-colors flex flex-col">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-seal/5 rounded-bl-full -z-10 group-hover:bg-seal/10 transition-colors"></div>

                        <div className="bg-seal/10 text-seal w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2">
                            <Gift size={12} className="md:w-3.5 md:h-3.5" />
                            ÇOK YAKINDA
                        </div>

                        <div className="flex flex-col xl:flex-row items-start gap-2 md:gap-4 mb-4 md:mb-6">
                            <div className="bg-seal/10 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-seal shrink-0">
                                <Gift size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-playfair font-bold text-ink leading-tight text-opacity-80">Hediye Gönderiminde <br />Kargo Bedava</h3>
                            </div>
                        </div>

                        <p className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1">
                            Çok yakında, sevdiklerinize mektubunuzun yanında ekleyeceğiniz fiziksel hediyelerde (tespih, kolye vb.) ekstra kargo ücreti ödemeyeceksiniz. Birlikte yola çıkacak!
                        </p>

                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto opacity-50 pointer-events-none gap-3 w-full">
                            <span className="text-[10px] md:text-xs font-bold text-ink-light/70 uppercase tracking-wider">Hazırlık Aşamasında</span>
                            <button className="bg-paper-dark text-ink px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold w-full xl:w-auto text-[11px] md:text-sm">
                                Yakında
                            </button>
                        </div>
                    </div>

                </div>

                <div className="mt-16 bg-wood/10 rounded-3xl p-8 md:p-12 text-center border border-wood/20">
                    <h3 className="text-2xl md:text-3xl font-playfair font-bold text-wood-dark mb-4">Yeni Sürprizlerden Haberdar Olun</h3>
                    <p className="text-wood-dark/80 mb-8 max-w-2xl mx-auto">
                        Mektuplaş ailesi olarak size her zaman en iyi fiyatları sunmayı amaçlıyoruz. Zaman zaman yaptığımız <strong>%50 cüzdan yükleme bonusları</strong> ve özel gün indirimlerini kaçırma!
                    </p>
                    <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-wood-dark hover:bg-wood-dark/90 text-white font-bold py-4 px-10 rounded-full transition-all shadow-xl hover:shadow-2xl active:scale-95 hover:-translate-y-1">
                        Ücretsiz Kayıt Ol & Cüzdan Aç <ArrowRight size={18} />
                    </Link>
                </div>

            </main>
        </div>
    );
}

