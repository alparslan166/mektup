import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFAQs } from "@/app/actions/faqActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FAQClient from "./FAQClient";

export default async function SSSPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const faqs = await getFAQs();

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-4 sm:p-8 lg:p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                <div className="text-center mb-10">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-wood-dark mb-4">
                        Sıkça Sorulan Sorular
                    </h1>
                    <p className="text-ink-light text-lg">
                        Mektubunuzu yazmadan önce merak ettiğiniz konuların cevaplarını burada bulabilirsiniz.
                    </p>
                </div>

                <FAQClient initialFaqs={faqs} isAdmin={isAdmin} />

                <div className="mt-12 p-6 bg-seal/5 rounded-xl border border-seal/20 text-center">
                    <p className="text-ink font-medium mb-2">Başka bir sorunuz mu var?</p>
                    <Link href="/iletisim" className="text-seal hover:text-wood font-bold transition-colors underline underline-offset-4">
                        Bizimle İletişime Geçin
                    </Link>
                </div>
            </div>
        </div>
    );
}
