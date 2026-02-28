"use client";

import React, { useState, useRef } from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, Wallet, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLetterStore } from "@/store/letterStore";
import { createLetter, getSentLetterCount } from "@/app/actions/letterActions";
import { getCreditBalanceAction } from "@/app/actions/creditActions";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function PaymentStep({ goBack, onComplete }: { goBack: () => void, onComplete: () => void }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [isCheckingBalance, setIsCheckingBalance] = useState(true);
    const extras = useLetterStore(state => state.extras);
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
        paperColorPrice: 10
    });

    React.useEffect(() => {
        getCreditBalanceAction().then(res => {
            if (res.success && res.balance !== undefined) {
                setBalance(res.balance);
            }
            setIsCheckingBalance(false);
        });
        getPricingSettings().then(res => {
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
        getSentLetterCount().then(count => setSentLetterCount(count));
    }, []);

    // Zarf ve Kağıt Renk Farkı
    const { letter } = useLetterStore.getState();
    const envelopePriceDelta = letter.envelopeColor !== "Beyaz" ? pricingKeys.envelopeColorPrice : 0;
    const paperPriceDelta = letter.paperColor !== "Beyaz" ? pricingKeys.paperColorPrice : 0;

    // Calculate dynamic pricing based on selections
    const isFreeLetter = (sentLetterCount % 6) === 5;
    const baseLetterPrice = isFreeLetter ? 0 : (pricingKeys.letterSendPrice + envelopePriceDelta + paperPriceDelta);

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
        postcardPrice = (extras.postcards.length - 1) * postcardCreditPrice + Math.round(postcardCreditPrice * 0.8);
    }

    const calendarPrice = extras.includeCalendar ? (extras.photos.length >= 3 ? 0 : pricingKeys.calendarCreditPrice) : 0;
    // Gönderim ücretini standart olarak kredi içinde saydırıyoruz
    // const shippingPrice = 45;

    const totalAmount = baseLetterPrice + scentPrice + photoPrice + docPrice + postcardPrice + calendarPrice;

    const hasEnoughBalance = balance !== null && balance >= totalAmount;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting.current) return; // Prevent double-clicks bypassing React state
        isSubmitting.current = true;

        setIsProcessing(true);

        const { letter, extras, address } = useLetterStore.getState();

        // Simulate payment provider delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await createLetter({ letter, extras, address });

        setIsProcessing(false);
        isSubmitting.current = false;

        if (result.success) {
            setIsSuccess(true);
        } else {
            alert(result.error || "Bir hata oluştu.");
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
                        Ödemeniz başarıyla alındı ve mektubunuz onaylandı. Mektubunuz özenle hazırlanıp, postaya teslim edilecektir.
                    </p>

                    <div className="flex flex-col sm:flex-row w-full max-w-md gap-4">
                        <button
                            onClick={() => {
                                useLetterStore.getState().resetStore();
                                window.location.href = '/';
                            }}
                            className="flex-1 bg-paper-light border border-paper-dark hover:bg-paper text-ink font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Ana Sayfa
                        </button>
                        <button
                            onClick={() => {
                                useLetterStore.getState().resetStore();
                                window.location.href = '/gonderilenler';
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
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
                {/* Soft Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={goBack} disabled={isProcessing} className="p-2 hover:bg-paper-dark rounded-full transition-colors group disabled:opacity-50">
                        <ArrowLeft className="text-ink-light group-hover:text-ink transition-colors" size={24} />
                    </button>
                    <h2 className="font-playfair text-3xl font-bold text-wood-dark">Geleceğe Mektup</h2>
                </div>
                <p className="text-ink-light ml-12 text-sm sm:text-base">
                    Mektubunuzun yola çıkması için son adım! Güvenli ödeme altyapımız ile işleminizi tamamlayabilirsiniz.
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
                                <Wallet size={22} className="text-seal" /> Bakiye Onayı
                            </h3>

                            {isCheckingBalance ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 size={32} className="text-seal animate-spin" />
                                    <p className="text-ink-light font-medium">Bakiyeniz kontrol ediliyor...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-paper border border-wood/20 p-6 rounded-2xl shadow-inner text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                                        <p className="text-sm font-semibold text-ink-light uppercase tracking-wider mb-2">Güncel Bakiyeniz</p>
                                        <div className="text-4xl font-bold font-playfair text-wood-dark flex justify-center items-center gap-2">
                                            {balance} <span className="text-2xl text-gold">🪙</span>
                                        </div>
                                    </div>

                                    {!hasEnoughBalance && (
                                        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-4">
                                            <div className="mt-0.5">
                                                <AlertCircle size={24} className="text-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-rose-800 mb-1">Yetersiz Bakiye</h4>
                                                <p className="text-sm text-rose-700 leading-relaxed mb-3">
                                                    Bu mektubu göndermek için <strong className="font-bold">{totalAmount - (balance || 0)} 🪙</strong> daha krediye ihtiyacınız var.
                                                </p>
                                                <Link href="/app/cuzdan" className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                                                    Cüzdana Git ve Kredi Yükle
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {hasEnoughBalance && (
                                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
                                            <div className="mt-0.5">
                                                <CheckCircle2 size={24} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-800 mb-1">Mükemmel!</h4>
                                                <p className="text-sm text-emerald-700 leading-relaxed">
                                                    Bu işlem için yeterli bakiyeniz bulunuyor. Sağdaki özet alanından işlemi onaylayarak mektubunuzu yola çıkarabilirsiniz.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Payment Summary (Right - 1/3) */}
                    <div className="flex-1">
                        <div className="bg-paper-dark/10 border border-seal/20 rounded-xl p-6 sticky top-8 shadow-sm">
                            <div className="flex items-center gap-2 text-seal mb-4 justify-center">
                                <ShieldCheck size={28} />
                                <span className="font-bold text-sm leading-tight">Şifrelenmiş Cüzdanla<br />Güvenli İşlem</span>
                            </div>

                            <h3 className="font-playfair text-lg font-bold text-wood-dark border-b border-paper-dark pb-3 mb-4 text-center">
                                Toplam İşlem Tutarı
                            </h3>

                            <div className="bg-paper border border-wood/20 rounded-lg p-4 mb-6 text-center shadow-inner relative overflow-hidden">
                                {isFreeLetter && (
                                    <div className="absolute top-0 right-0 bg-seal text-white text-[10px] px-2 py-0.5 font-bold rounded-bl-lg">
                                        HEDİYE MEKTUP 🎁
                                    </div>
                                )}
                                <span className={`${isFreeLetter ? 'text-4xl' : 'text-3xl'} font-playfair font-bold text-wood-dark`}>{totalAmount} 🪙</span>
                                <p className="text-[11px] text-ink-light/80 mt-1">Sipariş verildikten sonra düşülür</p>
                            </div>

                            <button
                                type="submit"
                                onClick={handlePayment}
                                disabled={isProcessing || isCheckingBalance || !hasEnoughBalance}
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={24} className="animate-spin text-white" />
                                        Mektup Oluşturuluyor...
                                    </span>
                                ) : !hasEnoughBalance && !isCheckingBalance ? (
                                    <>Yetersiz Bakiye</>
                                ) : (
                                    <>Kredi ile Onayla <CheckCircle2 size={20} /></>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-ink-light/60 mt-4 leading-tight">
                                İşlemi onaylayarak mektubunuzun postaya verilmesini ve bakiyenizin düşülmesini kabul etmiş sayılırsınız.
                            </p>
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
        </div>
    );
}
