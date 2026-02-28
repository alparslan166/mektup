"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, MailPlus, Gift, Sparkles, ArrowRight, UserPlus, MessageCircleHeart, Loader2 } from 'lucide-react';
import { getPricingSettings } from '@/app/actions/settingsActions';

export default function CampaignsPage() {
    const [rewardAmount, setRewardAmount] = useState<number | null>(null);
    const [secondLetterReward, setSecondLetterReward] = useState<number | null>(null);
    const [referralReward, setReferralReward] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await getPricingSettings();
            if (res.success && res.data) {
                setRewardAmount(res.data.commentRewardAmount);
                setSecondLetterReward(res.data.secondLetterRewardAmount);
                setReferralReward(res.data.referralRewardAmount);
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

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
                    <p className="text-ink-light italic text-lg max-w-2xl mx-auto bg-paper/30 py-2 px-4 rounded-full backdrop-blur-sm inline-block">
                        Mektuplaşırken daha fazla anı biriktirebilmeniz için hazırladığımız özel indirimler ve fırsatlar.
                    </p>
                </div>

                {/* Kampanyalar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

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
                                <h3 className="text-lg md:text-2xl font-playfair font-bold text-ink leading-tight">İkinci Mektubuna <br /><span className="text-rose-600 text-xl md:text-3xl">{secondLetterReward || 50} Kredi Hediye!</span></h3>
                            </div>
                        </div>

                        <p className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1">
                            Sevdiklerinize yazacağınız ilk mektubunuzdan sonraki <strong>2. mektup gönderiminizde</strong> sistemimiz anında hesabınıza <strong>{secondLetterReward || 50} Kredi 🪙</strong> tanımlar! Daha çok yazın, daha kârlı çıkın.
                        </p>

                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto gap-3">
                            <span className="text-[10px] md:text-xs font-bold text-ink-light/70 uppercase tracking-wider">Otomatik Uygulanır</span>
                            <Link href="/mektup-yaz" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm">
                                Mektup Yaz <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Kampanya 2 */}
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

                    {/* Kampanya 3: Arkadaşını Davet Et */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-paper-dark shadow-xl shadow-wood-800/5 relative overflow-hidden group hover:border-wood-dark/40 transition-colors flex flex-col md:col-span-2">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-wood/10 rounded-bl-full -z-10 group-hover:bg-wood/20 transition-colors"></div>

                        <div className="bg-white border md:border-2 border-wood/20 text-wood-dark w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
                            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
                            KARŞILIKLI KAZAN
                        </div>

                        <div className="flex flex-col xl:flex-row items-start gap-2 md:gap-4 mb-4 md:mb-6">
                            <div className="bg-wood/20 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-wood-dark shrink-0">
                                <UserPlus size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-playfair font-bold text-ink leading-tight">Arkadaşını Davet Et, <br /><span className="text-wood-dark text-xl md:text-3xl">İkiniz de {referralReward || 15} Kredi 🪙 kazanın!</span></h3>
                            </div>
                        </div>

                        <p className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1 md:w-[80%]">
                            Hemen Profil sayfandan sana özel davet linkini al ve arkadaşına gönder. Arkadaşın senin linkinle <strong>Mektuplaş</strong> ailesine katıldığında, hem ona hoş geldin hediyesi olarak hem de sana teşekkür olarak <strong>tam {referralReward || 15} Kredi 🪙</strong> anında cüzdanlarınıza eklensin!
                        </p>

                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto gap-3 w-full">
                            <span className="text-[10px] md:text-xs font-bold text-wood-dark uppercase tracking-wider">Hemen Davet Et</span>
                            <Link href="/profil" className="bg-wood-dark hover:bg-wood-800 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm">
                                Profiline Git <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Kampanya 4: Yorum Yap */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-paper-dark shadow-xl shadow-amber-900/5 relative overflow-hidden group hover:border-amber-400/40 transition-colors flex flex-col md:col-span-2">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:bg-amber-100 transition-colors"></div>

                        <div className="bg-white border md:border-2 border-amber-200 text-amber-600 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
                            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
                            FİKİRLERİN DEĞERLİ
                        </div>

                        <div className="flex flex-col xl:flex-row items-start gap-2 md:gap-4 mb-4 md:mb-6">
                            <div className="bg-amber-100 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-amber-600 shrink-0">
                                <MessageCircleHeart size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-playfair font-bold text-ink leading-tight">Mektubunu Değerlendir, <br /><span className="text-amber-600 text-xl md:text-3xl">Hediye Kredi Kazan!</span></h3>
                            </div>
                        </div>

                        <div className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1 md:w-[80%]">
                            {isLoading ? (
                                <div className="flex items-center gap-2 text-amber-600/50">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Güncel kampanya yükleniyor...</span>
                                </div>
                            ) : (
                                <p>
                                    Sevdiklerinize gönderdiğiniz mektupların teslimatından sonra, <strong>Yorumlar</strong> sayfamızdan bir değerlendirme bıraktığınızda ve sipariş deneyiminizi paylaştığınızda, teşekkür olarak hesabınıza anında <strong>{rewardAmount} Kredi 🪙</strong> tanımlanır!
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto gap-3 w-full">
                            <span className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-wider">Otomatik Yüklenir</span>
                            <Link href="/yorumlar" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm">
                                Yorum Yapmaya Git <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="mt-16 bg-wood/10 rounded-3xl p-8 md:p-12 text-center border border-wood/20">
                    <h3 className="text-2xl md:text-3xl font-playfair font-bold text-wood-dark mb-4">Yeni Sürprizlerden Haberdar Olun</h3>
                    <p className="text-wood-dark/80 mb-8 max-w-2xl mx-auto">
                        Mektuplaş ailesi olarak size her zaman en iyi fiyatları sunmayı amaçlıyoruz. Zaman zaman yaptığımız <strong>%50 cüzdan yükleme bonusları</strong> ve özel gün indirimlerini kaçırma!
                    </p>
                    <Link href="/api/auth/register" className="inline-flex items-center justify-center gap-2 bg-wood-dark hover:bg-wood-dark/90 text-white font-bold py-4 px-10 rounded-full transition-all shadow-xl hover:shadow-2xl active:scale-95 hover:-translate-y-1">
                        Ücretsiz Kayıt Ol & Cüzdan Aç <ArrowRight size={18} />
                    </Link>
                </div>

            </main>
        </div>
    );
}
