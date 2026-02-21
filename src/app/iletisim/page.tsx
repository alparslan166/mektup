import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";

export const metadata = {
    title: "İletişim | Geleceğe Mektup",
    description: "Bizimle iletişime geçin. Soru, görüş ve önerilerinizi dinlemeye hazırız.",
};

export default function IletisimPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-wood-dark mb-4">
                        İletişim
                    </h1>
                    <p className="text-ink-light text-lg">
                        Mektuplarınız, kargo süreçleri veya aklınıza takılan herhangi bir soru için bize dilediğiniz zaman ulaşabilirsiniz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink mb-1">E-Posta</h3>
                                <p className="text-ink-light text-sm mb-2">Her türlü sorunuz için bize yazabilirsiniz.</p>
                                <a href="mailto:info@gelecegemektup.com.tr" className="text-seal font-medium hover:underline">info@gelecegemektup.com.tr</a>
                            </div>
                        </div>

                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink mb-1">Telefon / WhatsApp</h3>
                                <p className="text-ink-light text-sm mb-2">Hızlı iletişim için çalışma saatlerimiz içinde arayabilirsiniz.</p>
                                <a href="tel:+905550000000" className="text-seal font-medium hover:underline">0 (555) 000 00 00</a>
                            </div>
                        </div>

                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink mb-1">Ofis Adresi</h3>
                                <p className="text-ink-light text-sm leading-relaxed">
                                    Nostalji Mah. Kalem Sk. No: 1<br />
                                    Kadıköy / İstanbul
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-ink-light/80 text-sm italic mt-8">
                            <Clock size={16} /> Çalışma Saatleri: Hafta içi 09:00 - 18:00
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-paper-dark/20 border border-wood/20 p-8 rounded-xl shadow-sm">
                        <h3 className="font-playfair text-2xl font-bold text-wood-dark mb-6">Bize Mesaj Gönderin</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-ink-light block mb-1">Adınız Soyadınız</label>
                                <input
                                    type="text"
                                    placeholder="Ad Soyad"
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-ink-light block mb-1">E-Posta Adresiniz</label>
                                <input
                                    type="email"
                                    placeholder="mail@ornek.com"
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-ink-light block mb-1">Mesajınız</label>
                                <textarea
                                    rows={5}
                                    placeholder="Size nasıl yardımcı olabiliriz?"
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="button"
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-3 rounded-md font-bold shadow-md transition-all mt-4"
                            >
                                Mesajı Gönder
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
