"use client";

import React, { useState } from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, CreditCard, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

import { useLetterStore } from "@/store/letterStore";
import { createLetter } from "@/app/actions/letterActions";

export default function PaymentStep({ goBack, onComplete }: { goBack: () => void, onComplete: () => void }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const extras = useLetterStore(state => state.extras);

    // Calculate dynamic pricing based on selections
    const baseLetterPrice = 120;
    const scentPrice = extras.scent === "Yok" ? 0 : 20;
    const photoPrice = extras.photos.length * 10;
    const docPrice = extras.documents.length * 5;
    const postcardPrice = extras.postcards.length * 15;
    const calendarPrice = extras.includeCalendar ? (extras.photos.length >= 3 ? 0 : 30) : 0;
    const shippingPrice = 45;

    const totalAmount = baseLetterPrice + scentPrice + photoPrice + docPrice + postcardPrice + calendarPrice + shippingPrice;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const { letter, extras, address, resetStore } = useLetterStore.getState();

        // Simulate payment provider delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await createLetter({ letter, extras, address });

        setIsProcessing(false);
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
                        <div className="bg-paper-light border border-paper-dark rounded-xl p-6 shadow-sm">
                            <h3 className="font-playfair text-xl font-bold text-wood-dark border-b border-paper-dark pb-3 mb-6 flex items-center gap-2">
                                <CreditCard size={22} className="text-seal" /> Kart Bilgileri
                            </h3>

                            <form id="payment-form" onSubmit={handlePayment} className="space-y-5">
                                {/* Card Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-ink-light block">Kart Üzerindeki İsim</label>
                                    <input
                                        type="text"
                                        placeholder="AD SOYAD"
                                        className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all uppercase"
                                    />
                                </div>

                                {/* Card Number */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-ink-light block">Kart Numarası</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={19}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-paper text-ink space-x-2 text-sm px-4 py-3 pl-12 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all tracking-widest font-mono"
                                        />
                                        <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light/50" />
                                    </div>
                                </div>

                                {/* Date & CVV */}
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Son Kullanma Tarihi</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="AA"
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all text-center font-mono"
                                            />
                                            <span className="text-2xl text-ink-light/50 flex items-center">/</span>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="YY"
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all text-center font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">CVV</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength={3}
                                                placeholder="000"
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all font-mono"
                                            />
                                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/50" />
                                        </div>
                                    </div>
                                </div>

                            </form>

                            <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
                                {/* Mock Payment Provider Logos */}
                                <div className="font-bold text-xl italic tracking-tighter text-blue-900 border border-blue-900/20 px-2 rounded">VISA</div>
                                <div className="font-bold text-xl italic text-red-600 flex items-center"><span className="w-4 h-4 rounded-full bg-red-600 mr-[-6px] mix-blend-multiply"></span><span className="w-4 h-4 rounded-full bg-yellow-500 mr-1 mix-blend-multiply"></span>mastercard</div>
                                <div className="font-bold text-lg text-emerald-700 flex items-center gap-1 border border-emerald-700/20 px-2 rounded"><Lock size={14} /> troy</div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary (Right - 1/3) */}
                    <div className="flex-1">
                        <div className="bg-paper-dark/10 border border-seal/20 rounded-xl p-6 sticky top-8 shadow-sm">
                            <div className="flex items-center gap-2 text-seal mb-4 justify-center">
                                <ShieldCheck size={28} />
                                <span className="font-bold text-sm leading-tight">256-Bit SSL ile<br />Güvenli Ödeme</span>
                            </div>

                            <h3 className="font-playfair text-lg font-bold text-wood-dark border-b border-paper-dark pb-3 mb-4 text-center">
                                Sepet Tutarı
                            </h3>

                            <div className="bg-paper border border-wood/20 rounded-lg p-4 mb-6 text-center shadow-inner">
                                <span className="text-3xl font-playfair font-bold text-wood-dark">{totalAmount} TL</span>
                                <p className="text-[11px] text-ink-light/80 mt-1">KDV ve Kargo Dahil</p>
                            </div>

                            <button
                                type="submit"
                                form="payment-form"
                                disabled={isProcessing}
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-lg disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        İşleniyor...
                                    </span>
                                ) : (
                                    <>Ödemeyi Tamamla <CheckCircle2 size={20} /></>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-ink-light/60 mt-4 leading-tight">
                                Ödemeyi Tamamla butonuna basarak Mesafeli Satış Sözleşmesini ve Ön Bilgilendirme Formunu kabul etmiş sayılırsınız.
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
