"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, Loader2, Info, ArrowRight, User, MapPin, Image as ImageIcon, Trash2, Plus } from "lucide-react";
import Editor from "@/components/Editor";
import { useLetterStore } from "@/store/letterStore";
import { createLetter } from "@/app/actions/letterActions";
import { getUserProfile } from "@/app/actions/userActions";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

interface DMWritingModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    onSuccess?: () => void;
}

export default function DMWritingModal({ isOpen, onClose, recipientId, recipientName, onSuccess }: DMWritingModalProps) {
    const { letter, address, extras, updateAddress, resetStore } = useLetterStore();
    const [isSending, setIsSending] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize store for DM
    useEffect(() => {
        if (isOpen) {
            resetStore();
            updateAddress({
                receiverId: recipientId,
                receiverName: recipientName,
                isPrison: false,
                receiverCity: "Dijital",
                receiverAddress: "Sistem Tarafından İletilecek"
            });
            fetchUserInfo();
        }
    }, [isOpen, recipientId, recipientName]);

    const fetchUserInfo = async () => {
        setIsLoadingUser(true);
        try {
            const res = await getUserProfile();
            if (res.success && res.user) {
                updateAddress({
                    senderName: res.user.name || "",
                    senderCity: "İstanbul", // Default city if not available in profile
                    senderAddress: "Dijital Gönderim"
                });
            }
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (extras.photos.length >= 3) {
            toast.error("En fazla 3 fotoğraf ekleyebilirsiniz.");
            return;
        }

        setIsUploadingPhoto(true);
        const loadingToast = toast.loading("Fotoğraf yükleniyor...");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Presigned URL alınamadı");
            const { uploadUrl, publicUrl, previewUrl } = await res.json();

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (uploadRes.ok) {
                const newFile = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    url: publicUrl,
                    previewUrl: previewUrl,
                    type: "photo" as "photo" | "doc"
                };

                useLetterStore.getState().updateExtras({ photos: [...extras.photos, newFile] });
                toast.success("Fotoğraf başarıyla yüklendi.", { id: loadingToast });
            } else {
                throw new Error("S3 yükleme başarısız");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Dosya yüklenirken bir hata oluştu.", { id: loadingToast });
        } finally {
            setIsUploadingPhoto(false);
            if (e.target) e.target.value = "";
        }
    };

    const removePhoto = (id: string) => {
        useLetterStore.getState().updateExtras({ photos: extras.photos.filter(f => f.id !== id) });
    };

    const handleSend = async () => {
        if (!letter.content || letter.content === "<p></p>" || letter.wordCount === 0) {
            toast.error("Lütfen mektup içeriğini yazın.");
            return;
        }

        if (!address.senderName) {
            toast.error("Lütfen gönderici bilgilerinizi kontrol edin.");
            return;
        }

        setIsSending(true);
        try {
            const letterData = {
                letter: letter,
                extras: {
                    scent: "Yok",
                    photos: extras.photos,
                    documents: [],
                    postcards: [],
                    includeCalendar: false
                },
                address: address
            };

            const res = await createLetter(letterData);
            if (res.success) {
                toast.success("Mektubunuz başarıyla iletildi!");
                onClose();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Mektup gönderilemedi.");
            }
        } catch (error) {
            console.error("SEND_DM_ERROR", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setIsSending(false);
        }
    };

    // Paper colors for DM
    const paperColors: Record<string, string> = {
        "Beyaz": "#ffffff",
        "Saman": "#f4e4bc",
        "Pembe": "#fdf1f4",
        "Açık Mavi": "#eef7fd",
    };
    const currentBgColor = paperColors[letter.paperColor] || "#ffffff";

    if (!mounted || typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-wood-dark/10 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-paper shadow-2xl overflow-hidden flex flex-col sm:rounded-[2.5rem] border border-white/20"
                    >
                        {/* Header */}
                        <div className="bg-wood-dark text-paper p-6 sm:px-10 flex items-center justify-between border-b-4 border-seal shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex w-12 h-12 bg-seal rounded-xl items-center justify-center shadow-lg">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h2 className="font-playfair text-xl sm:text-2xl font-bold">Mektup Yazın</h2>
                                    <p className="text-paper/70 text-xs sm:text-sm font-medium flex items-center gap-1">
                                        Alıcı: <span className="text-paper font-bold">{recipientName}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Area (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
                            {/* Info Banner */}
                            <div className="mb-8 bg-seal/5 border border-seal/20 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm animate-in slide-in-from-top duration-500">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-seal shadow-md shrink-0">
                                    <Info size={24} />
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="font-playfair text-lg font-bold text-wood-dark">Dijital Teslimat Bilgilendirmesi</h4>
                                    <p className="text-ink-light text-[13px] leading-relaxed font-medium">
                                        Bu mektup bir üye adına yazılmaktadır. Gönderdiğinizde anında alıcının <span className="text-seal font-bold">gelen kutusuna</span> düşecektir.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                                {/* Letter Editor Area */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl border border-paper-dark/50 overflow-hidden shadow-sm">
                                        <Editor paperColor={currentBgColor} />
                                    </div>
                                </div>

                                {/* Sidebar / Settings */}
                                <div className="space-y-6">
                                    {/* Sender Info (Simplified) */}
                                    <div className="bg-white/50 border border-paper-dark rounded-2xl p-6 space-y-4 shadow-sm">
                                        <h3 className="font-playfair font-bold text-wood-dark border-b border-paper-dark pb-2 flex items-center gap-2">
                                            <User size={18} className="text-seal" />
                                            Gönderen Bilgileri
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-ink-light uppercase tracking-wider">Ad Soyad</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-paper/50 border border-paper-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-seal transition-all"
                                                    value={address.senderName}
                                                    onChange={(e) => updateAddress({ senderName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-ink-light uppercase tracking-wider">Şehir</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-paper/50 border border-paper-dark rounded-lg px-3 py-2 text-sm outline-none focus:border-seal transition-all"
                                                    value={address.senderCity}
                                                    onChange={(e) => updateAddress({ senderCity: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-ink-light leading-relaxed italic border-t border-paper-dark/50 pt-2">
                                            * Mektubunuzun altında bu bilgiler imza olarak görünecektir.
                                        </p>
                                    </div>

                                    {/* Quick Settings */}
                                    <div className="bg-white/50 border border-paper-dark rounded-2xl p-6 space-y-4 shadow-sm">
                                        <h3 className="font-playfair font-bold text-wood-dark border-b border-paper-dark pb-2 flex items-center gap-2">
                                            <MapPin size={18} className="text-seal" />
                                            Görünüm
                                        </h3>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-ink-light uppercase tracking-wider">Kağıt Rengi</label>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.keys(paperColors).map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => useLetterStore.getState().updateLetter({ paperColor: color })}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${letter.paperColor === color ? 'border-seal scale-110 shadow-md' : 'border-paper-dark hover:border-wood'}`}
                                                        style={{ backgroundColor: paperColors[color] }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="bg-white/50 border border-paper-dark rounded-2xl p-6 space-y-4 shadow-sm">
                                        <h3 className="font-playfair font-bold text-wood-dark border-b border-paper-dark pb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon size={18} className="text-seal" />
                                                Fotoğraf Ekle
                                            </div>
                                            <span className="text-xs text-ink-light font-medium">{extras.photos.length}/3</span>
                                        </h3>

                                        <input
                                            type="file"
                                            ref={photoInputRef}
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            accept="image/*"
                                        />

                                        {extras.photos.length < 3 && (
                                            <button
                                                onClick={() => photoInputRef.current?.click()}
                                                disabled={isUploadingPhoto}
                                                className="w-full flex flex-col items-center justify-center p-4 bg-paper-dark/30 hover:bg-paper-dark border-2 border-dashed border-wood/50 rounded-xl transition-all hover:border-wood group relative overflow-hidden disabled:opacity-50"
                                            >
                                                {isUploadingPhoto ? <Loader2 size={24} className="animate-spin text-wood/50 mb-2" /> : <Plus size={24} className="text-wood-dark mb-2 group-hover:scale-110 transition-transform" />}
                                                <span className="text-xs font-bold text-ink tracking-wide">YENİ FOTOĞRAF</span>
                                            </button>
                                        )}

                                        {extras.photos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                {extras.photos.map((file: any) => (
                                                    <div key={file.id} className="relative group bg-paper p-1 rounded border border-paper-dark shadow-sm">
                                                        <div className="aspect-[4/3] bg-paper-dark/50 rounded flex flex-col justify-center items-center overflow-hidden relative">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={file.previewUrl || file.url} alt={file.name} className="absolute inset-0 w-full h-full object-cover" />
                                                        </div>
                                                        <button
                                                            onClick={() => removePhoto(file.id)}
                                                            className="absolute -top-2 -right-2 bg-seal text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-paper shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-paper-dark shrink-0">
                            <div className="hidden sm:block">
                                <p className="text-xs text-ink-light font-medium flex items-center gap-1">
                                    <ArrowRight size={14} className="text-seal" />
                                    Bu işlem sonunda herhangi bir kargo ücreti<span className="font-bold text-seal">yoktur.</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-ink hover:bg-paper-dark rounded-xl transition-colors border border-paper-dark"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={isSending || isLoadingUser}
                                    className="flex-1 sm:flex-none bg-seal text-paper px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70"
                                >
                                    {isSending ? "Mektup İletiliyor..." : "Hemen Gönder"}
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Soft Background Decor */}
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-seal/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none -z-10"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
