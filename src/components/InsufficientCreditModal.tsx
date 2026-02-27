"use client";

import React from "react";
import { X, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface InsufficientCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredCredit: number;
    currentBalance: number;
    actionName?: string; // Hangi işlemi yapmaya çalışıyordu? "Mektup göndermek", "Mektup açmak"
}

export default function InsufficientCreditModal({
    isOpen,
    onClose,
    requiredCredit,
    currentBalance,
    actionName = "Bu işlemi gerçekleştirmek"
}: InsufficientCreditModalProps) {
    if (!isOpen) return null;

    const deficit = requiredCredit - currentBalance;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-gradient-to-br from-rose-500 to-orange-500 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg relative z-10">
                                <Wallet size={32} className="text-white" />
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-20"
                        >
                            <X size={18} />
                        </button>

                        {/* Content */}
                        <div className="p-6 sm:p-8 text-center">
                            <h3 className="text-2xl font-bold font-playfair text-slate-800 mb-2">
                                Yetersiz Bakiye
                            </h3>
                            <p className="text-slate-500 mb-6">
                                <span className="font-medium text-slate-700">{actionName}</span> için yeterli krediniz bulunmamaktadır.
                            </p>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mevcut</p>
                                    <div className="text-2xl font-bold text-slate-700">{currentBalance} <span className="text-xl">🪙</span></div>
                                </div>
                                <div className="text-slate-300">
                                    <ArrowRight size={24} />
                                </div>
                                <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                                    <p className="text-xs font-semibold text-rose-400/80 uppercase tracking-wider mb-1">Gereken</p>
                                    <div className="text-2xl font-bold text-rose-600">{requiredCredit} <span className="text-xl">🪙</span></div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 mb-6 bg-amber-50 border border-amber-100 p-3 rounded-xl inline-block w-full">
                                İşleme devam edebilmek için <strong className="text-amber-700">{deficit} kredi</strong> (veya daha fazlasını) yüklemeniz gerekiyor.
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/app/cuzdan"
                                    onClick={onClose}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                                >
                                    <Wallet size={18} />
                                    Cüzdana Git ve Yükle
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-transparent hover:bg-slate-50 text-slate-500 font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    İptal ve Geri Dön
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
