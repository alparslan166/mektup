"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search, Upload, Loader2, X, Plus, User as UserIcon,
    Image as ImageIcon, Trash2, CheckCircle, Mail, ArrowRight, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import { searchUsersForAdmin, createIncomingLetter, getAllIncomingLetters } from "@/app/actions/incomingLetterActions";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function AdminGelenMektuplar() {
    // User search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);

    // Image upload
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Existing incoming letters
    const [existingLetters, setExistingLetters] = useState<any[]>([]);
    const [loadingLetters, setLoadingLetters] = useState(true);
    const [expandedLetter, setExpandedLetter] = useState<string | null>(null);

    useEffect(() => {
        fetchExistingLetters();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const fetchExistingLetters = async () => {
        setLoadingLetters(true);
        const res = await getAllIncomingLetters();
        if (res.success && res.letters) {
            setExistingLetters(res.letters);
        }
        setLoadingLetters(false);
    };

    const handleSearch = async () => {
        setIsSearching(true);
        const res = await searchUsersForAdmin(searchQuery);
        if (res.success && res.users) {
            setSearchResults(res.users);
        }
        setIsSearching(false);
    };

    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Lütfen bir kullanıcı seçin.");
            return;
        }
        if (images.length === 0) {
            toast.error("Lütfen en az bir fotoğraf yükleyin.");
            return;
        }

        setIsUploading(true);

        try {
            // 1. Upload each image to S3
            const uploadedUrls: string[] = [];

            for (const img of images) {
                // Get presigned URL
                const presignRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: img.file.name,
                        fileType: img.file.type,
                    }),
                });
                const presignData = await presignRes.json();

                if (!presignData.uploadUrl) {
                    throw new Error("S3 upload URL alınamadı.");
                }

                // Upload to S3
                await fetch(presignData.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": img.file.type },
                    body: img.file,
                });

                uploadedUrls.push(presignData.publicUrl);
            }

            // 2. Create incoming letter record
            const res = await createIncomingLetter(selectedUser.id, uploadedUrls, description || undefined);

            if (res.success) {
                toast.success(`${selectedUser.name || selectedUser.email} için mektup başarıyla yüklendi!`);
                // Reset form
                setSelectedUser(null);
                setImages([]);
                setDescription("");
                fetchExistingLetters();
            } else {
                toast.error(res.error || "Bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Yükleme sırasında bir hata oluştu.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gelen Mektuplar</h2>
                    <p className="text-slate-500">Kullanıcılar adına gelen fiziksel mektupların fotoğraflarını yükleyin.</p>
                </div>
            </header>

            {/* Upload Form */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Mail size={20} />
                    Yeni Mektup Yükle
                </h3>

                {/* User Search */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-600">Kullanıcı Seç</label>

                    {selectedUser ? (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <UserIcon size={20} className="text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-800">{selectedUser.name || "İsimsiz"}</p>
                                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="İsim veya e-posta ile arayın..."
                                className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* Search results dropdown */}
                            {(searchResults.length > 0 || isSearching) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 size={24} className="text-slate-400 animate-spin" />
                                        </div>
                                    ) : (
                                        searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                            >
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <UserIcon size={16} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{user.name || "İsimsiz"}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-600">Mektup Fotoğrafları</label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 group">
                                <Image
                                    src={img.preview}
                                    alt={`Mektup sayfa ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                    Sayfa {idx + 1}
                                </div>
                            </div>
                        ))}

                        {/* Add Image Button */}
                        <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all">
                            <Plus size={28} className="text-slate-400 mb-2" />
                            <span className="text-xs text-slate-400 font-medium">Fotoğraf Ekle</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Description (optional) */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Açıklama (Opsiyonel)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mektup hakkında kısa bir not..."
                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all resize-none h-24"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={isUploading || !selectedUser || images.length === 0}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Yükleniyor...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Mektubu Yükle
                        </>
                    )}
                </button>
            </div>

            {/* Existing Incoming Letters */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">Yüklenen Mektuplar</h3>
                </div>

                {loadingLetters ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="text-slate-400 animate-spin" />
                    </div>
                ) : existingLetters.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        Henüz yüklenmiş mektup bulunmuyor.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {existingLetters.map((letter: any) => (
                            <div key={letter.id} className="px-6 py-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedLetter(expandedLetter === letter.id ? null : letter.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <ImageIcon size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">
                                                {letter.user?.name || "İsimsiz"} - {letter.user?.email}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(letter.createdAt).toLocaleDateString("tr-TR")} • {letter.images?.length || 0} fotoğraf
                                                {letter.isRead && <span className="ml-2 text-emerald-500">✓ Okundu</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {expandedLetter === letter.id ? (
                                        <ChevronUp size={18} className="text-slate-400" />
                                    ) : (
                                        <ChevronDown size={18} className="text-slate-400" />
                                    )}
                                </div>

                                {expandedLetter === letter.id && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {(letter.images || []).map((url: string, idx: number) => (
                                            <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200">
                                                <Image
                                                    src={url}
                                                    alt={`Mektup sayfa ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                        {letter.description && (
                                            <div className="col-span-full mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                                <strong>Not:</strong> {letter.description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
