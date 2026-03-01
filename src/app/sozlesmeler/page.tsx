"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, ScrollText, UserCheck, Scale } from "lucide-react";
import {
    MESAFELI_SATIS_SOZLESMESI,
    KISISEL_VERILERIN_KORUNMASI_SOZLESMESI,
    UYELIK_SOZLESMESI,
    GIZLILIK_VE_GUVENLIK_POLITIKASI
} from "@/lib/contracts/groups";

const contracts = [
    {
        id: "uyelik",
        title: "Üyelik Sözleşmesi",
        icon: <UserCheck size={20} />,
        content: UYELIK_SOZLESMESI
    },
    {
        id: "kvkk",
        title: "KVKK Aydınlatma Metni",
        icon: <Shield size={20} />,
        content: KISISEL_VERILERIN_KORUNMASI_SOZLESMESI
    },
    {
        id: "mesafeli-satis",
        title: "Mesafeli Satış Sözleşmesi",
        icon: <Scale size={20} />,
        content: MESAFELI_SATIS_SOZLESMESI
    },
    {
        id: "gizlilik",
        title: "Gizlilik ve Güvenlik Politikası",
        icon: <FileText size={20} />,
        content: GIZLILIK_VE_GUVENLIK_POLITIKASI
    }
];

export default function SozlesmelerPage() {
    const [activeTab, setActiveTab] = useState(contracts[0].id);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-500">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-8 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <h2 className="font-playfair text-2xl font-bold text-wood-dark mb-6 px-2">Sözleşmelerimiz</h2>
                    {contracts.map((contract) => (
                        <button
                            key={contract.id}
                            onClick={() => setActiveTab(contract.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === contract.id
                                    ? "bg-wood text-paper shadow-lg shadow-wood/20"
                                    : "hover:bg-paper-light text-ink-light hover:text-wood-dark"
                                }`}
                        >
                            {contract.icon}
                            <span className="text-sm font-semibold">{contract.title}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-paper shadow-xl border border-wood/10 rounded-2xl p-6 md:p-10 relative overflow-hidden min-h-[600px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                        {contracts.map((contract) => (
                            <div
                                key={contract.id}
                                className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab === contract.id ? "block" : "hidden"}`}
                            >
                                <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-8 border-b border-paper-dark pb-6">
                                    {contract.title}
                                </h1>
                                <div className="prose prose-sm sm:prose-base text-ink max-w-none whitespace-pre-wrap leading-relaxed font-kurale">
                                    {contract.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
