"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Home } from "lucide-react";

export default function SuccessStep() {
    const [orderNumber, setOrderNumber] = useState("");

    useEffect(() => {
        // Generate order number only on client side after hydration
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setOrderNumber(`MKT-${Math.floor(100000 + Math.random() * 900000)}`);
    }, []);

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="bg-paper shadow-lg border border-paper-dark rounded-2xl p-8 sm:p-12 flex-col flex items-center text-center relative overflow-hidden w-full">
                {/* Soft Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-wood/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-seal/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>

                <div className="w-24 h-24 bg-seal/10 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-seal rounded-full animate-ping opacity-20"></div>
                    <CheckCircle2 size={48} className="text-seal" />
                </div>

                <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-wood-dark mb-4">
                    Mektubunuz Yola Çıkmaya Hazır!
                </h2>

                <p className="text-ink-light mb-8 max-w-md mx-auto leading-relaxed">
                    Ödemeniz başarıyla alındı. Mektubunuz özenle hazırlanıp, nostaljik mühürüyle kapatıldıktan sonra belirttiğiniz tarihte postaya teslim edilecektir.
                </p>

                <div className="bg-paper-light border border-paper-dark rounded-lg p-4 w-full max-w-sm mb-10 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-ink-light font-medium">Sipariş Numarası:</span>
                        <span className="font-mono font-bold text-wood-dark">#{orderNumber || "..."}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-ink-light font-medium">Durum:</span>
                        <span className="font-medium text-seal">Hazırlanıyor</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="bg-wood hover:bg-wood-dark text-paper px-8 py-3 rounded-md font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-2 active:scale-[0.98]"
                >
                    <Home size={18} />
                    Ana Sayfaya Dön
                </button>
            </div>
        </div>
    );
}
