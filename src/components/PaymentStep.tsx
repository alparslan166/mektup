"use client";

import React, { useState, useRef } from "react";
import Stepper from "@/components/Stepper";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Landmark,
  Copy,
  Clock,
  FileText,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLetterStore } from "@/store/letterStore";
import { getSentLetterCount } from "@/app/actions/letterActions";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function PaymentStep({
  goBack,
  onComplete,
}: {
  goBack: () => void;
  onComplete: () => void;
}) {
  const isHavalePrimary = true;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHavaleModal, setShowHavaleModal] = useState(false);
  const [isHavaleProcessing, setIsHavaleProcessing] = useState(false);
  const orderNumber = useLetterStore((state) => state.orderNumber);
  const setOrderNumber = useLetterStore((state) => state.setOrderNumber);
  const extras = useLetterStore((state) => state.extras);
  const isSubmitting = useRef(false);
  const [sentLetterCount, setSentLetterCount] = useState(0);
  const [pricingKeys, setPricingKeys] = useState({
    letterSendPrice: 100,
    photoCreditPrice: 10,
    postcardCreditPrice: 15,
    scentCreditPrice: 20,
    docCreditPrice: 5,
    calendarCreditPrice: 30,
    envelopeColorPrice: 10,
    paperColorPrice: 10,
  });

  // Payment Form States
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/^([1-9]\/|[2-9])$/g, "0$1/")
      .replace(/^(0[1-9]|1[0-2])$/g, "$1/")
      .replace(/^([0-1])([3-9])$/g, "0$1/$2")
      .replace(/^(0?[1-9]|1[0-2])([0-9]{2})$/g, "$1/$2")
      .replace(/^([0-1][0-2])([0-9]{2})$/g, "$1/$2")
      .replace(/[^0-9\/]/g, "")
      .substring(0, 5);
  };

  React.useEffect(() => {
    getPricingSettings().then((res) => {
      if (res.success && res.data) {
        setPricingKeys({
          letterSendPrice: res.data.letterSendPrice || 100,
          photoCreditPrice: res.data.photoCreditPrice || 10,
          postcardCreditPrice: res.data.postcardCreditPrice || 15,
          scentCreditPrice: res.data.scentCreditPrice || 20,
          docCreditPrice: res.data.docCreditPrice || 5,
          calendarCreditPrice: res.data.calendarCreditPrice || 30,
          envelopeColorPrice: res.data.envelopeColorPrice || 10,
          paperColorPrice: res.data.paperColorPrice || 10,
        });
      }
    });
    getSentLetterCount().then((count) => setSentLetterCount(count));
  }, []);

  React.useEffect(() => {
    if (orderNumber) return;

    const year = new Date().getFullYear();
    const randomPart = String(Math.floor(Math.random() * 900000) + 100000);
    setOrderNumber(`#${year}-${randomPart}`);
  }, [orderNumber, setOrderNumber]);

  const effectiveOrderNumber = orderNumber ?? "";

  // Zarf ve Kağıt Renk Farkı
  const { letter } = useLetterStore.getState();
  const envelopePriceDelta =
    letter.envelopeColor !== "Beyaz" ? pricingKeys.envelopeColorPrice : 0;
  const paperPriceDelta =
    letter.paperColor !== "Beyaz" ? pricingKeys.paperColorPrice : 0;

  // Calculate dynamic pricing based on selections
  const isFreeLetter = sentLetterCount % 6 === 5;
  const baseLetterPrice = isFreeLetter
    ? 0
    : pricingKeys.letterSendPrice + envelopePriceDelta + paperPriceDelta;

  const scentPrice = extras.scent === "Yok" ? 0 : pricingKeys.scentCreditPrice;

  // Fotoğraf Fiyat Algoritması
  const photoCreditPrice = pricingKeys.photoCreditPrice;
  let actualPhotoCount = extras.photos.length;
  if (actualPhotoCount >= 10) actualPhotoCount -= 2;
  else if (actualPhotoCount >= 5) actualPhotoCount -= 1;

  let photoPrice = actualPhotoCount * photoCreditPrice;
  if (extras.photos.length === 3 || extras.photos.length === 4) {
    photoPrice = (extras.photos.length - 1) * photoCreditPrice + 8;
  }

  const docPrice = extras.documents.length * pricingKeys.docCreditPrice;

  // Kartpostal Fiyat Algoritması
  const postcardCreditPrice = pricingKeys.postcardCreditPrice;
  let actualPostcardCount = extras.postcards.length;
  if (actualPostcardCount >= 10) actualPostcardCount -= 2;
  else if (actualPostcardCount >= 5) actualPostcardCount -= 1;

  let postcardPrice = actualPostcardCount * postcardCreditPrice;
  if (extras.postcards.length === 3 || extras.postcards.length === 4) {
    postcardPrice =
      (extras.postcards.length - 1) * postcardCreditPrice +
      Math.round(postcardCreditPrice * 0.8);
  }

  const calendarPrice = extras.includeCalendar
    ? extras.photos.length >= 3
      ? 0
      : pricingKeys.calendarCreditPrice
    : 0;

  const totalAmount =
    baseLetterPrice +
    scentPrice +
    photoPrice +
    docPrice +
    postcardPrice +
    calendarPrice;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setIsProcessing(true);

    const { letter, extras, address } = useLetterStore.getState();
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter,
          extras,
          address,
          orderNumber: effectiveOrderNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.hostedPaymentUrl) {
        alert(data?.error || "Ödeme başlatılamadı.");
        return;
      }

      window.location.href = data.hostedPaymentUrl;
    } catch (error) {
      console.error("PAYMENT_INITIATE_CLIENT_ERROR", error);
      alert("Ödeme başlatılırken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
      isSubmitting.current = false;
    }
  };

  const handleHavalePayment = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsHavaleProcessing(true);

    const { letter, extras, address } = useLetterStore.getState();
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter,
          extras,
          address,
          orderNumber: effectiveOrderNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.hostedPaymentUrl) {
        alert(data?.error || "Ödeme başlatılamadı.");
        return;
      }

      setShowHavaleModal(false);
      window.location.href = data.hostedPaymentUrl;
    } catch (error) {
      console.error("PAYMENT_INITIATE_HAVALE_CLIENT_ERROR", error);
      alert("Ödeme başlatılırken bir hata oluştu.");
    } finally {
      setIsHavaleProcessing(false);
      isSubmitting.current = false;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback
    const el = document.getElementById(`copy-${label}`);
    if (el) {
      el.textContent = "Kopyalandı!";
      setTimeout(() => {
        el.textContent = "Kopyala";
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col justify-center animate-in fade-in duration-300">
        <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 flex-col flex items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="w-24 h-24 bg-seal/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-4 border-seal rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 size={48} className="text-seal" />
          </div>

          <h2 className="font-playfair text-3xl font-bold text-wood-dark mb-4">
            Mektubunuz İletilmiştir!
          </h2>

          <p className="text-ink-light mb-8 max-w-md mx-auto leading-relaxed">
            Ödemeniz başarıyla alındı ve mektubunuz onaylandı. Mektubunuz özenle
            hazırlanıp, postaya teslim edilecektir.
          </p>

          <div className="flex flex-col sm:flex-row w-full max-w-md gap-4">
            <button
              onClick={() => {
                useLetterStore.getState().resetStore();
                window.location.href = "/";
              }}
              className="flex-1 bg-paper-light border border-paper-dark hover:bg-paper text-ink font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => {
                useLetterStore.getState().resetStore();
                window.location.href = "/gonderilenler";
              }}
              className="flex-1 bg-seal hover:bg-seal-hover text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Mektuplarımı Gör
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-300">
      <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goBack}
            disabled={isProcessing}
            className="p-2 hover:bg-paper-dark rounded-full transition-colors group disabled:opacity-50"
          >
            <ArrowLeft
              className="text-ink-light group-hover:text-ink transition-colors"
              size={24}
            />
          </button>
          <h2 className="font-playfair text-3xl font-bold text-wood-dark">
            Geleceğe Mektup
          </h2>
        </div>
        <p className="text-ink-light ml-12 text-sm sm:text-base">
          Mektubunuzun yola çıkması için son adım! Güvenli ödeme altyapımız ile
          işleminizi tamamlayabilirsiniz.
        </p>

        {/* Stepper */}
        <div className="mt-8 mb-10">
          <Stepper currentStep={5} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Payment Form (Left - 2/3) */}
          <div className="flex-[2]">
            <div className="bg-paper-light border border-paper-dark rounded-xl p-6 shadow-sm min-h-full">
              <h3 className="font-playfair text-xl font-bold text-wood-dark border-b border-paper-dark pb-3 mb-6 flex items-center gap-2">
                {isHavalePrimary ? (
                  <>
                    <Landmark size={22} className="text-seal" /> Havale / EFT
                    Bilgileri
                  </>
                ) : (
                  <>
                    <ShieldCheck size={22} className="text-seal" /> Güvenli
                    Ödeme
                  </>
                )}
              </h3>

              {isHavalePrimary ? (
                <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="border-2 border-slate-200 rounded-xl p-5 bg-paper">
                    <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
                      ÖDEME BİLGİLERİ (KURUMSAL HESAP)
                    </h5>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-ink-light shrink-0 mt-0.5">
                            Alıcı:
                          </span>
                          <span className="text-sm font-bold text-ink leading-snug">
                            EHM DİJİTAL ÇÖZÜMLER YAZILIM VE TİCARET LİMİTED
                            ŞİRKETİ
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "EHM DİJİTAL ÇÖZÜMLER YAZILIM VE TİCARET LİMİTED ŞİRKETİ",
                              "alici",
                            )
                          }
                          className="text-[10px] font-bold text-seal hover:text-seal-hover flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Copy size={10} />
                          <span id="copy-alici">Kopyala</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-ink-light shrink-0">
                          Banka:
                        </span>
                        <span className="text-sm font-medium text-ink flex items-center gap-1.5">
                          <span className="text-lg">🏦</span> Kuveyt Türk
                          Katılım Bankası
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-ink-light shrink-0">
                            IBAN:
                          </span>
                          <span className="text-sm font-mono font-bold text-ink">
                            TR70 0020 5000 0922 5992 3000 01
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "TR7000205000092259923000 01",
                              "iban",
                            )
                          }
                          className="text-[10px] font-bold text-seal hover:text-seal-hover flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Copy size={10} />
                          <span id="copy-iban">Kopyala</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-ink-light shrink-0">
                          Tutar:
                        </span>
                        <span className="text-xl font-bold text-seal">
                          {totalAmount},00 ₺{" "}
                          <span className="text-sm font-medium text-ink-light">
                            (KDV Dahil)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-amber-900 leading-snug">
                      Lütfen FAST/Havale açıklama kısmına{" "}
                      <strong>SADECE</strong> sipariş numaranızı yazınız:
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-300">
                      <strong className="text-amber-900">
                        {effectiveOrderNumber}
                      </strong>
                      <button
                        onClick={() =>
                          copyToClipboard(effectiveOrderNumber, "siparis")
                        }
                        className="text-[10px] font-bold text-seal hover:text-seal-hover flex items-center gap-1 transition-colors"
                      >
                        <Copy size={10} />
                        <span id="copy-siparis">Kopyala</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink-light uppercase tracking-wider">
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        placeholder="AD SOYAD"
                        className="w-full bg-paper border border-paper-dark rounded-xl px-4 py-3 text-ink font-medium focus:border-seal outline-none transition-colors placeholder:text-ink-light/30"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            name: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink-light uppercase tracking-wider">
                        Kart Numarası
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full bg-paper border border-paper-dark rounded-xl px-4 py-3 text-ink font-medium focus:border-seal outline-none transition-colors placeholder:text-ink-light/30"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: formatCardNumber(e.target.value),
                            })
                          }
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-40">
                          <div className="w-8 h-5 bg-ink-light/20 rounded"></div>
                          <div className="w-8 h-5 bg-ink-light/20 rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-light uppercase tracking-wider">
                          SKT (AA/YY)
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-paper border border-paper-dark rounded-xl px-4 py-3 text-ink font-medium focus:border-seal outline-none transition-colors placeholder:text-ink-light/30"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: formatExpiry(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-light uppercase tracking-wider">
                          CVV
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            className="w-full bg-paper border border-paper-dark rounded-xl px-4 py-3 text-ink font-medium focus:border-seal outline-none transition-colors placeholder:text-ink-light/30"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value.replace(/[^0-9]/g, ""),
                              })
                            }
                          />
                          <Lock
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-paper-dark/30 rounded-xl p-4 flex items-center gap-4 border border-dashed border-paper-dark">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-paper-dark shadow-sm">
                      <ShieldCheck size={20} className="text-seal" />
                    </div>
                    <p className="text-[11px] text-ink-light leading-snug">
                      Kart bilgileriniz uçtan uca şifrelenir ve asla
                      sunucularımızda saklanmaz. Ödeme altyapısı güvencesiyle
                      sağlanmaktadır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary (Right - 1/3) */}
          <div className="flex-1">
            <div className="bg-paper-dark/10 border border-seal/20 rounded-xl p-6 sticky top-8 shadow-sm">
              <div className="flex items-center gap-2 text-seal mb-4 justify-center">
                {isHavalePrimary ? (
                  <Landmark size={28} />
                ) : (
                  <ShieldCheck size={28} />
                )}
                <span className="font-bold text-sm leading-tight">
                  {isHavalePrimary ? "Havale / EFT ile" : "Şifrelenmiş Kartla"}
                  <br />
                  Güvenli İşlem
                </span>
              </div>

              <h3 className="font-playfair text-lg font-bold text-wood-dark border-b border-paper-dark pb-3 mb-4 text-center">
                Toplam İşlem Tutarı
              </h3>

              <div className="bg-paper border border-wood/20 rounded-lg p-4 mb-6 text-center shadow-inner relative overflow-hidden">
                <span
                  className={`${isFreeLetter ? "text-4xl" : "text-3xl"} font-playfair font-bold text-wood-dark`}
                >
                  {totalAmount} ₺
                </span>
                <p className="text-[11px] text-ink-light/80 mt-1">
                  {isHavalePrimary
                    ? "Ödeme havale / EFT ile tamamlanır"
                    : "Ödeme kartınızdan tahsil edilir"}
                </p>
              </div>

              {isHavalePrimary ? (
                <button
                  onClick={() => setShowHavaleModal(true)}
                  disabled={isProcessing}
                  className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <Landmark size={20} />
                  Havale / EFT ile Ödeme
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handlePayment}
                  disabled={
                    isProcessing ||
                    !cardDetails.number ||
                    !cardDetails.expiry ||
                    !cardDetails.cvv ||
                    !cardDetails.name
                  }
                  className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-white" />
                      Ödeme Alınıyor...
                    </span>
                  ) : (
                    <>
                      Ödeme Yap <CheckCircle2 size={20} />
                    </>
                  )}
                </button>
              )}

              <p className="text-[10px] text-center text-ink-light/60 mt-4 leading-tight">
                İşlemi onaylayarak mektubunuzun postaya verilmesini ve ödemenin
                alınmasını kabul etmiş sayılırsınız.
              </p>

              {/* Alternatif Ödeme Butonu */}
              <div className="mt-4 pt-4 border-t border-paper-dark/30">
                {isHavalePrimary ? (
                  <button
                    type="submit"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-white hover:bg-paper-light border-2 border-wood/30 hover:border-wood text-wood-dark py-3.5 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2.5 text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={18} />
                    <span className="flex flex-col items-start leading-tight">
                      <span>Kredi Kartı ile Ödeme</span>
                      <span className="text-[10px] font-medium opacity-80">
                        Morpara güvenli sayfasında devam et
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowHavaleModal(true)}
                    disabled={isProcessing}
                    className="w-full bg-white hover:bg-paper-light border-2 border-wood/30 hover:border-wood text-wood-dark py-3.5 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2.5 text-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    <Landmark size={18} />
                    Havale / EFT ile Ödeme
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-paper-dark/30">
          <button
            onClick={goBack}
            disabled={isProcessing}
            className="text-ink-light hover:text-ink px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Özete Geri Dön
          </button>
        </div>
      </div>

      {/* Havale/EFT Modal */}
      <AnimatePresence>
        {showHavaleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full mb-2">
                    <CheckCircle2 size={18} />
                    Siparişiniz Alındı
                  </div>
                  <h3 className="text-white font-playfair text-xl font-bold">
                    Ödeme Bekleniyor
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Sipariş No */}
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-bold text-ink">
                    Sipariş No: {effectiveOrderNumber}
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(effectiveOrderNumber, "siparis")
                    }
                    className="text-xs font-bold text-seal hover:text-seal-hover flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} />
                    <span id="copy-siparis">Kopyala</span>
                  </button>
                </div>

                {/* Ödeme Bilgileri */}
                <div className="border-2 border-slate-200 rounded-xl p-5 mb-5">
                  <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
                    ÖDEME BİLGİLERİ (KURUMSAL HESAP)
                  </h5>

                  <div className="space-y-4">
                    {/* Alıcı */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-ink-light shrink-0 mt-0.5">
                          Alıcı:
                        </span>
                        <span className="text-sm font-bold text-ink leading-snug">
                          EHM DİJİTAL ÇÖZÜMLER YAZILIM VE TİCARET LİMİTED
                          ŞİRKETİ
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "EHM DİJİTAL ÇÖZÜMLER YAZILIM VE TİCARET LİMİTED ŞİRKETİ",
                            "alici",
                          )
                        }
                        className="text-[10px] font-bold text-seal hover:text-seal-hover flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Copy size={10} />
                        <span id="copy-alici">Kopyala</span>
                      </button>
                    </div>

                    {/* Banka */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-ink-light shrink-0">
                          Banka:
                        </span>
                        <span className="text-sm font-medium text-ink flex items-center gap-1.5">
                          <span className="text-lg">🏦</span> Kuveyt Türk
                          Katılım Bankası
                        </span>
                      </div>
                    </div>

                    {/* IBAN */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-ink-light shrink-0">
                          IBAN:
                        </span>
                        <span className="text-sm font-mono font-bold text-ink">
                          TR70 0020 5000 0922 5992 3000 01
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard("TR7000205000092259923000 01", "iban")
                        }
                        className="text-[10px] font-bold text-seal hover:text-seal-hover flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Copy size={10} />
                        <span id="copy-iban">Kopyala</span>
                      </button>
                    </div>

                    {/* Tutar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-ink-light shrink-0">
                        Tutar:
                      </span>
                      <span className="text-xl font-bold text-seal">
                        {totalAmount},00 ₺{" "}
                        <span className="text-sm font-medium text-ink-light">
                          (KDV Dahil)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Açıklama Uyarısı */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-5 text-center">
                  <p className="text-sm text-amber-900 leading-snug">
                    Lütfen FAST/Havale açıklama kısmına
                    <br />
                    <strong>SADECE</strong> sipariş numaranızı yazınız:{" "}
                    <strong>{effectiveOrderNumber}</strong>
                  </p>
                </div>

                {/* Kurumsal Güvence */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <BadgeCheck size={16} className="text-slate-700" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      KURUMSAL İŞLEM GÜVENCESİ
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> 7/24 FAST (Anında Onay)
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> E-FATURA GARANTİSİ
                    </span>
                    <span className="flex items-center gap-1">
                      <BadgeCheck size={12} /> LTD. ŞTİ. HESABI
                    </span>
                  </div>
                </div>

                {/* Butonlar */}
                <button
                  onClick={handleHavalePayment}
                  disabled={isHavaleProcessing}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98] disabled:opacity-50 mb-3"
                >
                  {isHavaleProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      İşleniyor...
                    </span>
                  ) : (
                    <>
                      ÖDEME YAPILDI, SİPARİŞİ TAMAMLA <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowHavaleModal(false)}
                  disabled={isHavaleProcessing}
                  className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                >
                  İptal ve Geri Dön
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
