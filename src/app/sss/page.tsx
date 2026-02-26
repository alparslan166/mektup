"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SSSPage() {
    const defaultFaqs = [
        {
            question: "Geleceğe Mektup tam olarak nedir?",
            answer: "Geleceğe Mektup, sevdiklerinize veya kendinize, belirlediğiniz ileri bir tarihte teslim edilmek üzere fiziksel bir mektup göndermenizi sağlayan nostaljik bir köprüdür. Dijital mesajların aksine somut, kokulu ve duygusal bir deneyim sunar."
        },
        {
            question: "Mektuplarım ne kadar sürede teslim ediliyor?",
            answer: "Senaryonuza bağlıdır. 'Hemen Postaya Ver (İlk İş Günü)' seçeneğini seçerseniz ertesi gün kargoya verilir. '1 Hafta', '1 Ay' veya 'Özel Tarih' seçerseniz, belirlediğiniz gün kargoya verilecek şekilde sistemimizde güvenle saklanır."
        },
        {
            question: "Koku seçeneği nedir ve nasıl uygulanıyor?",
            answer: "Nostaljik deneyimi artırmak için mektubunuzla birlikte gitmesini istediğiniz özel esanslar ekleyebilirsiniz. Gül, Lavanta, Okyanus veya Nostaljik Kahve kokularından birini seçtiğinizde, zarf kapatılmadan önce kağıda o koku hafifçe sprey ile uygulanır."
        },
        {
            question: "Mektubuma fotoğraf ekleyebilir miyim?",
            answer: "Evet! Ekstralar adımında mektubunuzla birlikte gitmesini istediğiniz fotoğrafları (en fazla 50 adede kadar) ekleyebilirsiniz. Bu fotoğraflar mektup kağıdınızla birlikte zarfın içine yerleştirilir."
        },
        {
            question: "Teslimatı kim yapıyor?",
            answer: "Teslimatlarımız anlaşmalı olduğumuz profesyonel kargo / kurye firmaları (Sürat, Yurtiçi veya özel kuryeler) aracılığıyla yapılmaktadır. Mektup yola çıktığında alıcının telefon numarasına SMS veya sisteme girdiğiniz maile kargo takip numarası iletilir."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
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

                <div className="space-y-4">
                    {defaultFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-paper-dark rounded-lg overflow-hidden transition-all bg-paper-light"
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-ink hover:text-wood transition-colors focus:outline-none focus:bg-paper-dark/10"
                            >
                                <span>{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp size={20} className="text-wood flex-shrink-0" />
                                ) : (
                                    <ChevronDown size={20} className="text-ink-light flex-shrink-0" />
                                )}
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-ink-light leading-relaxed">
                                            <div className="pt-2 border-t border-paper-dark">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

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
