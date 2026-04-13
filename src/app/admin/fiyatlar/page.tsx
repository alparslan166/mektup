"use client";

import React, { useState, useEffect } from "react";
import {
  getPricingSettings,
  updatePricingSettings,
} from "@/app/actions/settingsActions";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminPricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fiyatlandırma state'leri
  const [prices, setPrices] = useState({
    letterSendPrice: 100,
    incomingLetterOpenPrice: 50,
    photoCreditPrice: 10,
    postcardCreditPrice: 15,
    scentCreditPrice: 20,
    docCreditPrice: 5,
    calendarCreditPrice: 30,
    envelopeColorPrice: 10,
    paperColorPrice: 10,
    commentRewardAmount: 50,
    secondLetterRewardAmount: 50,
    referralRewardAmount: 15,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const res = await getPricingSettings();
    if (res.success && res.data) {
      setPrices({
        letterSendPrice: res.data.letterSendPrice,
        incomingLetterOpenPrice: res.data.incomingLetterOpenPrice,
        photoCreditPrice: res.data.photoCreditPrice,
        postcardCreditPrice: res.data.postcardCreditPrice,
        scentCreditPrice: res.data.scentCreditPrice,
        docCreditPrice: res.data.docCreditPrice,
        calendarCreditPrice: res.data.calendarCreditPrice,
        envelopeColorPrice: res.data.envelopeColorPrice,
        paperColorPrice: res.data.paperColorPrice,
        commentRewardAmount: res.data.commentRewardAmount,
        secondLetterRewardAmount: res.data.secondLetterRewardAmount,
        referralRewardAmount: res.data.referralRewardAmount,
      });
    } else {
      toast.error("Fiyat ayarları yüklenirken bir sorun oluştu.");
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrices((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = async () => {
    // Validation - negatif olamaz.
    if (Object.values(prices).some((val) => val < 0)) {
      toast.error("Fiyat değerleri 0'dan küçük olamaz.");
      return;
    }

    setIsSaving(true);
    const res = await updatePricingSettings(
      prices.letterSendPrice,
      prices.incomingLetterOpenPrice,
      prices.photoCreditPrice,
      prices.postcardCreditPrice,
      prices.scentCreditPrice,
      prices.docCreditPrice,
      prices.calendarCreditPrice,
      prices.envelopeColorPrice,
      prices.paperColorPrice,
      prices.commentRewardAmount,
      prices.secondLetterRewardAmount,
      prices.referralRewardAmount,
    );

    if (res.success) {
      toast.success("Tüm fiyat ayarları başarıyla kaydedildi.");
    } else {
      toast.error(res.error || "Ayarlar kaydedilemedi.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fiyat Yönetimi</h2>
          <p className="text-slate-500 mt-1">
            Sistemdeki tüm standart ürün ve özelliklerin fiyatlandırmalarını bu
            ekrandan belirleyebilirsiniz.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 outline-none hover:bg-emerald-700 text-white font-bold py-3 md:py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle size={18} />
          )}
          <span>Değişiklikleri Kaydet</span>
        </button>
      </header>

      {/* Temel Harcamalar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">
              1. Temel Sistem Gereksinimleri
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Platformun işleyişi ile ilgili temel ücretler.
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Mektup Gönderme
            </label>
            <div className="relative">
              <input
                name="letterSendPrice"
                type="number"
                min="0"
                value={prices.letterSendPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Gelen Mektup Açma
            </label>
            <div className="relative">
              <input
                name="incomingLetterOpenPrice"
                type="number"
                min="0"
                value={prices.incomingLetterOpenPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik ve Ekstra Eklentiler */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">
              2. İçerik ve Ek Eklentiler (Adet Başına)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Kullanıcının mektuba dâhil edebileceği ek hizmetler.
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Fotoğraf Yükleme
            </label>
            <div className="relative">
              <input
                name="photoCreditPrice"
                type="number"
                min="0"
                value={prices.photoCreditPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Kartpostal Ekleme
            </label>
            <div className="relative">
              <input
                name="postcardCreditPrice"
                type="number"
                min="0"
                value={prices.postcardCreditPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Belge Ekleme
            </label>
            <div className="relative">
              <input
                name="docCreditPrice"
                type="number"
                min="0"
                value={prices.docCreditPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Koku Seçimi
            </label>
            <div className="relative">
              <input
                name="scentCreditPrice"
                type="number"
                min="0"
                value={prices.scentCreditPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block flex items-center gap-1.5">
              Özel Zarf Rengi{" "}
              <span className="text-[10px] text-slate-400 inline-block font-normal">
                (Fark ücreti)
              </span>
            </label>
            <div className="relative">
              <input
                name="envelopeColorPrice"
                type="number"
                min="0"
                value={prices.envelopeColorPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block flex items-center gap-1.5">
              Özel Kağıt Rengi{" "}
              <span className="text-[10px] text-slate-400 inline-block font-normal">
                (Fark ücreti)
              </span>
            </label>
            <div className="relative">
              <input
                name="paperColorPrice"
                type="number"
                min="0"
                value={prices.paperColorPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block">
              Takvim Ekleme
            </label>
            <div className="relative">
              <input
                name="calendarCreditPrice"
                type="number"
                min="0"
                value={prices.calendarCreditPrice}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                TL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ödül ve Kampanya Ayarları */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">
              3. Kampanya İndirim Oranları
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Kullanıcılara uygulanacak yüzdelik indirim oranları.
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block text-emerald-600 font-bold">
              Yorum İndirim Oranı
            </label>
            <div className="relative">
              <input
                name="commentRewardAmount"
                type="number"
                min="0"
                value={prices.commentRewardAmount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold select-none">
                %
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block text-rose-600 font-bold">
              2. Mektup İndirim Oranı
            </label>
            <div className="relative">
              <input
                name="secondLetterRewardAmount"
                type="number"
                min="0"
                value={prices.secondLetterRewardAmount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">
                %
              </div>
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
            <label className="text-sm font-semibold text-slate-700 block text-indigo-600 font-bold">
              Referans İndirim Oranı
            </label>
            <div className="relative">
              <input
                name="referralRewardAmount"
                type="number"
                min="0"
                value={prices.referralRewardAmount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-medium text-slate-800 transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold select-none">
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hediyeler Yönlendirme Kutusu */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-200/50 -mr-10">
          <Gift size={180} />
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            4. Hediyeler Yönetimi
          </h3>
          <p className="text-sm text-blue-700 max-w-lg leading-relaxed">
            Çikolatalar, Papatya Çayları, Kahveler ve diğer tüm özel hediyeler
            kendi görselleri ve açıklamalarıyla ayrı bir modülde tutulmaktadır.
            Hediyelerin fiyatlarını yönetmek için{" "}
            <strong>Hediye Yönetimi</strong> sayfasına gidebilirsiniz.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto shrink-0 flex items-end justify-end">
          <Link
            href="/admin/gifts"
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto group"
          >
            <span>Hediyeleri Yönet</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
