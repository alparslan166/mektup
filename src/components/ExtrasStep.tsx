"use client";

import React from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, ArrowRight, Calendar, Droplet } from "lucide-react";
import PostcardSection from "./extras/PostcardSection";
import UploadSection from "./extras/UploadSection";
import { useLetterStore } from "@/store/letterStore";

export default function ExtrasStep({ goBack, goNext }: { goBack: () => void, goNext: () => void }) {
    const extras = useLetterStore(state => state.extras);
    const updateExtras = useLetterStore(state => state.updateExtras);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
                {/* Soft Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={goBack} className="p-2 hover:bg-paper-dark rounded-full transition-colors group">
                        <ArrowLeft className="text-ink-light group-hover:text-ink transition-colors" size={24} />
                    </button>
                    <h2 className="font-playfair text-3xl font-bold text-wood-dark">Geleceğe Mektup</h2>
                </div>
                <p className="text-ink-light ml-12 text-sm sm:text-base">
                    Mektubunuza ekstra özellikler (Fotoğraf, Kartpostal, Koku vs.) ekleyerek onu daha özel hale getirebilirsiniz.
                </p>

                {/* Stepper */}
                <div className="mt-8 mb-8">
                    <Stepper currentStep={2} />
                </div>

                {/* Date and Scent Selection */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 pb-10 border-b border-paper-dark/50">

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-semibold text-ink-light ml-1">Postaya Verileceği Tarih</label>
                        <div className="flex items-center border border-paper-dark rounded-md bg-paper-light overflow-hidden focus-within:border-wood transition-all shadow-sm">
                            <div className="px-4 bg-paper-dark text-ink flex items-center justify-center py-3 border-r border-paper-dark">
                                <Calendar size={20} className="text-wood-dark" />
                            </div>
                            <select
                                value={extras.deliveryDate}
                                onChange={(e) => updateExtras({ deliveryDate: e.target.value })}
                                className="w-full bg-paper border border-paper-dark text-ink px-4 py-3 rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all appearance-none cursor-pointer"
                            >
                                <option value="Bugün">Bugün (Standart Gönderim)</option>
                                <option value="1 Hafta Sonra">1 Hafta Sonra</option>
                                <option value="1 Ay Sonra">1 Ay Sonra</option>
                                <option value="Özel Tarih">Özel Tarih Seç</option>
                            </select>
                        </div>
                        <p className="text-xs text-ink-light/70 ml-1 italic">Saat 16:30&apos;a kadar verilen siparişler aynı gün yola çıkar.</p>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-semibold text-ink-light ml-1">Mektup Kokusu</label>
                        <div className="flex items-center border border-paper-dark rounded-md bg-paper-light overflow-hidden focus-within:border-wood transition-all shadow-sm">
                            <div className="px-4 bg-paper-dark text-ink flex items-center justify-center py-3 border-r border-paper-dark">
                                <Droplet size={20} className="text-wood-dark" />
                            </div>
                            <select
                                value={extras.scent}
                                onChange={(e) => updateExtras({ scent: e.target.value })}
                                className="w-full bg-paper border border-paper-dark text-ink px-4 py-3 rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all appearance-none cursor-pointer"
                            >
                                <option value="Yok">Koku İstemiyorum</option>
                                <option value="Gül">Gül Kokusu (+20 TL)</option>
                                <option value="Lavanta">Lavanta Kokusu (+20 TL)</option>
                                <option value="Okyanus">Okyanus Esintisi (+20 TL)</option>
                                <option value="Kahve">Nostaljik Kahve (+20 TL)</option>
                            </select>
                        </div>
                        <p className="text-xs text-ink-light/70 ml-1 italic">Seçim yapılması durumunda mektup kağıdınız kokulu olacaktır.</p>
                    </div>
                </div>

                {/* Photography & Document Upload */}
                <UploadSection />

                <div className="my-10 w-full h-[1px] bg-paper-dark/50"></div>

                {/* Postcards Section */}
                <PostcardSection />

                {/* Bottom Actions */}
                <div className="mt-12 flex justify-between items-center bg-paper-dark/20 p-4 rounded-lg border border-paper-dark/50">
                    <button
                        onClick={goBack}
                        className="text-ink-light hover:text-ink px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Geri Dön
                    </button>

                    <button
                        onClick={goNext}
                        className="bg-seal hover:bg-seal-hover text-paper px-8 py-3 rounded-md font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-2 active:scale-[0.98]"
                    >
                        Bilgilere Geç
                        <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
}
