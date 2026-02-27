"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, ZoomIn } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { markIncomingLetterAsRead } from "@/app/actions/incomingLetterActions";

interface IncomingLetterModalProps {
    letter: {
        id: string;
        images: string[];
        description?: string;
        isRead: boolean;
        createdAt: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function IncomingLetterModal({ letter, isOpen, onClose }: IncomingLetterModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Mark as read on open
    React.useEffect(() => {
        if (isOpen && !letter.isRead) {
            markIncomingLetterAsRead(letter.id);
        }
    }, [isOpen, letter.id, letter.isRead]);

    if (!isOpen) return null;

    const images = letter.images || [];
    const hasMultipleImages = images.length > 1;

    const goNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const goPrev = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-wood-dark/70 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-paper-light rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-paper-dark">
                    <div className="flex items-center gap-3">
                        <Image src="/images/kus-logo.png" alt="Mektuplaş" width={32} height={32} />
                        <div>
                            <h2 className="text-xl font-playfair font-bold text-ink">Gelen Mektup</h2>
                            <div className="flex items-center gap-2 text-xs text-ink-light">
                                <Calendar size={12} />
                                <span>{new Date(letter.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-paper-dark/30 rounded-full transition-colors"
                    >
                        <X size={22} className="text-ink-light" />
                    </button>
                </div>

                {/* Image Viewer */}
                <div className="relative flex-1 bg-white/50 min-h-[400px] max-h-[70vh] flex items-center justify-center">
                    {images.length > 0 ? (
                        <>
                            <div
                                className={`relative w-full h-full min-h-[400px] cursor-zoom-in ${isZoomed ? "cursor-zoom-out" : ""}`}
                                onClick={() => setIsZoomed(!isZoomed)}
                            >
                                <Image
                                    src={images[currentImageIndex]}
                                    alt={`Mektup sayfa ${currentImageIndex + 1}`}
                                    fill
                                    className={`transition-transform duration-300 ${isZoomed ? "object-contain scale-150" : "object-contain"}`}
                                />
                            </div>

                            {/* Navigation */}
                            {hasMultipleImages && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={20} className="text-ink" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={20} className="text-ink" />
                                    </button>
                                </>
                            )}

                            {/* Page Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                                Sayfa {currentImageIndex + 1} / {images.length}
                            </div>

                            {/* Zoom hint */}
                            <div className="absolute top-3 right-3 bg-black/40 text-white text-[10px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <ZoomIn size={12} />
                                Yakınlaştırmak için tıklayın
                            </div>
                        </>
                    ) : (
                        <p className="text-ink-light italic">Fotoğraf mevcut değil.</p>
                    )}
                </div>

                {/* Thumbnail strip */}
                {hasMultipleImages && (
                    <div className="flex gap-2 p-4 bg-paper-dark/30 overflow-x-auto">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex
                                        ? "border-seal shadow-md scale-105"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <Image src={img} alt={`Sayfa ${idx + 1}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Description */}
                {letter.description && (
                    <div className="px-6 py-4 border-t border-paper-dark bg-paper-dark/20">
                        <p className="text-sm text-ink-light italic">{letter.description}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
