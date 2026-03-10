"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/lib/actions/gifts";
import { Package, Star, ShoppingBag, Loader2, X, ZoomIn } from "lucide-react";
import GiftImage from "@/components/GiftImage";
import GiftOrderModal from "@/components/GiftOrderModal";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function GiftsPage() {
    const { status } = useSession();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<any | null>(null);
    const [previewGift, setPreviewGift] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

    const handleOpenPreview = (e: React.MouseEvent, gift: any) => {
        e.stopPropagation();
        setPreviewGift(gift);
        setIsPreviewOpen(true);
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
                    <div className="flex items-center justify-center gap-2 text-ink-light font-medium tracking-widest text-sm italic">
                        <Star size={14} />
                        <span>Mektubunuzun Yanına Küçük Bir Tebessüm</span>
                        <Star size={14} />
                    </div>
                    <p className="text-ink-light max-w-2xl mx-auto leading-relaxed">
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
                                            <div
                                                onClick={(e) => handleOpenPreview(e, gift)}
                                                className="w-full aspect-square bg-paper-dark/50 rounded-xl flex items-center justify-center text-wood group-hover:bg-seal group-hover:text-paper transition-all duration-500 overflow-hidden relative cursor-zoom-in"
                                            >
                                                <GiftImage
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                    <ZoomIn size={32} className="text-paper transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                                                </div>
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
                                                    onClick={() => handleOpenModal(gift)}
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

            {/* Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && previewGift && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-wood-dark/90 backdrop-blur-md"
                            onClick={() => setIsPreviewOpen(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-paper rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b-4 border-seal flex justify-between items-center bg-wood-dark text-paper">
                                <div>
                                    <h3 className="text-2xl font-playfair font-bold">{previewGift.name}</h3>
                                    <p className="text-paper/60 text-sm font-medium">Hediye Görselleri</p>
                                </div>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                                <div className={`grid gap-6 ${previewGift.image2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                    {/* Image 1 */}
                                    <div className="space-y-3">
                                        <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg bg-paper-dark border-2 border-wood-dark/10">
                                            <Image
                                                src={previewGift.image || "/images/gift-placeholder.png"}
                                                alt={`${previewGift.name} - 1`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                        <p className="text-center text-[10px] font-black tracking-widest text-ink/40 uppercase">Görsel 1</p>
                                    </div>

                                    {/* Image 2 */}
                                    {previewGift.image2 && (
                                        <div className="space-y-3">
                                            <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg bg-paper-dark border-2 border-wood-dark/10 animate-in fade-in slide-in-from-right duration-500">
                                                <Image
                                                    src={previewGift.image2}
                                                    alt={`${previewGift.name} - 2`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                            <p className="text-center text-[10px] font-black tracking-widest text-ink/40 uppercase">Görsel 2</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 bg-seal/5 p-6 rounded-2xl border border-seal/20">
                                    <h4 className="font-playfair font-bold text-lg text-wood-dark mb-2">Ürün Açıklaması</h4>
                                    <p className="text-ink-light text-sm leading-relaxed mb-4">
                                        {previewGift.description || "Bu ürün için henüz bir açıklama girilmemiş."}
                                    </p>
                                    <div className="pt-4 border-t border-seal/10 flex justify-between items-center">
                                        <span className="text-sm font-bold text-wood-dark/60 uppercase tracking-widest">Hediye Bedeli</span>
                                        <span className="text-2xl font-playfair font-black text-seal">
                                            {previewGift.price ? `${previewGift.price} 🪙` : "Ücretsiz"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-paper-dark/30 border-t border-paper-dark flex justify-end gap-4">
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-ink hover:bg-paper-dark rounded-xl transition-colors"
                                >
                                    Kapat
                                </button>
                                {status === "authenticated" && (
                                    <button
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            handleOpenModal(previewGift);
                                        }}
                                        className="bg-seal hover:bg-seal-hover text-white text-sm font-bold px-8 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                                    >
                                        Bu Hediyeyi Gönder
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
