"use client";

import React, { useState, useEffect } from "react";
import { getCategories } from "@/lib/actions/gifts";
import { ChevronDown, Plus, Minus, Check, ShoppingBag } from "lucide-react";
import { useLetterStore } from "@/store/letterStore";
import { useShallow } from 'zustand/react/shallow';
import GiftImage from "@/components/GiftImage";
import { toast } from "react-hot-toast";

export default function GiftSection() {
    const [categories, setCategories] = useState<any[]>([]);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    const selectedGifts = useLetterStore(useShallow(state => state.extras.gifts || []));
    const updateExtras = useLetterStore(state => state.updateExtras);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                // Open first category by default if it exists
                if (data.length > 0) {
                    setOpenCategories({ [data[0].id]: true });
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Ürünler yüklenirken bir hata oluştu");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleGiftSelection = (gift: any) => {
        const isSelected = selectedGifts.find(g => g.id === gift.id);
        if (isSelected) {
            updateExtras({
                gifts: selectedGifts.filter(g => g.id !== gift.id)
            });
        } else {
            updateExtras({
                gifts: [...selectedGifts, {
                    id: gift.id,
                    name: gift.name,
                    price: gift.price || 0,
                    image: gift.image || undefined,
                    quantity: 1
                }]
            });
        }
    };

    const updateQuantity = (giftId: string, delta: number) => {
        updateExtras({
            gifts: selectedGifts.map(g => {
                if (g.id === giftId) {
                    const newQuantity = Math.max(1, g.quantity + delta);
                    return { ...g, quantity: newQuantity };
                }
                return g;
            })
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 border-2 border-dashed border-paper-dark rounded-3xl">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-seal"></div>
                    <p className="text-sm font-medium text-ink-light">Ürünler Hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2 mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-seal/10 rounded-full mb-2">
                    <ShoppingBag size={28} className="text-seal" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-wood-dark">Hediye Seçenekleri</h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto leading-relaxed">
                    Mektubunuzun yanına küçük bir tebessüm eklemek ister misiniz?
                    <br />
                    <span className="text-seal font-medium">Seçtiğiniz ürünler mektubunuzla birlikte özenle paketlenerek gönderilir.</span>
                </p>
            </div>

            <div className="space-y-6">
                {categories.map((category) => (
                    <div key={category.id} className="border border-paper-dark rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
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

                        <div
                            className={"transition-all duration-500 ease-in-out " + (openCategories[category.id] ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden")}
                        >
                            <div className="p-4 sm:p-8 bg-paper-dark/5">
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-8">
                                    {category.gifts.map((gift: any) => {
                                        const selection = selectedGifts.find(g => g.id === gift.id);
                                        const isSelected = !!selection;

                                        return (
                                            <div
                                                key={gift.id}
                                                className={"group bg-white border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col " + (isSelected ? "border-seal ring-4 ring-seal/10 shadow-lg" : "border-paper-dark hover:border-seal/30 hover:shadow-xl")}
                                            >
                                                <div className="relative aspect-square overflow-hidden bg-paper-dark/10">
                                                    <GiftImage
                                                        src={gift.image}
                                                        alt={gift.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-seal/10 pointer-events-none" />
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>

                                                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h5 className="font-bold text-ink text-lg sm:text-xl mb-2 group-hover:text-seal transition-colors line-clamp-1">{gift.name}</h5>
                                                        {gift.description && (
                                                            <p className="text-ink-light text-sm line-clamp-2 mb-4 leading-relaxed italic">
                                                                {gift.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-paper-dark/50">
                                                        <span className="font-playfair font-black text-seal text-xl">
                                                            {gift.price ? `${gift.price} TL` : "Fiyat Sorunuz"}
                                                        </span>

                                                        {isSelected ? (
                                                            <div className="flex items-center bg-paper-dark/40 rounded-full px-2 py-1.5 gap-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(gift.id, -1); }}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-seal hover:bg-seal hover:text-white transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="w-5 text-center font-black text-ink text-base">{selection.quantity}</span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(gift.id, 1); }}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-seal hover:bg-seal hover:text-white transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => toggleGiftSelection(gift)}
                                                                className="w-full sm:w-auto bg-seal text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-seal-dark transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                                                            >
                                                                <Plus size={18} /> Ekle
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <button
                                                        onClick={() => toggleGiftSelection(gift)}
                                                        className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center py-2 hover:bg-red-50 transition-colors border-t border-paper-dark bg-white"
                                                    >
                                                        Seçimi Kaldır
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
