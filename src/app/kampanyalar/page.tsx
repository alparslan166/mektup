"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  MailPlus,
  Gift,
  Sparkles,
  ArrowRight,
  UserPlus,
  MessageCircleHeart,
  Loader2,
} from "lucide-react";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function CampaignsPage() {
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [secondLetterReward, setSecondLetterReward] = useState<number | null>(
    null,
  );
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
    <div className="flex flex-col min-h-screen font-sans">
      <main className="flex-1 w-full max-w-5xl px-6 py-12 mx-auto md:py-20">
        {/* Başlık Alanı */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full shadow-sm bg-rose-100 text-rose-600">
            <Tag size={32} />
          </div>
          <h1 className="mb-4 text-4xl font-black md:text-5xl font-playfair text-ink">
            Aktif Kampanyalarımız
          </h1>
          <p className="inline-block max-w-2xl px-4 py-2 mx-auto text-lg italic rounded-full text-ink-light bg-paper/30 backdrop-blur-sm">
            Mektuplaşırken daha fazla anı biriktirebilmeniz için hazırladığımız
            özel indirimler ve fırsatlar.
          </p>
        </div>

        {/* Kampanyalar Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          {/* Kampanya 1 */}
          <div className="relative flex flex-col p-4 overflow-hidden transition-colors bg-white border shadow-xl rounded-2xl md:rounded-3xl md:p-8 border-paper-dark shadow-rose-900/5 group hover:border-rose-300">
            <div className="absolute top-0 right-0 w-24 h-24 transition-colors rounded-bl-full md:w-32 md:h-32 bg-rose-50 -z-10 group-hover:bg-rose-100"></div>

            <div className="bg-white border md:border-2 border-rose-100 text-rose-600 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
              EN ÇOK TERCİH EDİLEN
            </div>

            <div className="flex flex-col items-start gap-2 mb-4 xl:flex-row md:gap-4 md:mb-6">
              <div className="bg-rose-100 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-rose-600 shrink-0">
                <MailPlus size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight md:text-2xl font-playfair text-ink">
                  İkinci Mektubuna <br />
                  <span className="text-xl text-rose-600 md:text-3xl">
                    %{secondLetterReward || 20} İndirim!
                  </span>
                </h3>
              </div>
            </div>

            <p className="flex-1 mb-6 text-xs leading-snug text-ink-light md:leading-relaxed md:mb-8 md:text-base">
              Sevdiklerinize yazacağınız ilk mektubunuzdan sonraki{" "}
              <strong>2. mektup gönderiminizde</strong> sistemimiz anında
              <strong>%{secondLetterReward || 20} indirim tanımlar</strong>{" "}
              tanımlar! Daha çok yazın, daha kârlı çıkın.
            </p>

            <div className="flex flex-col items-start justify-between gap-3 mt-auto xl:flex-row xl:items-center">
              <span className="text-[10px] md:text-xs font-bold text-ink-light/70 uppercase tracking-wider">
                Otomatik Uygulanır
              </span>
              <Link
                href="/mektup-yaz"
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm"
              >
                Mektup Yaz <ArrowRight size={14} className="md:w-4 md:h-4" />
              </Link>
            </div>
          </div>

          {/* Kampanya 2 */}
          <div className="relative flex flex-col p-4 overflow-hidden transition-colors bg-white border shadow-lg rounded-2xl md:rounded-3xl md:p-8 border-paper-dark group hover:border-seal-light">
            <div className="absolute top-0 right-0 w-24 h-24 transition-colors rounded-bl-full md:w-32 md:h-32 bg-seal/5 -z-10 group-hover:bg-seal/10"></div>

            <div className="bg-seal/10 text-seal w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2">
              <Gift size={12} className="md:w-3.5 md:h-3.5" />
              ÇOK YAKINDA
            </div>

            <div className="flex flex-col items-start gap-2 mb-4 xl:flex-row md:gap-4 md:mb-6">
              <div className="bg-seal/10 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-seal shrink-0">
                <Gift size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight md:text-2xl font-playfair text-ink text-opacity-80">
                  Hediye Gönderiminde <br />
                  Kargo Bedava
                </h3>
              </div>
            </div>

            <p className="flex-1 mb-6 text-xs leading-snug text-ink-light md:leading-relaxed md:mb-8 md:text-base">
              Çok yakında, sevdiklerinize mektubunuzun yanında ekleyeceğiniz
              fiziksel hediyelerde (tespih, kolye vb.) ekstra kargo ücreti
              ödemeyeceksiniz. Birlikte yola çıkacak!
            </p>

            <div className="flex flex-col items-start justify-between w-full gap-3 mt-auto opacity-50 pointer-events-none xl:flex-row xl:items-center">
              <span className="text-[10px] md:text-xs font-bold text-ink-light/70 uppercase tracking-wider">
                Hazırlık Aşamasında
              </span>
              <button className="bg-paper-dark text-ink px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold w-full xl:w-auto text-[11px] md:text-sm">
                Yakında
              </button>
            </div>
          </div>

          {/* Kampanya 3: Arkadaşını Davet Et */}
          <div className="relative flex flex-col p-4 overflow-hidden transition-colors bg-white border shadow-xl rounded-2xl md:rounded-3xl md:p-8 border-paper-dark shadow-wood-800/5 group hover:border-wood-dark/40 md:col-span-2">
            <div className="absolute top-0 right-0 w-24 h-24 transition-colors rounded-bl-full md:w-32 md:h-32 bg-wood/10 -z-10 group-hover:bg-wood/20"></div>

            <div className="bg-white border md:border-2 border-wood/20 text-wood-dark w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
              KARŞILIKLI KAZAN
            </div>

            <div className="flex flex-col items-start gap-2 mb-4 xl:flex-row md:gap-4 md:mb-6">
              <div className="bg-wood/20 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-wood-dark shrink-0">
                <UserPlus size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight md:text-2xl font-playfair text-ink">
                  Arkadaşını Davet Et, <br />
                  <span className="text-xl text-wood-dark md:text-3xl">
                    İkiniz de %{referralReward || 15} indirim kazanın!
                  </span>
                </h3>
              </div>
            </div>

            <p className="text-ink-light leading-snug md:leading-relaxed mb-6 md:mb-8 text-xs md:text-base flex-1 md:w-[80%]">
              Hemen Profil sayfandan sana özel davet linkini al ve arkadaşına
              gönder. Arkadaşın senin linkinle <strong>Mektuplaş</strong>{" "}
              ailesine katıldığında, hem ona hoş geldin hediyesi olarak hem de
              sana teşekkür olarak sonraki ilk mektubunuzda{" "}
              <strong>%{referralReward || 15} indirim</strong> anında eklensin!
            </p>

            <div className="flex flex-col items-start justify-between w-full gap-3 mt-auto xl:flex-row xl:items-center">
              <span className="text-[10px] md:text-xs font-bold text-wood-dark uppercase tracking-wider">
                Hemen Davet Et
              </span>
              <Link
                href="/profil"
                className="bg-wood-dark hover:bg-wood-800 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm"
              >
                Profiline Git <ArrowRight size={14} className="md:w-4 md:h-4" />
              </Link>
            </div>
          </div>

          {/* Kampanya 4: Yorum Yap */}
          <div className="relative flex flex-col p-4 overflow-hidden transition-colors bg-white border shadow-xl rounded-2xl md:rounded-3xl md:p-8 border-paper-dark shadow-amber-900/5 group hover:border-amber-400/40 md:col-span-2">
            <div className="absolute top-0 right-0 w-24 h-24 transition-colors rounded-bl-full md:w-32 md:h-32 bg-amber-50 -z-10 group-hover:bg-amber-100"></div>

            <div className="bg-white border md:border-2 border-amber-200 text-amber-600 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-4 md:mb-6 flex items-center gap-1 md:gap-2 shadow-sm">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
              FİKİRLERİN DEĞERLİ
            </div>

            <div className="flex flex-col items-start gap-2 mb-4 xl:flex-row md:gap-4 md:mb-6">
              <div className="bg-amber-100 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-amber-600 shrink-0">
                <MessageCircleHeart size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight md:text-2xl font-playfair text-ink">
                  Mektubunu Değerlendir, <br />
                  <span className="text-xl text-amber-600 md:text-3xl">
                    %{rewardAmount || 10} İndirim Kazan!
                  </span>
                </h3>
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
                  Sevdiklerinize gönderdiğiniz mektupların teslimatından sonra,{" "}
                  <strong>Yorumlar</strong> sayfamızdan bir değerlendirme
                  bıraktığınızda ve sipariş deneyiminizi paylaştığınızda,
                  teşekkür olarak sonraki mektubunuzda anında{" "}
                  <strong>%{rewardAmount || 10} indirim</strong> tanımlanır!
                </p>
              )}
            </div>

            <div className="flex flex-col items-start justify-between w-full gap-3 mt-auto xl:flex-row xl:items-center">
              <span className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-wider">
                Otomatik Yüklenir
              </span>
              <Link
                href="/yorumlar"
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center w-full xl:w-auto gap-1.5 md:gap-2 text-[11px] md:text-sm"
              >
                Yorum Yapmaya Git{" "}
                <ArrowRight size={14} className="md:w-4 md:h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 mt-16 text-center border bg-wood/10 rounded-3xl md:p-12 border-wood/20">
          <h3 className="mb-4 text-2xl font-bold md:text-3xl font-playfair text-wood-dark">
            Yeni Sürprizlerden Haberdar Olun
          </h3>
          <p className="max-w-2xl mx-auto mb-8 text-black">
            Mektuplaş ailesi olarak size her zaman en iyi fiyatları sunmayı
            amaçlıyoruz. Zaman zaman yaptığımız{" "}
            <strong>%50 ödeme bonusları</strong> ve özel gün indirimlerini
            kaçırma!
          </p>
          <Link
            href="/api/auth/register"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-white transition-all rounded-full shadow-xl bg-wood-dark hover:bg-wood-dark/90 hover:shadow-2xl active:scale-95 hover:-translate-y-1"
          >
            Ücretsiz Kayıt Ol
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
