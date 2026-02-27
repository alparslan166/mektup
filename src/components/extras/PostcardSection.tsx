"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Check, X, Maximize2 } from "lucide-react";
import { useLetterStore } from "@/store/letterStore";
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPricingSettings } from "@/app/actions/settingsActions";
import { Info } from "lucide-react";

// Mock Data for Postcards
export const postcardCategories = [
    {
        id: "tr",
        name: "Türkiye Kartpostalları",
        items: Array.from({ length: 8 }).map((_, i) => ({
            id: "tr-" + i,
            title: "Türkiye Manzarası " + (i + 1),
            image: "https://picsum.photos/seed/tr_image_" + i + "/600/400",
        }))
    },
    {
        id: "love",
        name: "Seni Seviyorum Kartpostalları",
        items: Array.from({ length: 8 }).map((_, i) => ({
            id: "love-" + i,
            title: "Seni Seviyorum " + (i + 1),
            image: "https://picsum.photos/seed/love_image_" + i + "/600/600",
        }))
    }
];

export default function PostcardSection() {
    const { postcards, includeCalendar, updateExtras } = useLetterStore(useShallow(state => ({
        postcards: state.extras.postcards || [],
        includeCalendar: state.extras.includeCalendar,
        updateExtras: state.updateExtras
    })));

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ tr: true, love: true });
    const [previewCard, setPreviewCard] = useState<any | null>(null);
    const [postcardCreditPrice, setPostcardCreditPrice] = useState(15);

    React.useEffect(() => {
        getPricingSettings().then(res => {
            if (res.success && res.data) {
                setPostcardCreditPrice(res.data.postcardCreditPrice || 15);
            }
        });
    }, []);

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleCardSelection = (id: string) => {
        const newPostcards = postcards.includes(id)
            ? postcards.filter(c => c !== id)
            : [...postcards, id];
        updateExtras({ postcards: newPostcards });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-8 animate-in fade-in duration-700">
                <h3 className="font-playfair text-2xl font-bold text-wood-dark flex items-center justify-center gap-2">
                    Kartpostal Ekle
                </h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto leading-relaxed">
                    Mektubunuza birbirinden farklı birçok kartpostal ekleyebilirsiniz.
                    <br />
                    <span className="text-seal font-medium">10x15 cm boyutunda, yüksek kaliteli fotoğraf baskısı.</span>
                </p>

                <div className="bg-seal/5 border border-seal/20 rounded-xl p-4 max-w-lg mx-auto shadow-sm">
                    <h4 className="font-bold text-seal flex items-center justify-center gap-2 mb-2">
                        <Info size={16} /> Fırsatları Kaçırmayın!
                    </h4>
                    <p className="text-xs text-ink-light space-y-1">
                        <span className="block">• Her kartpostal <strong className="text-wood-dark">{postcardCreditPrice} 🪙</strong> değerindedir.</span>
                        <span className="block">• <strong>3. Kartpostalda:</strong> %20 İndirim fırsatı!</span>
                        <span className="block">• <strong>5 Kartpostal seçerseniz:</strong> 1 Tanesi Bizden Hediye!</span>
                        <span className="block">• <strong>10 Kartpostal seçerseniz:</strong> Tam 2 Tanesi Hediye!</span>
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {postcardCategories.map((category) => (
                    <div key={category.id} className="border border-paper-dark rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Accordion Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className={"w-full flex items-center py-5 px-6 gap-4 transition-all text-left " + (openCategories[category.id] ? "bg-slate-50 border-b border-paper-dark/50" : "hover:bg-slate-50")}
                        >
                            <h4 className="font-playfair text-xl font-black text-seal uppercase tracking-wider flex-1">
                                {category.name}
                            </h4>
                            <ChevronDown
                                size={22}
                                className={"text-seal transition-transform duration-300 " + (openCategories[category.id] ? "rotate-180" : "")}
                            />
                        </button>

                        {/* Accordion Content Grid */}
                        <div
                            className={"transition-all duration-500 ease-in-out overflow-hidden " + (openCategories[category.id] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}
                        >
                            <div className="p-4 sm:p-8 bg-paper-dark/5">
                                <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x px-2">
                                    {category.items.map((card) => {
                                        const isSelected = postcards.includes(card.id);
                                        return (
                                            <div
                                                key={card.id}
                                                className="min-w-[160px] sm:min-w-[200px] snap-center"
                                            >
                                                <div
                                                    className={"relative aspect-square w-full rounded-3xl overflow-hidden shadow-sm cursor-pointer group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-white border-2 " + (isSelected ? "border-seal ring-4 ring-seal/10" : "border-paper-dark")}
                                                    onClick={() => setPreviewCard(card)}
                                                >
                                                    <Image
                                                        src={card.image}
                                                        alt={card.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />

                                                    {/* Selection Status Overlay */}
                                                    <div className={"absolute inset-0 bg-seal/10 pointer-events-none transition-opacity duration-300 " + (isSelected ? "opacity-100" : "opacity-0")} />

                                                    {/* Hover Overlay with Preview Icon */}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                            <Maximize2 size={24} className="text-seal" />
                                                        </div>
                                                    </div>

                                                    {/* Success Check Badge */}
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 bg-seal text-white p-1.5 rounded-full shadow-lg animate-in zoom-in duration-300">
                                                            <Check size={18} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-center text-xs font-bold text-ink-light uppercase tracking-widest">{card.title}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-10 w-full h-[1px] bg-paper-dark/50 shadow-sm"></div>

            {/* Calendar Section */}
            <div className="text-center space-y-6 mb-8 bg-paper-dark/5 p-8 rounded-3xl border border-paper-dark/50 shadow-inner">
                <div className="space-y-2">
                    <h3 className="font-playfair text-2xl font-black text-wood-dark flex items-center justify-center gap-2">
                        2026 TAKVİM
                    </h3>
                    <p className="text-ink-light text-sm max-w-xl mx-auto italic">
                        En az <span className="font-bold text-seal not-italic">3 adet</span> fotoğraf, belge veya kartpostal eklemeniz halinde ücretsiz!
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={() => updateExtras({ includeCalendar: !includeCalendar })}
                        className={"flex items-center gap-3 px-10 py-4 rounded-full border-2 font-black tracking-widest uppercase text-sm transition-all duration-300 active:scale-95 shadow-md " + (includeCalendar ? "border-seal bg-seal text-white hover:bg-seal-dark" : "border-paper-dark bg-white text-ink-light hover:border-seal/50 hover:text-seal")}
                    >
                        {includeCalendar ? <Check size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                        {includeCalendar ? "TAKVİM EKLENDİ" : "TAKVİM EKLE"}
                    </button>

                    <p className="text-[11px] text-ink-light/80 leading-relaxed font-medium">
                        (31x21 cm, parlak kuşe kağıt baskı)
                    </p>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewCard && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewCard(null)}
                            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <button
                                onClick={() => setPreviewCard(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>

                            <div className="aspect-[3/2] sm:aspect-video w-full overflow-hidden bg-paper-dark/20 relative">
                                <Image
                                    src={previewCard.image}
                                    alt={previewCard.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-8 sm:p-10 flex flex-col gap-8 bg-paper-light">
                                <div className="space-y-2 text-center">
                                    <h4 className="font-playfair text-3xl font-black text-ink uppercase tracking-wider">{previewCard.title}</h4>
                                    <p className="text-sm text-ink-light font-medium tracking-wide">10x15 CM YÜKSEK KALİTELİ KARTPOSTAL BASKISI</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setPreviewCard(null)}
                                        className="flex-1 px-8 py-4 rounded-full border-2 border-paper-dark text-ink-light font-black tracking-widest uppercase text-xs hover:bg-paper-dark/30 transition-all active:scale-95"
                                    >
                                        İPTAL
                                    </button>
                                    <button
                                        onClick={() => {
                                            toggleCardSelection(previewCard.id);
                                            setPreviewCard(null);
                                        }}
                                        className={"flex-1 px-8 py-4 rounded-full font-black tracking-widest uppercase text-xs transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 " + (postcards.includes(previewCard.id) ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" : "bg-seal text-white hover:bg-seal-dark shadow-seal/20")}
                                    >
                                        {postcards.includes(previewCard.id) ? (
                                            <>SEÇİMİ KALDIR</>
                                        ) : (
                                            <><Plus size={18} strokeWidth={3} /> MEKTUBA EKLE</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
