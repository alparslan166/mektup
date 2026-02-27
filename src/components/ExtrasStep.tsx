"use client";

import React, { useState } from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, ArrowRight, Calendar, Droplet, Inbox, ChevronDown, ChevronUp, CheckCircle2, MapPin, Globe, Building2, Clock, Mail } from "lucide-react";
import PostcardSection from "./extras/PostcardSection";
import UploadSection from "./extras/UploadSection";
import GiftSection from "./extras/GiftSection";
import { useLetterStore } from "@/store/letterStore";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function ExtrasStep() {
    const extras = useLetterStore(state => state.extras);
    const updateExtras = useLetterStore(state => state.updateExtras);
    const [scentCreditPrice, setScentCreditPrice] = useState(20);

    React.useEffect(() => {
        getPricingSettings().then(res => {
            if (res.success && res.data) {
                setScentCreditPrice(res.data.scentCreditPrice || 20);
            }
        });
    }, []);

    return (
        <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
            {/* Soft Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="text-center space-y-2 mb-8 mt-2">
                <h3 className="font-playfair text-2xl font-bold text-wood-dark">Ekstralar & Detaylar</h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    Mektubunuza ekstra özellikler (Fotoğraf, Kartpostal, Koku vs.) ekleyerek onu daha özel hale getirebilirsiniz.
                </p>
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
                    {extras.deliveryDate === "Özel Tarih" && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input
                                type="date"
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                value={extras.customDate || ""}
                                onChange={(e) => updateExtras({ customDate: e.target.value })}
                                className="w-full bg-paper border border-wood text-ink px-4 py-3 rounded-md outline-none focus:ring-1 focus:ring-wood transition-all cursor-pointer shadow-sm"
                            />
                            <p className="text-[10px] text-wood-dark mt-1 ml-1 font-medium">Lütfen gönderilmesini istediğiniz gelecekteki bir tarihi seçiniz.</p>
                        </div>
                    )}
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
                            <option value="Gül">Gül Kokusu (+{scentCreditPrice} 🪙)</option>
                            <option value="Lavanta">Lavanta Kokusu (+{scentCreditPrice} 🪙)</option>
                            <option value="Okyanus">Okyanus Esintisi (+{scentCreditPrice} 🪙)</option>
                            <option value="Kahve">Nostaljik Kahve (+{scentCreditPrice} 🪙)</option>
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

            <div className="my-10 w-full h-[1px] bg-paper-dark/50 shadow-sm"></div>

            {/* Gifts Section */}
            <GiftSection />


        </div>
    );
}
