"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Printer, Inbox, ShieldCheck, Mail, Smartphone, FileText, Clock, MapPin, CreditCard, Send, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    shortDesc: string;
}

interface HizmetlerClientProps {
    adminWhatsApp?: string;
}

export default function HizmetlerClient({ adminWhatsApp = "0 541 944 68 48" }: HizmetlerClientProps) {
    const [openId, setOpenId] = useState<string | null>("whatsapp");

    const plainPhone = adminWhatsApp.replace(/\s/g, "").replace(/^0/, "90");

    const services: Service[] = [
        {
            id: "temel",
            title: "Temel Mektup Gönderimi",
            icon: <Mail className="text-wood" size={24} />,
            shortDesc: "Dijital ortamda yazdığınız mektupları özenle basıp adrese teslim ediyoruz.",
            content: (
                <div className="space-y-4">
                    <p>Mektuplaş olarak, geleneksel mektup kültürünü dijitalin hızıyla birleştiriyoruz. Sitemiz üzerinden yazdığınız mektuplar, yüksek kaliteli kağıtlara basılır ve seçtiğiniz zarf seçenekleriyle paketlenerek PTT aracılığıyla alıcısına ulaştırılır.</p>
                    <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                        <li>Farklı kağıt ve zarf seçenekleri</li>
                        <li>Fotoğraf ekleme özelliği</li>
                        <li>Renkli veya siyah-beyaz baskı</li>
                        <li>Takip numarası ile anlık izleme</li>
                    </ul>
                </div>
            )
        },
        {
            id: "gelen-kutusu",
            title: "Gelen Kutusu Özelliği",
            icon: <Inbox className="text-wood" size={24} />,
            shortDesc: "Sevdiklerinizden gelen mektupları dijital ortamda görüntüleyin.",
            content: (
                <div className="space-y-4">
                    <p>Siz mektup gönderdiğinizde, alıcınızın size cevap yazmasını kolaylaştırıyoruz. Gelen kutusu özelliği sayesinde, sevdiklerinizin size yazdığı fiziksel mektuplar tarafımızca teslim alınır, taranır ve panelinize yüklenir.</p>
                    <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                        <li>Fiziksel mektupları beklemeye son</li>
                        <li>Mektuplarınız dijital arşivinizde saklanır</li>
                        <li>Güvenli ve gizli tarama süreci</li>
                    </ul>
                </div>
            )
        },
        {
            id: "admin-mektup",
            title: "Admin Tarafından Mektup Alma",
            icon: <ShieldCheck className="text-wood" size={24} />,
            shortDesc: "Kurumsal ve güvenilir mektup yönetim hizmeti.",
            content: (
                <div className="space-y-4">
                    <p>Özellikle cezaevlerindeki yakınlarınız için sunduğumuz bu hizmette, admin ekibimiz tüm süreci sizin adınıza yönetir. Mektupların alınması, taranması ve güvenle size ulaştırılması profesyonel ekibimiz tarafından titizlikle gerçekleştirilir.</p>
                </div>
            )
        },
        {
            id: "whatsapp",
            title: "WhatsApp ile Mektup",
            icon: <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z" fill="#BFC8D0" />
                <path d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" fill="url(#paint0_linear_87_7264)" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z" fill="white" />
                <path d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z" fill="white" />
                <defs>
                    <linearGradient id="paint0_linear_87_7264" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#5BD066" />
                        <stop offset="1" stop-color="#27B43E" />
                    </linearGradient>
                </defs>
            </svg>,
            shortDesc: "Mesaj atar gibi mektup yazın, biz basıp adrese teslim edelim!",
            content: (
                <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-green-800 font-medium italic">"Teknoloji bazen karmaşık gelebilir veya sadece vaktiniz kısıtlı olabilir. Mektup Yaz olarak, sevdiklerinize ulaşmanın en kolay yolunu geliştirdik: WhatsApp üzerinden mektup göndermek!"</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-wood-dark mb-2 flex items-center gap-2">
                            <Smartphone size={18} />
                            Neden WhatsApp ile Mektup Göndermelisiniz?
                        </h4>
                        <ul className="space-y-2 ml-2">
                            <li className="flex gap-2 text-sm"><span className="text-green-500 font-bold">•</span> <strong>İnanılmaz Kolaylık:</strong> Dijital uygulamaları kullanmakta zorlanıyorsanız veya pratiklik arıyorsanız, bu hizmet tam size göre.</li>
                            <li className="flex gap-2 text-sm"><span className="text-green-500 font-bold">•</span> <strong>Her Şey Tek Bir Sohbet Ekranında:</strong> Mektubunuzu yazın, fotoğraflarınızı seçin, belgelerinizi yükleyin ve gönderin. Hepsi bu!</li>
                            <li className="flex gap-2 text-sm"><span className="text-green-500 font-bold">•</span> <strong>Kişiye Özel Hazırlık:</strong> Bizimle paylaştığınız içerikler, ekibimiz tarafından sizin adınıza panelimize aktarılır, özenle basılır ve resmi PTT kanalıyla yola çıkarılır.</li>
                        </ul>
                    </div>

                    <div className="bg-paper-dark/10 p-4 rounded-lg">
                        <p className="font-bold text-center mb-4 text-ink">
                            <a
                                href={`https://wa.me/${plainPhone}?text=${encodeURIComponent("Merhaba, WhatsApp üzerinden mektup göndermek istiyorum.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 transition-colors underline underline-offset-4"
                            >
                                {adminWhatsApp}
                            </a>
                            {" "}numaralı kurumsal hattımızı sitemizdeki WhatsApp butonuna tıklayarak doğrudan sohbete başlayın.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { step: "1", text: "Mektubunuzu Yazın", desc: "Sohbete \"WhatsApp ile mektup göndermek istiyorum\" yazın ve ardından mektubunuzu tek seferde yazıp gönderin." },
                                { step: "2", text: "İçeriklerinizi Ekleyin", desc: "Tıpkı bir arkadaşınıza gönderir gibi, mektubunuza eklemek istediğiniz fotoğrafları veya PDF/Word formatındaki belgeleri yükleyin." },
                                { step: "3", text: "Adres Bilgilerini Paylaşın", desc: "Gönderici ve alıcı (özellikle cezaevi adresi) ad-soyad ve adres bilgilerini tek mesajda paylaşın." },
                                { step: "4", text: "Ödemenizi Tamamlayın", desc: "Güvenli ödeme linkiyle kartla veya IBAN üzerinden Havale/EFT ile ödemenizi yapın." },
                                { step: "5", text: "Gerisini Bize Bırakın", desc: "Saat 16:00'e kadar tamamlanan siparişler aynı gün basılır, zarflanır ve yola çıkarılır." },
                                { step: "6", text: "Anlık Takip", desc: "Mektubunuz yola çıktığında takip numaranız SMS ile cebinize gelir." }
                            ].map((s, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-wood text-white text-xs flex items-center justify-center font-bold">{s.step}</span>
                                    <div>
                                        <p className="text-sm font-bold text-ink">{s.text}</p>
                                        <p className="text-xs text-ink-light leading-snug">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-wood-dark mb-2">Kimler İçin Uygundur?</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm ml-2 text-ink-light">
                            <li>Akıllı telefon üzerinden form doldurmayı sevmeyenler</li>
                            <li>Sitemizde teknik sorunlar yaşayanlar</li>
                            <li>En hızlı ve en pratik yolu tercih eden herkes!</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: "fax",
            title: "Cezaevine Fax",
            icon: <Printer className="text-blue-600" size={24} />,
            shortDesc: "Geleneksel Bürokrasiye Modern Çözüm - Anında Faks Gönderimi.",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-blue-800 font-medium italic">"Cezaevi idareleri, tüm kayıtların resmi ve izlenebilir olması amacıyla hala eski teknolojilere, özellikle de Faks (Fax) sistemine ihtiyaç duyar."</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-wood-dark mb-3 flex items-center gap-2">
                            <FileText size={18} />
                            Neden Faks Göndermeniz Gerekebilir?
                        </h4>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Clock className="text-blue-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm font-bold">Acil Durumlar</p>
                                    <p className="text-xs text-ink-light">Vefat durumunda cenazeye katılım gibi süreçlerde belgelerin saniyeler içinde iletilmesi hayati önem taşır.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <ShieldCheck className="text-blue-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm font-bold">Resmi Belgeler</p>
                                    <p className="text-xs text-ink-light">E-görüşme izinleri, telefon görüş hakkı belgeleri ve evraklar.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Send className="text-blue-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm font-bold">Dilekçeler</p>
                                    <p className="text-xs text-ink-light">Mahkumun hakları için idareye sunulması gereken imzalı dilekçelerin hızlı iletimi.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-paper-dark/10 p-4 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-ink mb-2">Mektuplaş Nasıl Yardımcı Olur?</h4>
                        <p className="text-sm text-ink-light mb-4">Faks cihazı arama derdine, kırtasiye kuyruklarına son veriyoruz! İster trende, ister vapurda, isterseniz dünyanın bir ucunda olun; faks göndermek artık sadece birkaç saniyenizi alacak.</p>

                        <div className="space-y-4">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-light">Nasıl Çalışır?</h5>
                            <ol className="space-y-3">
                                <li className="flex gap-3 items-center">
                                    <span className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                                    <p className="text-sm">Gönderilecek belgeyi veya dilekçeyi hazırlayın.</p>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <span className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                                    <p className="text-sm">Bize <a href={`https://wa.me/${plainPhone}?text=${encodeURIComponent("Merhaba, cezaevine faks gönderimi hakkında bilgi almak istiyorum.")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-bold underline underline-offset-4 transition-colors">WhatsApp</a> üzerinden belgenin fotoğrafını veya PDF halini iletin.</p>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <span className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                                    <p className="text-sm">Belgenizi anında cezaevine faks yoluyla ulaştıralım.</p>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {services.map((service) => (
                <div
                    key={service.id}
                    className={`border ${openId === service.id ? "border-wood ring-1 ring-wood/5" : "border-paper-dark"} rounded-xl overflow-hidden transition-all bg-paper-light/50 backdrop-blur-sm shadow-sm`}
                >
                    <button
                        onClick={() => setOpenId(openId === service.id ? null : service.id)}
                        className={`w-full text-left p-4 sm:p-6 flex items-center justify-between transition-colors focus:outline-none ${openId === service.id ? "bg-wood/5" : "hover:bg-paper-dark/10"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${openId === service.id ? "bg-wood/10" : "bg-paper-dark/20"}`}>
                                {service.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg sm:text-xl ${openId === service.id ? "text-wood" : "text-ink"}`}>
                                    {service.title}
                                </h3>
                                <p className={`text-sm mt-1 transition-opacity ${openId === service.id ? "opacity-0 h-0 overflow-hidden" : "text-ink-light opacity-100"}`}>
                                    {service.shortDesc}
                                </p>
                            </div>
                        </div>
                        {openId === service.id ? (
                            <ChevronUp size={24} className="text-wood flex-shrink-0" />
                        ) : (
                            <ChevronDown size={24} className="text-ink-light flex-shrink-0" />
                        )}
                    </button>

                    <AnimatePresence initial={false}>
                        {openId === service.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="px-6 pb-8 text-ink-light leading-relaxed">
                                    <div className="pt-4 border-t border-paper-dark animate-in fade-in slide-in-from-top-2 duration-500">
                                        {service.content}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
