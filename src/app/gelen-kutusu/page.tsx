"use client";

import React, { useEffect, useState } from "react";
import { Mail, Calendar, MapPin, Search, Filter, ArrowRight, Loader2, Inbox, Bell, BellOff, Plus, User as UserIcon, X } from "lucide-react";
import { getReceivedLetters, getNotificationPreference, toggleInboxNotifications, searchUsers } from "@/app/actions/messageActions";
import LetterDetailsModal from "@/components/LetterDetailsModal";
import { useLetterStore } from "@/store/letterStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function InboxPage() {
    const [letters, setLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLetter, setSelectedLetter] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isToggling, setIsToggling] = useState(false);

    // Search Recipient States
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const router = useRouter();
    const updateAddress = useLetterStore(state => state.updateAddress);
    const resetStore = useLetterStore(state => state.resetStore);

    useEffect(() => {
        fetchLetters();
        fetchNotificationPreference();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchNotificationPreference = async () => {
        const res = await getNotificationPreference();
        if (res.success) {
            setNotificationsEnabled(res.enabled ?? true);
        }
    };

    const handleToggleNotifications = async () => {
        setIsToggling(true);
        const newValue = !notificationsEnabled;
        const res = await toggleInboxNotifications(newValue);
        if (res.success) {
            setNotificationsEnabled(newValue);
            toast.success(newValue ? "Bildirimler açıldı." : "Bildirimler kapatıldı.");
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setIsToggling(false);
    };

    const handleSearch = async () => {
        setIsSearching(true);
        const res = await searchUsers(searchQuery);
        if (res.success) {
            setSearchResults(res.users || []);
        }
        setIsSearching(false);
    };

    const handleSelectRecipient = (user: any) => {
        resetStore();
        updateAddress({
            receiverName: user.name || "Mektup Arkadaşı",
            receiverId: user.id,
            isPrison: false
        });
        setIsSearchModalOpen(false);
        router.push("/mektup-yaz/akisi");
    };

    const fetchLetters = async () => {
        setLoading(true);
        const res = await getReceivedLetters();
        if (res.success && res.letters) {
            setLetters(res.letters);
        }
        setLoading(false);
    };

    const handleOpenModal = (letter: any) => {
        setSelectedLetter(letter);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen pt-24 pb-20 px-6">
            <div className="container mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-seal">
                            <Inbox size={24} />
                            <span className="font-black uppercase tracking-[0.3em] text-xs">Gelen Kutusu</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-ink">Gelen Mektuplarım</h1>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-paper-dark shadow-sm">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-ink uppercase tracking-widest">E-Posta Bildirimleri</p>
                                <p className="text-[9px] text-ink-light font-bold leading-tight">
                                    {notificationsEnabled
                                        ? "Mektup gelince mail alırsınız"
                                        : "Bildirimler kapalı"}
                                </p>
                            </div>
                            <button
                                onClick={handleToggleNotifications}
                                disabled={isToggling}
                                className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${notificationsEnabled ? "bg-seal" : "bg-paper-dark"
                                    }`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-500 flex items-center justify-center ${notificationsEnabled ? "left-7" : "left-1"
                                    }`}>
                                    {notificationsEnabled ? (
                                        <Bell size={12} className="text-seal" />
                                    ) : (
                                        <BellOff size={12} className="text-ink-light" />
                                    )}
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="bg-ink text-white px-8 py-4 rounded-[2rem] font-black transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 group"
                        >
                            <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                                <Plus size={20} />
                            </div>
                            <span>Yeni Mektup Yaz</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={40} className="text-seal animate-spin" />
                        <p className="text-ink-light font-bold font-kurale">Mektuplarınız getiriliyor...</p>
                    </div>
                ) : letters.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border-2 border-dashed border-paper-dark p-20 text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-paper-dark/30 rounded-full flex items-center justify-center mx-auto text-wood-dark">
                            <Mail size={40} />
                        </div>
                        <h3 className="text-2xl font-playfair font-bold text-ink">Henüz Gelen Mektubunuz Yok</h3>
                        <p className="text-ink-light max-w-md mx-auto font-medium">
                            Size gönderilen mektuplar burada görünecektir. Adresinizi paylaşarak sevdiklerinizden mektup alabilirsiniz.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {letters.map((letter, idx) => (
                                <motion.div
                                    key={letter.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <div
                                        onClick={() => handleOpenModal(letter)}
                                        className="h-full bg-white rounded-3xl p-6 border border-paper-dark shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col group-hover:-translate-y-2"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 bg-seal/5 rounded-2xl flex items-center justify-center text-seal group-hover:bg-seal group-hover:text-white transition-colors duration-500">
                                                <Mail size={24} />
                                            </div>
                                            <div className="bg-paper-dark/50 px-3 py-1 rounded-lg">
                                                <span className="text-[10px] font-black text-wood font-mono">
                                                    #{letter.id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <p className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-1">Gönderici</p>
                                                <h4 className="text-xl font-playfair font-bold text-ink truncate">
                                                    {letter.senderName || letter.data?.address?.senderName || "Anonim"}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-ink-light">
                                                    <Calendar size={14} className="shrink-0" />
                                                    <span className="text-xs font-bold">
                                                        {new Date(letter.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-ink-light">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <span className="text-xs font-bold truncate">
                                                        {letter.receiverCity || letter.data?.address?.receiverCity || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-paper-dark flex items-center justify-between text-seal overflow-hidden">
                                            <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300">Detayları Gör</span>
                                            <ArrowRight size={18} className="translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {selectedLetter && (
                <LetterDetailsModal
                    letter={selectedLetter}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Recipient Search Modal */}
            <AnimatePresence>
                {isSearchModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-wood-dark/60 backdrop-blur-md"
                            onClick={() => setIsSearchModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-paper-light rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-playfair font-bold text-ink">Mektup Arkadaşı Bul</h2>
                                <button
                                    onClick={() => setIsSearchModalOpen(false)}
                                    className="p-2 hover:bg-paper-dark/30 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-ink-light" />
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <Search size={20} className="text-ink-light" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="İsim veya e-posta adresi yazın..."
                                    className="w-full bg-white/80 border-2 border-paper-dark rounded-2xl py-4 pl-14 pr-6 text-lg font-medium focus:border-seal focus:ring-4 focus:ring-seal/10 transition-all outline-none text-ink"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {isSearching ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 size={32} className="text-seal animate-spin" />
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleSelectRecipient(user)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-paper-dark bg-white hover:border-seal hover:bg-seal/5 transition-all text-left group"
                                        >
                                            <div className="w-12 h-12 bg-paper-dark/50 rounded-xl flex items-center justify-center text-wood-dark group-hover:bg-seal group-hover:text-white transition-colors">
                                                <UserIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink leading-tight">{user.name}</p>
                                                <p className="text-xs text-ink-light font-medium">{user.email}</p>
                                            </div>
                                            <ArrowRight size={18} className="ml-auto text-ink-light opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))
                                ) : searchQuery.length >= 3 ? (
                                    <div className="text-center py-10 text-ink-light italic">
                                        Kullanıcı bulunamadı.
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-ink-light font-medium">
                                        Aramak için en az 3 karakter girin.
                                    </div>
                                )}
                            </div>

                            <p className="mt-8 text-[11px] text-ink-light text-center leading-relaxed font-medium">
                                Mektup arkadaşınızın sistemimizde kayıtlı olması gerekmektedir. <br />
                                Bulduktan sonra hemen yazmaya başlayabilirsiniz.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .font-kurale { font-family: 'Kurale', serif; }
                .font-playfair { font-family: 'Playfair Display', serif; }
            `}</style>
        </main>
    );
}
