"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLetterStore } from "@/store/letterStore";
import { createPortal } from "react-dom";
import {
    X,
    Mail,
    Calendar,
    MapPin,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    User,
    Gift,
    Image as ImageIcon,
    FileText,
    Flower2,
    CalendarDays,
    Download,
    Loader2
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface LetterDetailsModalProps {
    letter: any;
    isOpen: boolean;
    onClose: () => void;
    onReply?: (recipientId: string, recipientName: string) => void;
}

export default function LetterDetailsModal({ letter, isOpen, onClose, onReply }: LetterDetailsModalProps) {
    if (!isOpen || !letter || typeof document === "undefined") return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PAID": return {
                text: "Ödendi/Beklemede",
                icon: <Clock size={16} />,
                class: "bg-blue-500 text-white"
            };
            case "PREPARING": return {
                text: "Hazırlanıyor",
                icon: <Package size={16} />,
                class: "bg-orange-500 text-white"
            };
            case "SHIPPED": return {
                text: "Kargoya Verildi",
                icon: <Truck size={16} />,
                class: "bg-purple-500 text-white"
            };
            case "COMPLETED": return {
                text: "Teslim Edildi",
                icon: <CheckCircle2 size={16} />,
                class: "bg-emerald-500 text-white"
            };
            default: return {
                text: status,
                icon: <Clock size={16} />,
                class: "bg-slate-500 text-white"
            };
        }
    };

    const status = getStatusConfig(letter.status);
    const router = useRouter();
    const updateAddress = useLetterStore(state => state.updateAddress);
    const resetStore = useLetterStore(state => state.resetStore);

    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleReply = () => {
        const recipientId = letter.userId;
        const recipientName = letter.senderName || letter.data?.address?.senderName || "Mektup Arkadaşı";

        if (onReply) {
            onReply(recipientId, recipientName);
        } else {
            resetStore();
            updateAddress({
                receiverName: recipientName,
                receiverId: recipientId,
                isPrison: false
            });
            onClose();
            router.push("/mektup-yaz/akisi");
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        const element = document.getElementById("letter-content-for-pdf");
        if (!element) {
            toast.error("İçerik bulunamadı.");
            setIsDownloading(false);
            return;
        }

        try {
            // Tailwind v4 uses oklab() for box-shadows which html2canvas doesn't support yet.
            // Temporarily disable box-shadow inline to bypass this.
            const originalBoxShadow = element.style.boxShadow;
            element.style.boxShadow = "none";

            // Also need to find all children with shadow and disable them
            const shadowElements = element.querySelectorAll('[class*="shadow"]');
            const originalShadows: string[] = [];

            shadowElements.forEach((el: any) => {
                originalShadows.push(el.style.boxShadow);
                el.style.boxShadow = 'none';
            });

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            // Restore original styles
            element.style.boxShadow = originalBoxShadow;
            shadowElements.forEach((el: any, index) => {
                el.style.boxShadow = originalShadows[index];
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`mektup-${letter.id.slice(-8).toUpperCase()}.pdf`);
            toast.success("PDF başarıyla indirildi.");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("PDF oluşturulurken bir hata oluştu.");
        } finally {
            setIsDownloading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-wood-dark/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-4xl bg-paper-light rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 fade-in duration-300 border border-white/20">
                {/* Header */}
                <div className={`px-8 py-5 flex items-center justify-between shadow-lg ${status.class} relative z-10`}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            {status.icon}
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm">{status.text}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 duration-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
                    {/* Top Row: IDs and Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Order info */}
                        <div className="bg-paper-dark/30 p-6 rounded-3xl border border-paper-dark/40 shadow-inner">
                            <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={14} className="text-seal" /> Sipariş Detayları
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-paper-dark pb-2">
                                    <span className="text-ink-light font-medium">Sipariş No:</span>
                                    <span className="font-black text-wood-dark font-mono">#{letter.id.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-paper-dark pb-2">
                                    <span className="text-ink-light font-medium">Tutar:</span>
                                    <span className="font-black text-wood-dark text-lg">{letter.totalAmount} TL</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-ink-light font-medium">Tarih:</span>
                                    <span className="font-bold text-wood-dark">{new Date(letter.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Letter characteristics */}
                        <div className="bg-paper-dark/30 p-6 rounded-3xl border border-paper-dark/40 shadow-inner">
                            <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Mail size={14} className="text-seal" /> Mektup Özellikleri
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="text-[10px] font-bold text-ink-light/60 uppercase block mb-1">Zarf Rengi</span>
                                    <span className="font-bold text-wood-dark">{letter.data?.letter?.envelopeColor || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-ink-light/60 uppercase block mb-1">Kağıt Rengi</span>
                                    <span className="font-bold text-wood-dark">{letter.data?.letter?.paperColor || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-ink-light/60 uppercase block mb-1">Koku</span>
                                    <span className="font-bold text-wood-dark">{letter.data?.extras?.scent || 'Yok'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-ink-light/60 uppercase block mb-1">Gönderim Tarihi</span>
                                    <span className="font-bold text-wood-dark italic">
                                        {letter.data?.extras?.deliveryDate || 'Normal'}
                                        {letter.data?.extras?.deliveryDate === 'Ozel' && letter.data?.extras?.customDate && ` (${letter.data.extras.customDate})`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extras Row */}
                    <div>
                        <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-5 ml-2">Eklenenler & Ekstralar</h3>
                        <div className="flex flex-wrap gap-3">
                            {letter.data?.extras?.photos?.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-black rounded-2xl border border-blue-100 shadow-sm">
                                    <ImageIcon size={14} /> {letter.data.extras.photos.length} Fotoğraf
                                </div>
                            )}
                            {letter.data?.extras?.documents?.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 text-xs font-black rounded-2xl border border-orange-100 shadow-sm">
                                    <FileText size={14} /> {letter.data.extras.documents.length} Doküman
                                </div>
                            )}
                            {letter.data?.extras?.postcards?.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 text-xs font-black rounded-2xl border border-purple-100 shadow-sm">
                                    <ImageIcon size={14} /> {letter.data.extras.postcards.length} Kartpostal
                                </div>
                            )}
                            {letter.data?.extras?.includeCalendar && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black rounded-2xl border border-emerald-100 shadow-sm">
                                    <CalendarDays size={14} /> 2026 Takvim
                                </div>
                            )}
                            {letter.data?.extras?.gifts?.length > 0 && (
                                <div className="flex flex-col gap-3 w-full mt-2">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 text-xs font-black rounded-2xl border border-rose-100 shadow-sm self-start">
                                        <Gift size={14} /> {letter.data.extras.gifts.length} Hediye
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                        {letter.data.extras.gifts.map((gift: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 text-xs font-bold text-rose-800">
                                                <span>{gift.name}</span>
                                                <span className="bg-rose-100 px-2 py-0.5 rounded text-rose-900">x{gift.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(!letter.data?.extras || Object.values(letter.data.extras).every(v => Array.isArray(v) ? v.length === 0 : !v)) && (
                                <span className="text-ink-light italic text-sm ml-2">Ekstra eklenmemiş.</span>
                            )}
                        </div>
                    </div>

                    {/* Addresses Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sender */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-2 flex items-center gap-2">
                                <User size={14} className="text-seal" /> Gönderici
                            </h3>
                            <div className="p-6 bg-white border border-paper-dark/30 rounded-3xl shadow-sm transition-all hover:border-seal/20">
                                <p className="font-black text-wood-dark text-lg mb-1">{letter.data?.address?.senderName}</p>
                                <p className="text-sm text-ink-light/80 leading-relaxed max-w-xs">{letter.data?.address?.senderAddress}</p>
                                <div className="mt-3 inline-block px-3 py-1 bg-paper-dark/40 rounded-lg text-wood font-black text-xs">
                                    {letter.data?.address?.senderCity}
                                </div>
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-2 flex items-center gap-2">
                                <MapPin size={14} className="text-seal" /> Alıcı
                            </h3>
                            <div className="p-6 bg-paper-dark border border-paper-dark/50 rounded-3xl shadow-sm relative group/receiver transition-all hover:bg-white hover:border-blue-200">
                                {letter.data?.address?.isPrison && (
                                    <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">Cezaevi</span>
                                )}
                                <p className="font-black text-wood-dark text-lg mb-1">{letter.data?.address?.receiverName}</p>

                                <div className="space-y-1 mt-3">
                                    {letter.data?.address?.isPrison ? (
                                        <>
                                            <p className="text-sm font-black text-blue-700 flex items-center gap-1.5 font-kurale italic">
                                                <Package size={14} /> {letter.data.address.prisonName}
                                            </p>
                                            {letter.data.address.fatherName && (
                                                <p className="text-xs text-ink-light font-bold">Baba Adı: <span className="text-wood-dark">{letter.data.address.fatherName}</span></p>
                                            )}
                                            {letter.data.address.wardNumber && (
                                                <p className="text-xs text-ink-light font-bold">Koğuş No: <span className="text-wood-dark">{letter.data.address.wardNumber}</span></p>
                                            )}
                                            <p className="text-sm text-ink/80 leading-relaxed mt-2 border-t border-paper-dark pt-2">{letter.data.address.receiverAddress}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-ink-light/80 leading-relaxed">{letter.data?.address?.receiverAddress}</p>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-wood/10 rounded-lg text-wood font-black text-xs">
                                        {letter.data?.address?.receiverCity}
                                    </span>
                                    {letter.data?.address?.receiverPhone && (
                                        <span className="text-[11px] text-ink-light font-medium bg-paper-dark/50 px-2 py-1 rounded-lg">
                                            {letter.data.address.receiverPhone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gallery section */}
                    {(letter.data?.extras?.photos?.length > 0 || letter.data?.extras?.postcards?.length > 0) && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={14} className="text-seal" /> Görsel Galeri
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-paper-dark/20 rounded-3xl border border-paper-dark/40 shadow-inner">
                                {/* Photos */}
                                {letter.data?.extras?.photos?.map((photo: any, i: number) => (
                                    <div key={`photo-${i}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/50 shadow-sm hover:shadow-md transition-all">
                                        <img
                                            src={photo.url}
                                            alt={`Fotoğraf ${i + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-black text-ink uppercase">Fotoğraf</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Postcards */}
                                {letter.data?.extras?.postcards?.map((id: string, i: number) => {
                                    // Local resolution of postcards
                                    const trItems = Array.from({ length: 8 }).map((_, idx) => ({
                                        id: "tr-" + idx,
                                        image: "https://picsum.photos/seed/tr_image_" + idx + "/600/400",
                                    }));
                                    const loveItems = Array.from({ length: 8 }).map((_, idx) => ({
                                        id: "love-" + idx,
                                        image: "https://picsum.photos/seed/love_image_" + idx + "/600/600",
                                    }));
                                    const allPostcards = [...trItems, ...loveItems];
                                    const card = allPostcards.find(c => c.id === id);

                                    if (!card) return null;

                                    return (
                                        <div key={`postcard-${i}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/50 shadow-sm hover:shadow-md transition-all bg-paper-light">
                                            <img
                                                src={card.image}
                                                alt={`Kartpostal ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-black text-ink uppercase">Kartpostal</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Letter Content */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-[10px] font-black text-ink-light uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} className="text-seal" /> Mektup Metni Önizleme
                        </h3>
                        <div
                            id="letter-content-for-pdf"
                            className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-paper-dark shadow-inner min-h-[300px] relative"
                        >
                            {/* Decorative seal/paper effect */}
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Mail size={120} />
                            </div>

                            <div
                                className="font-kurale text-wood-dark leading-loose text-lg whitespace-pre-wrap prose prose-stone max-w-none"
                                dangerouslySetInnerHTML={{ __html: letter.data?.letter?.content || 'Mektup içeriği bulunamadı.' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer / CTA if needed */}
                <div className="p-6 bg-paper-dark/20 border-t border-paper-dark/30 flex justify-center gap-4">
                    <button
                        onClick={handleReply}
                        className="bg-ink text-white px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                    >
                        <Mail size={20} />
                        <span>Cevapla</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="bg-seal text-white px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-wood-dark text-paper-light px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
