"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

// Mock Data for Postcards
const categories = [
    {
        id: "tr",
        name: "Türkiye Kartpostalları",
        items: Array.from({ length: 8 }).map((_, i) => ({
            id: "tr-" + i,
            title: "Türkiye Manzarası",
            image: "https://picsum.photos/seed/tr_image_" + i + "/300/200",
        }))
    },
    {
        id: "love",
        name: "Seni Seviyorum Kartpostalları",
        items: Array.from({ length: 8 }).map((_, i) => ({
            id: "love-" + i,
            title: "Seni Seviyorum",
            image: "https://picsum.photos/seed/love_image_" + i + "/300/300",
        }))
    }
];

export default function PostcardSection() {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ tr: true, love: true });
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [includeCalendar, setIncludeCalendar] = useState(false);

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleCardSelection = (id: string) => {
        setSelectedCards(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 mb-8">
                <h3 className="font-playfair text-xl font-bold text-ink flex items-center justify-center gap-2">
                    Kartpostal Ekle
                </h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    Aşağıdaki alandan mektubunuza birbirinden farklı birçok kartpostal ekleyebilirsiniz.
                    <br />
                    <span className="text-wood-dark font-medium">Kartpostallar 10x15 cm. boyutunda olup basım yüksek kalitededir.</span>
                </p>
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {categories.map((category) => (
                    <div key={category.id} className="border border-paper-dark rounded-xl overflow-hidden bg-paper-light">
                        {/* Accordion Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center py-4 px-6 gap-3 hover:bg-paper-dark/30 transition-colors"
                        >
                            <h4 className="font-playfair text-xl font-semibold text-wood-dark flex-1 text-left">
                                {category.name}
                            </h4>
                            <ChevronDown
                                size={24}
                                className={"text-wood-dark transition-transform duration-300 " + (openCategories[category.id] ? "rotate-180" : "")}
                            />
                        </button>

                        {/* Accordion Content Grid */}
                        <div
                            className={"transition-all duration-500 ease-in-out overflow-hidden " + (openCategories[category.id] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}
                        >
                            <div className="p-6 pt-2 bg-paper-dark/10 border-t border-paper-dark/50">
                                {/* Horizontal scroll container like Instagram/Pinterest */}
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                                    {category.items.map((card) => {
                                        const isSelected = selectedCards.includes(card.id);
                                        return (
                                            <div
                                                key={card.id}
                                                className={"relative min-w-[140px] sm:min-w-[160px] cursor-pointer group snap-center transition-transform hover:-translate-y-1 " + (isSelected ? "scale-[1.02]" : "")}
                                                onClick={() => toggleCardSelection(card.id)}
                                            >
                                                <div className={"aspect-square w-full rounded-lg overflow-hidden shadow-sm border-2 transition-all " + (isSelected ? "border-seal ring-4 ring-seal/20" : "border-transparent")}>
                                                    <img
                                                        src={card.image}
                                                        alt={card.title}
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Overlay */}
                                                    <div className={"absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity " + (isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                                        {isSelected ? (
                                                            <div className="bg-seal text-paper p-2 rounded-full shadow-lg">
                                                                <Check size={24} />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-wood/90 text-paper px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-1">
                                                                <Plus size={16} /> Ekle
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-10 w-full h-[1px] bg-paper-dark/50"></div>

            {/* Calendar Section */}
            <div className="text-center space-y-4 mb-4">
                <h3 className="font-playfair text-xl font-bold text-ink flex items-center justify-center gap-2">
                    2026 Takvim
                </h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    En az <span className="font-bold text-seal">3 adet</span> fotoğraf, belge veya kartpostal eklemeniz halinde ücretsiz!
                </p>

                <button
                    onClick={() => setIncludeCalendar(!includeCalendar)}
                    className={"mx-auto flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all " + (includeCalendar ? "border-seal bg-seal/10 text-seal" : "border-paper-dark bg-paper-light text-ink-light hover:border-wood-dark hover:text-wood-dark")}
                >
                    {includeCalendar ? <Check size={18} /> : <Plus size={18} />}
                    {includeCalendar ? "Takvim Eklendi" : "Takvim Eklenmesin"}
                </button>

                <p className="text-xs text-ink-light/80 italic mt-2">
                    Takvim boyutu 31x21 cm olup parlak kuşe kağıda basılmıştır.
                    <br /> Mektubunuza takvim eklemek isterseniz yukarıdaki seçimi değiştiriniz.
                </p>
            </div>

        </div>
    );
}
