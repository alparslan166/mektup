import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HizmetlerClient from "@/app/hizmetlerimiz/HizmetlerClient";
import { Metadata } from "next";
import { getAdminWhatsAppNumber } from "@/app/actions/contactActions";

export const metadata: Metadata = {
    title: "Hizmetlerimiz | Mektuplaş",
    description: "Mektuplaş tarafından sunulan tüm hizmetler: WhatsApp ile mektup, cezaevine faks, dijital mektup gönderimi ve daha fazlası.",
};

export default async function HizmetlerPage() {
    const { phone: adminWhatsApp } = await getAdminWhatsAppNumber();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-4 sm:p-8 lg:p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                <div className="text-center mb-10">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-wood-dark mb-4 drop-shadow-sm">
                        Hizmetlerimiz
                    </h1>
                    <p className="text-ink-light text-lg max-w-2xl mx-auto">
                        Sevdiklerinize ulaşmanın en kolay ve en güvenilir yollarını sizin için geliştirdik.
                    </p>
                </div>

                <HizmetlerClient adminWhatsApp={adminWhatsApp} />

                <div className="mt-12 p-6 bg-seal/5 rounded-xl border border-seal/20 text-center">
                    <p className="text-ink font-medium mb-2">Hizmetlerimiz hakkında daha fazla bilgi mi lazım?</p>
                    <Link href="/iletisim" className="text-seal hover:text-wood font-bold transition-colors underline underline-offset-4">
                        Bizimle İletişime Geçin
                    </Link>
                </div>
            </div>
        </div>
    );
}
