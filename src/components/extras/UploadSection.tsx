"use client";

import React, { useState } from "react";
import { Image as ImageIcon, FileText, Trash2 } from "lucide-react";

export default function UploadSection() {
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string; type: "photo" | "doc"; name: string; url?: string }[]>([]);

    const handleUploadPhoto = () => {
        // Mocking an upload
        if (uploadedFiles.length >= 50) return;
        setUploadedFiles([...uploadedFiles, { id: Date.now().toString(), type: "photo", name: `Fotoğraf_${uploadedFiles.length + 1}.jpg` }]);
    };

    const handleUploadDoc = () => {
        // Mocking an upload
        if (uploadedFiles.length >= 50) return;
        setUploadedFiles([...uploadedFiles, { id: Date.now().toString(), type: "doc", name: `Belge_${uploadedFiles.length + 1}.pdf` }]);
    };

    const removeFile = (id: string) => {
        setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
    };

    const photoCount = uploadedFiles.filter(f => f.type === "photo").length;
    const docCount = uploadedFiles.filter(f => f.type === "doc").length;

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

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                    onClick={handleUploadPhoto}
                    className="flex flex-col items-center justify-center p-8 bg-paper-dark/30 hover:bg-paper-dark border-2 border-dashed border-wood/50 rounded-xl transition-all hover:border-wood group w-48 mx-auto sm:mx-0 shadow-sm"
                >
                    <ImageIcon size={40} className="text-wood-dark mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-ink tracking-wide">FOTOĞRAF</span>
                    <span className="font-bold text-ink tracking-wide">EKLE</span>
                </button>

                <button
                    onClick={handleUploadDoc}
                    className="flex flex-col items-center justify-center p-8 bg-paper-dark/30 hover:bg-paper-dark border-2 border-dashed border-ink-light/40 rounded-xl transition-all hover:border-ink-light group w-48 mx-auto sm:mx-0 shadow-sm"
                >
                    <FileText size={40} className="text-ink mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-ink tracking-wide">BELGE</span>
                    <span className="font-bold text-ink tracking-wide">EKLE</span>
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-sm font-medium text-wood-dark">
                    Toplamda en fazla <span className="font-bold text-seal">50</span> adet fotoğraf/belge ekleyebilirsiniz.
                </p>
            </div>

            {/* Uploaded Files List */}
            <div className="mt-8 bg-paper-dark/10 border border-paper-dark rounded-lg min-h-[100px] p-4">
                {uploadedFiles.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-ink-light text-sm italic">
                        Fotoğraf veya belge eklenmemiştir.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {photoCount > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-wood-dark mb-2 px-2 border-b border-paper-dark pb-1">Eklenen Fotoğraflar ({photoCount})</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {uploadedFiles.filter(f => f.type === "photo").map((file) => (
                                        <div key={file.id} className="relative group bg-paper p-2 rounded border border-paper-dark shadow-sm">
                                            <div className="aspect-[4/3] bg-paper-dark/50 rounded mb-2 flex flex-col justify-center items-center text-xs text-ink-light truncate overflow-hidden">
                                                <ImageIcon size={20} className="mb-1 text-wood-dark/50" />
                                                Prev
                                            </div>
                                            <p className="text-[10px] text-center truncate px-1 text-ink">{file.name}</p>
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="absolute -top-2 -right-2 bg-seal text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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
                                    {uploadedFiles.filter(f => f.type === "doc").map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-paper p-2 pr-3 rounded border border-paper-dark shadow-sm min-w-[200px] group">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-paper-dark rounded">
                                                    <FileText size={16} className="text-ink" />
                                                </div>
                                                <p className="text-xs font-medium truncate max-w-[120px]">{file.name}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(file.id)}
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
