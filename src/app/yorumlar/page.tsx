"use client";

import React, { useState } from 'react';
import { Star, MessageCircle, Reply, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function YorumlarPage() {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);

    const comments = [
        {
            initials: "B A",
            name: "Burak A.",
            date: "10:05 - 21/02/2026",
            rating: 5,
            title: "Mektup göndermede",
            body: "Çok kolaylık sağlayan bir uygulama. Zamanlama ve gönderim hızı gerçekten bahsedildiği gibi süper.",
        },
        {
            initials: "Ş E",
            name: "Şeyma E.",
            date: "09:13 - 21/02/2026",
            rating: 4,
            title: "Tavsiye",
            body: "Çok güzel bir uygulama kolaylık sağlıyor her açıdan. Kağıt kalitesi ve kokular muazzam, sevgilim çok beğendi.",
        },
        {
            initials: "M K",
            name: "Murat K.",
            date: "14:22 - 19/02/2026",
            rating: 5,
            title: "Harika Bir Anı",
            body: "Kendi kendime yazdığım mektup 1 yıl sonra elime ulaştığında yaşadığım duyguyu tarif edemem. Teşekkürler Geleceğe Mektup!",
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-md border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden mb-12">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-wood/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Left Score Section */}
                    <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center text-center">
                        <h2 className="text-wood font-playfair font-bold text-xl mb-6 uppercase tracking-widest drop-shadow-sm">Ortalama Puan</h2>

                        <div className="border border-wood/50 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center bg-paper-light/50 relative shadow-inner">
                            {/* Decorative dots based on screenshot */}
                            <div className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #8b5a2b 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.1 }}></div>

                            <div className="text-5xl font-playfair font-bold text-ink mb-4 relative z-10">4,89</div>
                            <div className="flex text-wood mb-3 relative z-10">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill="currentColor" strokeWidth={1} />
                                ))}
                            </div>
                            <div className="text-sm font-bold text-ink-light relative z-10">Toplam : <span className="text-ink">14648 Yorum</span></div>
                        </div>

                        <p className="mt-6 text-sm text-ink-light leading-relaxed">
                            Bu sayfada kullanıcılarımızın Mektuplaş hakkındaki yorumlarını okuyabilir veya yeni yorum yazabilirsiniz.
                        </p>
                    </div>

                    {/* Right Form Section */}
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col">
                        <div className="mb-8 p-4 bg-[#effdf4] border border-[#bbf7d0] rounded-lg">
                            <p className="text-ink font-medium text-[13px] mb-2">Soru ve sorunlarınızı lütfen WhatsApp hattımıza yazınız.</p>
                            <a href="#" className="inline-flex items-center text-[#166534] hover:text-[#14532d] font-bold text-[15px] transition-colors">
                                <MessageCircle size={18} className="mr-2" /> WhatsApp Yardım ( +90 850 305 81 35 )
                            </a>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[13px] font-bold text-ink">Puanınız (1-5) :</span>
                            <div className="flex gap-1 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={20}
                                        fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                                        className={(hoverRating || rating) >= star ? "text-wood" : "text-ink-light"}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                        </div>

                        <form className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Yorum Başlığınız"
                                className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3.5 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all text-sm font-medium"
                            />
                            <textarea
                                rows={4}
                                placeholder="Yorumunuzu buraya yazınız."
                                className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3.5 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none text-sm font-medium"
                            ></textarea>

                            <div className="flex justify-end mt-2">
                                <button type="button" className="bg-wood hover:bg-wood-dark text-paper font-bold py-2.5 px-8 rounded-md transition-colors shadow-sm text-sm tracking-wide">
                                    Gönder
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-6">
                {comments.map((comment, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 align-start">
                        {/* Avatar and Info */}
                        <div className="flex flex-col items-center justify-center p-4 w-full sm:w-28 shrink-0 bg-paper shadow-sm border border-paper-dark rounded-xl h-fit">
                            <div className="w-12 h-12 rounded-full bg-paper-dark text-wood-dark border border-wood/20 flex items-center justify-center font-playfair font-bold text-lg mb-2 shadow-inner">
                                {comment.initials}
                            </div>
                            <div className="flex text-wood mb-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < comment.rating ? "currentColor" : "none"} className={i < comment.rating ? "text-wood" : "text-ink-light"} strokeWidth={1.5} />
                                ))}
                            </div>
                            <span className="text-[10px] text-ink-light font-medium text-center">{comment.date.split(' - ')[1]}<br />{comment.date.split(' - ')[0]}</span>
                        </div>

                        {/* Comment Content & Reply Box */}
                        <div className="flex-1 bg-paper shadow-sm border border-paper-dark rounded-xl p-5 sm:p-6 relative group transition-colors flex flex-col justify-start">
                            <h4 className="font-playfair italic font-bold text-lg text-wood-dark mb-2">{comment.title}</h4>
                            <p className="text-ink leading-relaxed text-[15px] mb-8">
                                {comment.body}
                            </p>

                            {/* Reply Input Area */}
                            {replyingTo === idx && (
                                <div className="mt-4 pt-4 border-t border-paper-dark animate-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        rows={3}
                                        placeholder={`${comment.name} kişisine yanıt yazın...`}
                                        className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none text-sm font-medium mb-3"
                                        autoFocus
                                    ></textarea>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="px-4 py-2 rounded-md font-bold text-xs text-ink-light hover:bg-paper-dark transition-colors"
                                        >
                                            İptal
                                        </button>
                                        <button className="bg-wood hover:bg-wood-dark text-paper px-4 py-2 rounded-md font-bold text-xs shadow-sm transition-colors">
                                            Yanıtı Gönder
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
