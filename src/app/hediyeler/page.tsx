"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/lib/actions/gifts";
import { Package, Star, ShoppingBag, Loader2 } from "lucide-react";
import GiftImage from "@/components/GiftImage";
import GiftOrderModal from "@/components/GiftOrderModal";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

export default function GiftsPage() {
    const { status } = useSession();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Gerekirse global bakiyeyi UIStore üzerinden gösterebiliriz.

    useEffect(() => {
        getCategories().then(cats => {
            setCategories(cats);
            setLoading(false);
        });
    }, []);

    const handleOpenModal = (gift: any) => {
        setSelectedGift(gift);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex-1 min-h-[50vh] flex items-center justify-center p-8">
                <Loader2 size={40} className="animate-spin text-seal" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-10 pb-20 px-6">
            <div className="container mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="bg-seal/10 p-4 rounded-full">
                            <ShoppingBag className="text-seal" size={40} />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-ink tracking-tight">Hediye Seçenekleri</h1>
                    <div className="flex items-center justify-center gap-2 text-white font-medium tracking-widest text-sm italic">
                        <Star size={14} />
                        <span>Mektubunuzun Yanına Küçük Bir Tebessüm</span>
                        <Star size={14} />
                    </div>
                    <p className="text-ink- max-w-2xl mx-auto leading-relaxed">
                        Sevdiklerinize göndereceğiniz mektupları anlamlı hediyelerle taçlandırın.
                        Kategorilerimize göz atın ve dilediğiniz hediyeyi seçin.
                    </p>
                </div>

                {/* Categories and Products */}
                <div className="space-y-20">
                    {categories.map((category) => (
                        <section key={category.id} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-playfair font-black text-seal tracking-wider uppercase border-b-2 border-seal pb-2">
                                    {category.name}
                                </h2>
                                <div className="flex-1 h-px bg-paper-dark" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.gifts.map((gift: any) => (
                                    <div
                                        key={gift.id}
                                        className="group bg-amber-100/95 border border-paper-dark p-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="w-full aspect-square bg-paper-dark/50 rounded-xl flex items-center justify-center text-wood group-hover:bg-seal group-hover:text-paper transition-all duration-500 overflow-hidden relative">
                                                <GiftImage
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-ink mb-2">{gift.name}</h3>
                                                <p className="text-ink-light text-sm line-clamp-3 leading-relaxed">
                                                    {gift.description || ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-paper-dark flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-playfair font-black text-seal">
                                                    {gift.price ? `${gift.price} 🪙` : "Ücretsiz"}
                                                </span>
                                                <div className="bg-paper-dark/30 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter text-ink-light uppercase">
                                                    Stokta Var
                                                </div>
                                            </div>

                                            {status === "authenticated" ? (
                                                <button
                                                    onClick={() => handleOpenModal(gift as { id: string, name: string, price: number | null, image: string | null })}
                                                    className="w-full bg-seal hover:bg-seal-hover text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                                                >
                                                    Kredi ile Hediye Gönder
                                                </button>
                                            ) : (
                                                <Link
                                                    href="/auth/login"
                                                    className="w-full text-center bg-paper-dark/50 hover:bg-paper-dark text-ink text-sm font-bold py-2.5 rounded-xl transition-all"
                                                >
                                                    Satın Almak İçin Giriş Yap
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {category.gifts.length === 0 && (
                                    <div className="col-span-full py-12 text-center bg-paper-dark/20 rounded-2xl border-2 border-dashed border-paper-dark">
                                        <p className="text-ink-light italic">Bu kategoride henüz ürün bulunmuyor.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-32 bg-paper-light rounded-3xl border border-paper-dark shadow-sm">
                        <Package size={48} className="mx-auto text-paper-dark mb-4" />
                        <h3 className="text-xl font-bold text-ink">Henüz Hediye Bulunmuyor</h3>
                        <p className="text-ink-light">Geliştirmelerimiz devam ediyor, çok yakında buradayız.</p>
                    </div>
                )}
            </div>

            <GiftOrderModal
                isOpen={isModalOpen}
                gift={selectedGift}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    );
}
