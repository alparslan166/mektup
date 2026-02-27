"use client";

import React, { useState, useEffect, useRef } from "react";
import { addCreditToUser, searchUsers } from "@/app/actions/adminCreditActions";
import { Loader2, Coins, Search, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddCreditForm() {
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const res = await searchUsers(searchQuery);
                if (res.users) {
                    setSearchResults(res.users);
                    setShowDropdown(true);
                }
                setIsSearching(false);
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectUser = (selectedEmail: string) => {
        setEmail(selectedEmail);
        setSearchQuery(selectedEmail);
        setShowDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!email || !amount || Number(amount) <= 0) {
            setMessage({ type: "error", text: "Lütfen geçerli bir e-posta ve miktar girin." });
            return;
        }

        setIsLoading(true);

        const result = await addCreditToUser(email, Number(amount));

        if (result.success) {
            setMessage({ type: "success", text: result.message || "Bakiye başarıyla yüklendi." });
            // Formu temizle
            setEmail("");
            setSearchQuery("");
            setAmount("");
        } else {
            setMessage({ type: "error", text: result.error || "Bakiye yüklenemedi." });
        }

        setIsLoading(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                        <Coins size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Manuel Kredi Yükleme</h3>
                    <p className="text-slate-500 text-sm mt-1">Sistemdeki bir kullanıcıya e-posta adresi üzerinden anında Cüzdan Kredisi yükleyebilirsiniz.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Search size={16} className="text-slate-400" />
                            Kullanıcı Ara (İsim veya E-Posta)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Aramak için yazın..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setEmail(e.target.value); // Sync email with typed query by default
                                }}
                                onClick={() => {
                                    if (searchResults.length > 0) setShowDropdown(true);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-colors"
                            />
                            <div className="absolute left-3 top-3.5 text-slate-400">
                                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <User size={18} />}
                            </div>
                        </div>

                        {/* Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleSelectUser(user.email)}
                                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <div className="font-semibold text-slate-800 text-sm">{user.name || "İsimsiz Kullanıcı"}</div>
                                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500">
                                Kullanıcı bulunamadı.
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Coins size={16} className="text-slate-400" />
                            Yüklenecek Kredi Miktarı (🪙)
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="Örn: 500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-colors font-bold text-lg"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-seal hover:bg-seal-hover text-white font-bold py-3.5 rounded-lg transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                İşleminiz Yapılıyor...
                            </>
                        ) : (
                            <>
                                Krediyi Hesaba Tanımla
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Bu işlem geri döndürülemez ve anında kullanıcının cüzdanına yansır.
                    </p>
                </form>
            </div>
        </div>
    );
}
