"use client";

import React, { useState } from "react";
import { Mail, Calendar, MapPin, Truck, ChevronRight } from "lucide-react";
import Link from "next/link";
import LetterStatusBadge from "@/components/LetterStatusBadge";
import LetterDetailsModal from "@/components/LetterDetailsModal";

interface GonderilenlerClientProps {
    initialLetters: any[];
}

export default function GonderilenlerClient({ initialLetters }: GonderilenlerClientProps) {
    const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (letter: any) => {
        setSelectedLetter(letter);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // We don't null selectedLetter immediately to avoid flickering during exit animation
    };

    return (
        <>
            {initialLetters.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl p-16 text-center transform transition-all hover:scale-[1.01]">
                    <div className="bg-seal/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-seal/20">
                        <Mail size={40} className="text-seal" />
                    </div>
                    <h2 className="text-2xl font-black text-wood-dark mb-3 tracking-tight">Henüz mektubunuz bulunmuyor</h2>
                    <p className="text-ink-light mb-10 max-w-sm mx-auto font-medium">Hemen sevdiklerinize ilk mektubunuzu yazmaya başlayın.</p>
                    <Link
                        href="/mektup-yaz"
                        className="inline-flex items-center gap-3 bg-seal hover:bg-seal-hover text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                    >
                        Mektup Yaz
                        <ChevronRight size={22} />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {initialLetters.map((letter: any, index: number) => (
                        <div
                            key={letter.id}
                            onClick={() => handleOpenModal(letter)}
                            className="bg-white/95 backdrop-blur-md shadow-lg border border-white/30 rounded-3xl overflow-hidden hover:shadow-2xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500 relative cursor-pointer"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Status Badge - Top Right */}
                            <div className="absolute top-6 right-6 z-10 scale-110">
                                <LetterStatusBadge status={letter.status} />
                            </div>

                            <div className="p-6 pb-2 sm:p-4">
                                <div className="flex flex-col gap-6">
                                    {/* Top Section: Icon + Name/Date */}
                                    <div className="flex items-start gap-6">
                                        <div className="bg-paper-dark/40 p-5 rounded-2xl text-wood group-hover:bg-seal group-hover:text-white transition-all duration-300 border border-paper-dark shadow-inner shrink-0 hidden sm:block">
                                            <Mail size={28} />
                                        </div>
                                        {/* Mobile view icon - smaller */}
                                        <div className="bg-paper-dark/40 p-4 rounded-xl text-wood sm:hidden border border-paper-dark shrink-0">
                                            <Mail size={20} />
                                        </div>

                                        <div className="flex flex-col justify-center pt-1 pr-24 -ml-3"> {/* pr-24 to avoid overlap with badge */}
                                            <h3 className="text-xl sm:text-2xl font-black text-wood-dark tracking-tight mb-1 ml-1">
                                                {letter.receiverName || "İsimsiz Alıcı"}
                                            </h3>
                                            <span className="flex items-center gap-2 bg-paper-dark self-start px-3 py-1 rounded-full border border-paper-dark/30 text-ink-light text-xs font-bold">
                                                <Calendar size={14} className="text-seal/70" />
                                                {new Date(letter.createdAt).toLocaleDateString("tr-TR")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Section: Address */}
                                    <div className="flex items-start gap-3 bg-paper-dark p-4 rounded-2xl border border-paper-dark/20 w-full group-hover:border-seal/20 transition-colors">
                                        <MapPin size={18} className="text-seal/70 mt-0.5 shrink-0" />
                                        <div className="flex flex-col gap-1 flex-1">
                                            <span className="text-[10px] font-black text-ink-light uppercase tracking-widest opacity-60">Teslimat Adresi</span>
                                            <span className="text-sm sm:text-base leading-relaxed text-wood-dark/90 font-medium">
                                                {(() => {
                                                    const addr = (letter.data as any)?.address;
                                                    if (!addr) return letter.receiverCity || "Adres Belirtilmemiş";

                                                    if (addr.isPrison) {
                                                        return `${addr.prisonName || ""}${addr.wardNumber ? ` (${addr.wardNumber})` : ""}, ${addr.receiverAddress || ""}, ${addr.receiverCity || ""}`
                                                            .replace(/^, /, "")
                                                            .replace(/, , /g, ", ");
                                                    }
                                                    return `${addr.receiverAddress || ""}, ${addr.receiverCity || ""}`.replace(/^, /, "");
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Payment & Tracking */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-paper-dark/30 pt-4">
                                        {letter.trackingCode ? (
                                            <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-2xl px-5 py-3 flex flex-col group/tracking hover:bg-indigo-600/10 transition-all cursor-default">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">PTT Kargo Takip</span>
                                                <div className="flex items-center gap-2">
                                                    <Truck size={18} className="text-indigo-600" />
                                                    <span className="text-sm font-black text-indigo-900 font-mono">
                                                        {letter.trackingCode}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hidden sm:block"></div>
                                        )}

                                        <div className="text-right flex flex-col items-end px-4">
                                            <span className="text-[10px] text-ink-light uppercase tracking-widest font-black opacity-60">TOPLAM TUTAR</span>
                                            <span className="text-2xl font-black text-wood tracking-tight">
                                                {letter.totalAmount ? `${letter.totalAmount} TL` : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-seal/0 group-hover:bg-seal/5 transition-colors pointer-events-none flex items-center justify-center">
                                <span className="bg-white text-seal px-4 py-2 rounded-full font-black text-xs opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                                    Detayları Görüntüle
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Letter Details Modal */}
            <LetterDetailsModal
                letter={selectedLetter}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}
