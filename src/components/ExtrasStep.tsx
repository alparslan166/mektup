"use client";

import React, { useState } from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, ArrowRight, Calendar, Droplet, Inbox, ChevronDown, ChevronUp, CheckCircle2, MapPin, Globe, Building2, Clock, Mail } from "lucide-react";
import PostcardSection from "./extras/PostcardSection";
import UploadSection from "./extras/UploadSection";
import GiftSection from "./extras/GiftSection";
import { useLetterStore } from "@/store/letterStore";

export default function ExtrasStep() {
    const extras = useLetterStore(state => state.extras);
    const updateExtras = useLetterStore(state => state.updateExtras);
    const [showInboxInfo, setShowInboxInfo] = useState(false);

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

            <div className="my-10 w-full h-[1px] bg-paper-dark/50 shadow-sm"></div>

            {/* Gifts Section */}
            <GiftSection />

            <div className="my-10 w-full h-[1px] bg-paper-dark/50 shadow-sm"></div>

            {/* Gelen Mektup - Reply in Inbox Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-1">
                    <Inbox size={22} className="text-seal" />
                    <h3 className="font-playfair text-xl font-bold text-wood-dark">Gelen Mektup</h3>
                </div>
                <p className="text-ink-light text-sm max-w-xl">
                    Cevap mektuplarını dijital olarak gelen kutunuzda okuyun.
                </p>

                {/* Checkbox */}
                <label
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${extras.wantReplyInInbox
                            ? "border-seal bg-seal/5 shadow-md"
                            : "border-paper-dark bg-paper-light hover:border-wood hover:bg-wood/5"
                        }`}
                >
                    <input
                        type="checkbox"
                        checked={extras.wantReplyInInbox}
                        onChange={(e) => updateExtras({ wantReplyInInbox: e.target.checked })}
                        className="sr-only"
                    />
                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${extras.wantReplyInInbox
                            ? "bg-seal border-seal"
                            : "border-paper-dark bg-white"
                        }`}>
                        {extras.wantReplyInInbox && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <div className="flex-1">
                        <span className="text-sm font-bold text-ink block mb-1">
                            Mektubuma cevabı gelen kutusunda görmek istiyorum
                        </span>
                        <span className="text-xs text-ink-light leading-relaxed block">
                            Bu seçeneği işaretlerseniz, yakınınız cevap mektuplarını bizim adresimize gönderir. Biz de mektubun fotoğraflarını çekip hesabınıza yükleriz.
                        </span>
                    </div>
                </label>

                {/* Nedir? Info Toggle */}
                <button
                    onClick={() => setShowInboxInfo(!showInboxInfo)}
                    className="flex items-center gap-2 text-seal hover:text-seal-hover text-sm font-bold transition-colors ml-1"
                >
                    {showInboxInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>Gelen Mektup Nedir?</span>
                </button>

                {showInboxInfo && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gradient-to-br from-seal/5 to-wood/5 border border-seal/20 rounded-2xl p-6 space-y-5">
                        <p className="text-sm text-ink font-medium leading-relaxed">
                            Cezaevindeki yakınınızdan mektup almak istiyorsunuz ama aşağıdaki durumlardan biri geçerliyse bu hizmet tam size göre:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <MapPin size={18} className="text-seal flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-ink font-medium">Sabit bir adresiniz yok</span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <Building2 size={18} className="text-seal flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-ink font-medium">Köyde veya ücra bir yerde yaşıyorsunuz</span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <Globe size={18} className="text-seal flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-ink font-medium">Yurtdışında yaşıyorsunuz</span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                <Clock size={18} className="text-seal flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-ink font-medium">Çalıştığınız için mektuplar geri dönüyor</span>
                            </div>
                        </div>

                        <div className="bg-white/80 rounded-xl p-4 space-y-3">
                            <h4 className="text-sm font-bold text-wood-dark flex items-center gap-2">
                                <Mail size={16} />
                                Nasıl Çalışır?
                            </h4>
                            <ol className="text-xs text-ink space-y-2 list-decimal list-inside leading-relaxed">
                                <li>Mektup yazarken bu seçeneği işaretleyin.</li>
                                <li>Mektuba bu bilgiyi ekliyoruz.</li>
                                <li>Yakınınız cevap mektuplarını <strong>bizim adresimize</strong> gönderir.</li>
                                <li>Firmamız adınıza gelen mektupların fotoğraflarını çekip hesabınıza yükler.</li>
                                <li>Mektubunuzu nerede olursanız olun <strong>Gelen Kutunuzdan</strong> okuyabilirsiniz.</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
