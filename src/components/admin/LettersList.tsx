"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
    Mail,
    Calendar,
    User,
    MapPin,
    Package,
    Download,
    FileText,
    ExternalLink,
    Search,
    Truck,
    CheckCircle2,
    Clock,
    X,
    MessageSquare,
    Filter
} from "lucide-react";
import { updateLetterStatus, updateTrackingCode } from "@/app/actions/adminActions";
import { toast } from "react-hot-toast";
import { postcardCategories } from "@/components/extras/PostcardSection";

interface Letter {
    id: string;
    status: string;
    senderName: string | null;
    receiverName: string | null;
    receiverCity: string | null;
    totalAmount: number | null;
    trackingCode: string | null;
    data: any;
    createdAt: Date;
    user: {
        email: string | null;
    };
}

export default function LettersList({ initialLetters }: { initialLetters: Letter[] }) {
    const [letters, setLetters] = useState(initialLetters);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [trackingCode, setTrackingCode] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredLetters = letters.filter(l => {
        const matchesSearch = l.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.receiverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.receiverCity?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter ? l.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PAID": return <Clock className="text-blue-500" size={16} />;
            case "PREPARING": return <Package className="text-orange-500" size={16} />;
            case "SHIPPED": return <Truck className="text-purple-500" size={16} />;
            case "COMPLETED": return <CheckCircle2 className="text-emerald-500" size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PAID": return "Ödendi";
            case "PREPARING": return "Hazırlanıyor";
            case "SHIPPED": return "Kargoya Verildi";
            case "COMPLETED": return "Teslim Edildi";
            default: return status;
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        const res = await updateLetterStatus(id, newStatus);
        if (res.success) {
            setLetters(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            if (selectedLetter?.id === id) {
                setSelectedLetter(prev => prev ? { ...prev, status: newStatus } : null);
            }
            toast.success("Durum güncellendi");
        } else {
            toast.error(res.error || "Hata oluştu");
        }
        setIsUpdating(false);
    };

    const handleSaveTracking = async () => {
        if (!selectedLetter || !trackingCode) return;
        setIsUpdating(true);
        const res = await updateTrackingCode(selectedLetter.id, trackingCode);
        if (res.success) {
            setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { ...l, trackingCode, status: "SHIPPED" } : l));
            setSelectedLetter(prev => prev ? { ...prev, trackingCode, status: "SHIPPED" } : null);
            toast.success("Takip kodu kaydedildi ve kargoya verildi");
        } else {
            toast.error(res.error || "Hata oluştu");
        }
        setIsUpdating(false);
    };

    const handleExportPdf = async (letter: Letter) => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();

        const content = letter.data.letter.content.replace(/<[^>]*>/g, '\n'); // Simple HTML to text
        doc.setFontSize(16);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 10, 10);

        doc.save(`mektup_${letter.id.slice(-6)}.pdf`);
        toast.success("PDF indirildi");
    };

    const handleExportZip = async (letter: Letter) => {
        const toastId = toast.loading("Dosyalar hazirlaniyor...");
        try {
            const JSZip = (await import("jszip")).default;
            const { saveAs } = (await import("file-saver")).default;
            const zip = new JSZip();

            // 1. Add letter content as PDF
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF();
            const contentText = letter.data.letter.content.replace(/<[^>]*>/g, '\n');
            doc.setFontSize(12);
            const splitText = doc.splitTextToSize(contentText, 180);
            doc.text(splitText, 10, 10);
            const pdfBlob = doc.output('blob');
            zip.file("mektup.pdf", pdfBlob);

            // 2. Add summary
            const giftsList = letter.data.extras.gifts && letter.data.extras.gifts.length > 0
                ? letter.data.extras.gifts.map((g: any) => `${g.name} (x${g.quantity})`).join(', ')
                : 'Yok';

            const summary = `
Siparis No: ${letter.id}
Gonderen: ${letter.senderName}
Alici: ${letter.receiverName}
Sehir: ${letter.receiverCity}
Zarf: ${letter.data.letter.envelopeColor}
Kagit: ${letter.data.letter.paperColor}
Koku: ${letter.data.extras.scent}
Hediyeler: ${giftsList}
Tarih: ${new Date(letter.createdAt).toLocaleDateString('tr-TR')}
            `;
            zip.file("ozet.txt", summary);

            // 3. Fetch and add images
            const mediaFolder = zip.folder("medya");
            const photos = letter.data.extras.photos || [];
            const docs = letter.data.extras.documents || [];
            const postcardIds = letter.data.extras.postcards || [];

            const mediaItems: { url: string, name: string }[] = [];

            // Extract URLs
            let photoCount = 1;
            photos.forEach((p: any) => { if (p.url) mediaItems.push({ url: p.url, name: `resim_${photoCount++}` }); });

            let docCount = 1;
            docs.forEach((d: any) => { if (d.url) mediaItems.push({ url: d.url, name: `belge_${docCount++}` }); });

            // Resolve Postcard IDs
            let postcardCount = 1;
            postcardIds.forEach((id: string) => {
                for (const cat of postcardCategories) {
                    const found = cat.items.find((item: any) => item.id === id);
                    if (found) {
                        mediaItems.push({ url: found.image, name: `kartpostal_${postcardCount++}` });
                        break;
                    }
                }
            });

            for (let i = 0; i < mediaItems.length; i++) {
                try {
                    const { url, name } = mediaItems[i];
                    const response = await fetch(url);
                    const blob = await response.blob();

                    let ext = "jpg";
                    try {
                        const urlObj = new URL(url);
                        const pathExt = urlObj.pathname.split('.').pop()?.toLowerCase();
                        if (pathExt && ['jpg', 'jpeg', 'png', 'pdf', 'heic'].includes(pathExt)) {
                            ext = pathExt;
                        }
                    } catch (e) {
                        // ignore url parse error
                    }

                    mediaFolder?.file(`${name}.${ext}`, blob);
                } catch (e) {
                    console.error("Media fetch error", e);
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `mektup_paketi_${letter.id.slice(-6)}.zip`);
            toast.success("Mektup paketi indirildi", { id: toastId });
        } catch (error) {
            console.error("ZIP Error", error);
            toast.error("Paket olusturulurken hata olustu", { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Gönderen, alıcı veya şehir ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-2.5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${statusFilter ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Filter size={18} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-9999 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { setStatusFilter(null); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === null ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Tümü
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter("PAID"); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${statusFilter === "PAID" ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Ödendi
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter("PREPARING"); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${statusFilter === "PREPARING" ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Hazırlanıyor
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter("SHIPPED"); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${statusFilter === "SHIPPED" ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Kargoya Verildi
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter("COMPLETED"); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${statusFilter === "COMPLETED" ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Teslim Edildi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                    Toplam {filteredLetters.length} Mektup
                </div>
            </div>

            {/* LETTERS GRID - Chronological (Ascending) as requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLetters.map((l) => (
                    <div
                        key={l.id}
                        onClick={() => {
                            setSelectedLetter(l);
                            setTrackingCode(l.trackingCode || "");
                        }}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                    >
                        {/* Status Ribbon */}
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg flex items-center gap-1 ${l.status === "PAID" ? "bg-blue-50 text-blue-600" :
                            l.status === "PREPARING" ? "bg-orange-50 text-orange-600" :
                                l.status === "SHIPPED" ? "bg-purple-50 text-purple-600" :
                                    "bg-emerald-50 text-emerald-600"
                            }`}>
                            {getStatusIcon(l.status)}
                            {getStatusText(l.status)}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate max-w-[150px]">
                                    {l.receiverName}
                                </h4>
                            </div>
                        </div>

                        <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <User size={14} className="text-slate-400 shrink-0" />
                                <span className="text-slate-500 shrink-0">Gönderen:</span>
                                <span className="text-slate-900 font-medium truncate">{l.senderName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                <span className="text-slate-500 shrink-0">Şehir:</span>
                                <span className="text-slate-900 font-medium">{l.receiverCity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                <span className="text-slate-500 shrink-0">Tarih:</span>
                                <span className="text-slate-900 font-medium">
                                    {new Date(l.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900">{l.totalAmount} TL</span>
                            <div className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Detaylar <ExternalLink size={12} />
                            </div>
                        </div>
                    </div>
                ))}

                {filteredLetters.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Mektup Bulunamadı</h3>
                        <p className="text-slate-500">Arama kriterlerinize uygun mektup kaydı bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedLetter && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedLetter(null)}
                    ></div>

                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Status Header */}
                        <div className={`px-6 py-4 flex items-center justify-between ${selectedLetter.status === "PAID" ? "bg-blue-500 text-white" :
                            selectedLetter.status === "PREPARING" ? "bg-orange-500 text-white" :
                                selectedLetter.status === "SHIPPED" ? "bg-purple-500 text-white" :
                                    "bg-emerald-500 text-white"
                            }`}>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(selectedLetter.status)}
                                <span className="font-bold uppercase tracking-wider text-sm">{getStatusText(selectedLetter.status)}</span>
                            </div>
                            <button
                                onClick={() => setSelectedLetter(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Order & Letter Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sipariş Bilgileri</h3>
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Sipariş No:</span>
                                                <span className="font-bold text-slate-900">#{selectedLetter.id.toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Müşteri:</span>
                                                <span className="font-medium text-slate-900">{selectedLetter.user.email}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Tutar:</span>
                                                <span className="font-bold text-slate-900">{selectedLetter.totalAmount} TL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Mektup Özellikleri</h3>
                                        <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-slate-500 block">Zarf Rengi</span>
                                                <span className="text-sm font-bold text-slate-900">{selectedLetter.data.letter.envelopeColor}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 block">Kağıt Rengi</span>
                                                <span className="text-sm font-bold text-slate-900">{selectedLetter.data.letter.paperColor}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 block">Koku</span>
                                                <span className="text-sm font-bold text-slate-900">{selectedLetter.data.extras.scent}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 block">Gönderim Tarihi</span>
                                                <span className="text-sm font-bold text-slate-900">{selectedLetter.data.extras.deliveryDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ekstralar</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLetter.data.extras.photos?.length > 0 && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                                                    {selectedLetter.data.extras.photos.length} Fotoğraf
                                                </span>
                                            )}
                                            {selectedLetter.data.extras.documents?.length > 0 && (
                                                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">
                                                    {selectedLetter.data.extras.documents.length} Belge
                                                </span>
                                            )}
                                            {selectedLetter.data.extras.postcards?.length > 0 && (
                                                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                                                    {selectedLetter.data.extras.postcards.length} Kartpostal
                                                </span>
                                            )}
                                            {selectedLetter.data.extras.includeCalendar && (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                                    2026 Takvim
                                                </span>
                                            )}
                                            {selectedLetter.data.extras.gifts?.length > 0 && (
                                                <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-100">
                                                    Hediye Var
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Addresses & Processing */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gönderen</h3>
                                            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                                <p className="font-bold text-slate-900 mb-1">{selectedLetter.data.address.senderName}</p>
                                                <p className="text-sm text-slate-600 leading-relaxed">{selectedLetter.data.address.senderAddress}</p>
                                                <p className="text-sm text-slate-900 font-bold mt-2">{selectedLetter.data.address.senderCity}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Alıcı</h3>
                                            <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm relative">
                                                {selectedLetter.data.address.isPrison && (
                                                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Cezaevi</span>
                                                )}
                                                <p className="font-bold text-slate-900 mb-1">{selectedLetter.data.address.receiverName}</p>
                                                <p className="text-sm text-slate-900 font-bold mt-2">{selectedLetter.data.address.receiverCity}</p>
                                                {selectedLetter.data.address.isPrison ? (
                                                    <>
                                                        <p className="text-sm font-bold text-slate-800">{selectedLetter.data.address.prisonName}</p>
                                                        {selectedLetter.data.address.fatherName && <p className="text-xs text-slate-600">Baba Adı: {selectedLetter.data.address.fatherName}</p>}
                                                        {selectedLetter.data.address.wardNumber && <p className="text-xs text-slate-600">Koğuş: {selectedLetter.data.address.wardNumber}</p>}
                                                        <p className="text-sm text-slate-600 leading-relaxed mt-1">{selectedLetter.data.address.receiverAddress}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedLetter.data.address.receiverAddress}</p>
                                                )}
                                                {selectedLetter.data.address.receiverPhone && (
                                                    <p className="text-xs text-slate-500 mt-1">{selectedLetter.data.address.receiverPhone}</p>
                                                )}
                                                {selectedLetter.data.address.prisonNote && (
                                                    <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-100">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Kurum Notu</span>
                                                        <p className="text-xs text-slate-600 italic">{selectedLetter.data.address.prisonNote}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS UPDATE ACTIONS */}
                                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mektubu İşle</h3>

                                        <div className="space-y-4">
                                            {selectedLetter.status === "PAID" && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Bu mektubu hazırlamaya başlamak istediğinize emin misiniz? (Kullanıcıya bildirim e-postası gönderilecektir)")) {
                                                            handleUpdateStatus(selectedLetter.id, "PREPARING");
                                                        }
                                                    }}
                                                    disabled={isUpdating}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                >
                                                    <Package size={18} />
                                                    Hazırlamaya Başla
                                                </button>
                                            )}

                                            {(selectedLetter.status === "PAID" || selectedLetter.status === "PREPARING") && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">PTT Takip Kodu</label>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Örn: KP01234567890"
                                                            value={trackingCode}
                                                            onChange={(e) => setTrackingCode(e.target.value)}
                                                            className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-400 transition-all"
                                                        />
                                                        <button
                                                            onClick={handleSaveTracking}
                                                            disabled={isUpdating || !trackingCode}
                                                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 whitespace-nowrap shrink-0"
                                                        >
                                                            Kaydet
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedLetter.status === "SHIPPED" && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm bg-purple-500/10 p-3 rounded-lg">
                                                        <Truck size={18} />
                                                        Takip Kodu: {selectedLetter.trackingCode}
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateStatus(selectedLetter.id, "COMPLETED")}
                                                        disabled={isUpdating}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                        Teslim Edildi İşaretle
                                                    </button>
                                                </div>
                                            )}

                                            {selectedLetter.status === "COMPLETED" && (
                                                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold py-4">
                                                    <CheckCircle2 size={24} />
                                                    İşlem Başarıyla Tamamlandı
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EXPORT SECTION */}
                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dışarı Aktar</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleExportPdf(selectedLetter)}
                                        className="flex items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-slate-900">Mektubu Yazdır</span>
                                            <span className="text-xs text-slate-500">PDF olarak kaydet</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleExportZip(selectedLetter)}
                                        className="flex items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm transition-colors">
                                            <Download size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-slate-900">Tümünü İndir (.ZIP)</span>
                                            <span className="text-xs text-slate-500">Resimler & Belgeler</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* LETTER CONTENT PREVIEW */}
                            <div className="mt-12">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mektup Metni</h3>
                                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 font-serif text-slate-800 leading-relaxed max-h-96 overflow-y-auto print:max-h-none print:p-0 print:bg-white print:border-none shadow-inner prose prose-slate max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: selectedLetter.data.letter.content }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
