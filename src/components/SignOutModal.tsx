"use client";

import React from "react";
import { LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignOutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#1c1917]/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-paper-light border border-paper-dark rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-ink-light hover:text-ink transition-colors p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mx-auto w-16 h-16 bg-seal/10 rounded-full flex items-center justify-center mb-6"
                            >
                                <LogOut className="text-seal" size={32} />
                            </motion.div>

                            <h3 className="font-playfair text-2xl font-bold text-ink mb-3 tracking-wide">
                                Çıkış Yapılsın mı?
                            </h3>

                            <p className="text-ink-light text-sm mb-8 leading-relaxed font-medium">
                                Oturumunuzu kapatmak üzeresiniz. Devam etmek istiyor musunuz?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full bg-seal text-paper py-3.5 rounded-xl font-bold hover:bg-seal-hover transition-all shadow-md active:scale-[0.98]"
                                >
                                    Çıkış Yap
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-paper-dark/50 text-ink py-3.5 rounded-xl font-bold hover:bg-paper-dark transition-all border border-paper-dark/30"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SignOutModal;
