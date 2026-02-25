"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, FileText, Trash2, Loader2, Plus } from "lucide-react";
import { useLetterStore } from "@/store/letterStore";
import { toast } from "react-hot-toast";

export default function UploadSection() {
    const { extras, updateExtras } = useLetterStore();
    const [isUploading, setIsUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "doc") => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (extras.photos.length + extras.documents.length >= 50) {
            toast.error("En fazla 50 dosya ekleyebilirsiniz.");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading("Dosya yükleniyor...");

        try {
            // 1. Get Presigned URL
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

            // 2. Upload directly to S3
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
                    type: type
                };

                if (type === "photo") {
                    updateExtras({ photos: [...extras.photos, newFile] });
                } else {
                    updateExtras({ documents: [...extras.documents, newFile] });
                }
                toast.success("Dosya başarıyla yüklendi.", { id: loadingToast });
            } else {
                throw new Error("S3 yükleme başarısız");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Dosya yüklenirken bir hata oluştu: " + (err as Error).message, { id: loadingToast });
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const removeFile = (id: string, type: "photo" | "doc") => {
        if (type === "photo") {
            updateExtras({ photos: extras.photos.filter(f => f.id !== id) });
        } else {
            updateExtras({ documents: extras.documents.filter(f => f.id !== id) });
        }
    };

    const photoCount = extras.photos.length;
    const docCount = extras.documents.length;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h3 className="font-playfair text-2xl font-bold text-wood-dark flex items-center justify-center gap-2">
                    <span className="text-seal">»</span> Fotoğraf & Belge <span className="text-seal">«</span>
                </h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    Yüklediğiniz fotoğraflar 10x15 özel kodak fotoğraf kağıdına, belgeler ise A4 kağıdına basılır.
                    Galerinizden eklediğiniz görsel bir metin, evrak, dilekçe vb. ise lütfen bu görseli &quot;Belge Ekle&quot; alanından yükleyiniz.
                </p>
            </div>

            {/* Hidden Inputs */}
            <input
                type="file"
                ref={photoInputRef}
                onChange={(e) => handleFileChange(e, "photo")}
                className="hidden"
                accept="image/*"
            />
            <input
                type="file"
                ref={docInputRef}
                onChange={(e) => handleFileChange(e, "doc")}
                className="hidden"
                accept=".pdf,.doc,.docx,image/*"
            />

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex flex-col items-center justify-center p-8 bg-paper-dark/30 hover:bg-paper-dark border-2 border-dashed border-wood/50 rounded-xl transition-all hover:border-wood group w-48 mx-auto sm:mx-0 shadow-sm relative overflow-hidden disabled:opacity-50"
                >
                    {isUploading ? <Loader2 size={40} className="animate-spin text-wood/30" /> : <ImageIcon size={40} className="text-wood-dark mb-4 group-hover:scale-110 transition-transform" />}
                    <span className="font-bold text-ink tracking-wide">FOTOĞRAF</span>
                    <span className="font-bold text-ink tracking-wide">EKLE</span>
                    {!isUploading && <Plus size={16} className="absolute top-2 right-2 text-wood/40" />}
                </button>

                <button
                    onClick={() => docInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex flex-col items-center justify-center p-8 bg-paper-dark/30 hover:bg-paper-dark border-2 border-dashed border-ink-light/40 rounded-xl transition-all hover:border-ink-light group w-48 mx-auto sm:mx-0 shadow-sm relative overflow-hidden disabled:opacity-50"
                >
                    {isUploading ? <Loader2 size={40} className="animate-spin text-ink-light/30" /> : <FileText size={40} className="text-ink mb-4 group-hover:scale-110 transition-transform" />}
                    <span className="font-bold text-ink tracking-wide">BELGE</span>
                    <span className="font-bold text-ink tracking-wide">EKLE</span>
                    {!isUploading && <Plus size={16} className="absolute top-2 right-2 text-ink-light/40" />}
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-sm font-medium text-wood-dark">
                    Toplamda en fazla <span className="font-bold text-seal">50</span> adet fotoğraf/belge ekleyebilirsiniz.
                </p>
            </div>

            {/* Uploaded Files List */}
            <div className="mt-8 bg-paper-dark/10 border border-paper-dark rounded-lg min-h-[100px] p-4">
                {photoCount + docCount === 0 ? (
                    <div className="flex items-center justify-center h-full text-ink-light text-sm italic">
                        Fotoğraf veya belge eklenmemiştir.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {photoCount > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-wood-dark mb-2 px-2 border-b border-paper-dark pb-1">Eklenen Fotoğraflar ({photoCount})</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {extras.photos.map((file) => (
                                        <div key={file.id} className="relative group bg-paper p-2 rounded border border-paper-dark shadow-sm">
                                            <div className="aspect-[4/3] bg-paper-dark/50 rounded mb-2 flex flex-col justify-center items-center text-xs text-ink-light truncate overflow-hidden relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={file.previewUrl || file.url} alt={file.name} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            {/* <p className="text-[10px] text-center truncate px-1 text-ink">{file.name}</p> */}
                                            <button
                                                onClick={() => removeFile(file.id, "photo")}
                                                className="absolute -top-2 -right-2 bg-seal text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {docCount > 0 && (
                            <div className={photoCount > 0 ? "pt-4" : ""}>
                                <h4 className="text-sm font-bold text-wood-dark mb-2 px-2 border-b border-paper-dark pb-1">Eklenen Belgeler ({docCount})</h4>
                                <div className="flex flex-wrap gap-3">
                                    {extras.documents.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-paper p-2 pr-3 rounded border border-paper-dark shadow-sm min-w-[200px] group">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-paper-dark rounded">
                                                    <FileText size={16} className="text-ink" />
                                                </div>
                                                <p className="text-xs font-medium truncate max-w-[120px]">{file.name}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(file.id, "doc")}
                                                className="text-seal hover:text-seal-hover opacity-50 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
