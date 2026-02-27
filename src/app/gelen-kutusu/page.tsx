"use client";

import React, { useEffect, useState } from "react";
import { Mail, Calendar, MapPin, Search, ArrowRight, Loader2, Inbox, Bell, BellOff, Plus, User as UserIcon, X, Image as ImageIcon } from "lucide-react";
import { getReceivedLetters, getNotificationPreference, toggleInboxNotifications, searchUsers } from "@/app/actions/messageActions";
import { getIncomingLetters } from "@/app/actions/incomingLetterActions";
import LetterDetailsModal from "@/components/LetterDetailsModal";
import IncomingLetterModal from "@/components/IncomingLetterModal";
import DMWritingModal from "@/components/DMWritingModal";
import { useLetterStore } from "@/store/letterStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import NextImage from "next/image";
import { getPricingSettings } from "@/app/actions/settingsActions";
import { markIncomingLetterAsRead } from "@/app/actions/incomingLetterActions";
import InsufficientCreditModal from "@/components/InsufficientCreditModal";

export default function InboxPage() {
    const [letters, setLetters] = useState<any[]>([]);
    const [incomingLetters, setIncomingLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLetter, setSelectedLetter] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncomingLetter, setSelectedIncomingLetter] = useState<any>(null);
    const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isToggling, setIsToggling] = useState(false);

    // Search Recipient States
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Unlock Letter States
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [unlockingLetter, setUnlockingLetter] = useState<any>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlockPrice, setUnlockPrice] = useState(50);
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [requiredCreditAmount, setRequiredCreditAmount] = useState(0);

    // DM Writing Modal States
    const [isDMModalOpen, setIsDMModalOpen] = useState(false);
    const [writingRecipient, setWritingRecipient] = useState<{ id: string; name: string } | null>(null);

    const router = useRouter();
    const updateAddress = useLetterStore(state => state.updateAddress);
    const resetStore = useLetterStore(state => state.resetStore);

    useEffect(() => {
        fetchAllLetters();
        fetchNotificationPreference();
        fetchUnlockPrice();
    }, []);

    const fetchUnlockPrice = async () => {
        const pricingRes = await getPricingSettings();
        if (pricingRes.success && pricingRes.data) {
            setUnlockPrice(pricingRes.data.incomingLetterOpenPrice || 50);
        }
    };

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
        setWritingRecipient({ id: user.id, name: user.name || "Mektup Arkadaşı" });
        setIsSearchModalOpen(false);
        setIsDMModalOpen(true);
    };

    const handleReplyFromModal = (recipientId: string, recipientName: string) => {
        setIsModalOpen(false);
        setWritingRecipient({ id: recipientId, name: recipientName });
        setIsDMModalOpen(true);
    };

    const fetchAllLetters = async () => {
        setLoading(true);
        const [dmRes, incomingRes] = await Promise.all([
            getReceivedLetters(),
            getIncomingLetters(),
        ]);
        if (dmRes.success && dmRes.letters) {
            setLetters(dmRes.letters);
        }
        if (incomingRes.success && incomingRes.letters) {
            setIncomingLetters(incomingRes.letters);
        }
        setLoading(false);
    };

    const handleOpenModal = (letter: any) => {
        setSelectedLetter(letter);
        setIsModalOpen(true);
    };

    const handleOpenIncomingModal = (letter: any) => {
        if (!letter.isRead) {
            setUnlockingLetter(letter);
            setIsUnlockModalOpen(true);
        } else {
            setSelectedIncomingLetter(letter);
            setIsIncomingModalOpen(true);
        }
    };

    const handleUnlockLetter = async () => {
        if (!unlockingLetter) return;
        setIsUnlocking(true);
        const res = await markIncomingLetterAsRead(unlockingLetter.id);

        if (res.success && res.letter) {
            toast.success("Mektubunuz başarıyla açıldı! İstediğiniz zaman ücretsiz olarak görüntüleyebilirsiniz.");
            // Mektubu güncelleyelim (isRead=true ve images dolacak)
            const updatedIncomingLetters = incomingLetters.map(l =>
                l.id === unlockingLetter.id ? { ...l, isRead: true, images: res.letter.images } : l
            );
            setIncomingLetters(updatedIncomingLetters);
            setIsUnlockModalOpen(false);

            // Hemen arkasına mektubu açalım
            setSelectedIncomingLetter({ ...unlockingLetter, isRead: true, images: res.letter.images });
            setIsIncomingModalOpen(true);
        } else {
            if (res.isCreditError) {
                setRequiredCreditAmount(res.requiredCredit || unlockPrice);
                setIsCreditModalOpen(true);
                setIsUnlockModalOpen(false); // Bunu kapatıp kredi uyarısını açalım
            } else {
                toast.error(res.error || "Mektup açılırken bir hata oluştu.");
            }
        }
        setIsUnlocking(false);
    };

    // Merge and sort all letters by date
    const allItems = [
        ...letters.map(l => ({ ...l, _type: "dm" as const })),
        ...incomingLetters.map(l => ({ ...l, _type: "incoming" as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                ) : allItems.length === 0 ? (
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
                            {allItems.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    {item._type === "incoming" ? (
                                        /* Incoming Physical Letter Card */
                                        <div
                                            onClick={() => handleOpenIncomingModal(item)}
                                            className="h-full bg-white rounded-3xl p-6 border border-seal/20 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col group-hover:-translate-y-2 relative overflow-hidden"
                                        >
                                            {/* Subtle seal accent */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>

                                            {!item.isRead && (
                                                <div className="absolute top-4 right-4 w-3 h-3 bg-seal rounded-full animate-pulse shadow-lg shadow-seal/50"></div>
                                            )}

                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                    <NextImage src="/images/kus-logo.png" alt="Mektuplaş" width={40} height={40} />
                                                </div>
                                                <div className="bg-seal/10 px-3 py-1 rounded-lg">
                                                    <span className="text-[10px] font-black text-seal font-mono">
                                                        📬 FİZİKSEL
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <p className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-1">Gönderici</p>
                                                    <h4 className="text-xl font-playfair font-bold text-seal">
                                                        Mektuplaş
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 text-ink-light">
                                                        <Calendar size={14} className="shrink-0" />
                                                        <span className="text-xs font-bold">
                                                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-ink-light">
                                                        <ImageIcon size={14} className="shrink-0" />
                                                        <span className="text-xs font-bold">
                                                            {item.images?.length || 0} sayfa
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-seal/20 flex items-center justify-between text-seal overflow-hidden">
                                                <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300">Mektubu Oku</span>
                                                <ArrowRight size={18} className="translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                            </div>
                                        </div>
                                    ) : (
                                        /* DM Letter Card (existing) */
                                        <div
                                            onClick={() => handleOpenModal(item)}
                                            className="h-full bg-white rounded-3xl p-6 border border-paper-dark shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col group-hover:-translate-y-2"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 bg-seal/5 rounded-2xl flex items-center justify-center text-seal group-hover:bg-seal group-hover:text-white transition-colors duration-500">
                                                    <Mail size={24} />
                                                </div>
                                                <div className="bg-paper-dark/50 px-3 py-1 rounded-lg">
                                                    <span className="text-[10px] font-black text-wood font-mono">
                                                        #{item.id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <p className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-1">Gönderici</p>
                                                    <h4 className="text-xl font-playfair font-bold text-ink truncate">
                                                        {item.senderName || item.data?.address?.senderName || "Anonim"}
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 text-ink-light">
                                                        <Calendar size={14} className="shrink-0" />
                                                        <span className="text-xs font-bold">
                                                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-ink-light">
                                                        <MapPin size={14} className="shrink-0" />
                                                        <span className="text-xs font-bold truncate">
                                                            {item.receiverCity || item.data?.address?.receiverCity || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-paper-dark flex items-center justify-between text-seal overflow-hidden">
                                                <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300">Detayları Gör</span>
                                                <ArrowRight size={18} className="translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isModalOpen && selectedLetter && (
                    <LetterDetailsModal
                        letter={selectedLetter}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onReply={handleReplyFromModal}
                    />
                )}

                {isIncomingModalOpen && selectedIncomingLetter && (
                    <IncomingLetterModal
                        letter={selectedIncomingLetter}
                        isOpen={isIncomingModalOpen}
                        onClose={() => setIsIncomingModalOpen(false)}
                    />
                )}

                {isUnlockModalOpen && unlockingLetter && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
                        onClick={() => !isUnlocking && setIsUnlockModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-paper rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-paper-dark"
                        >
                            <div className="p-6 border-b border-paper-dark flex justify-between items-center bg-paper-light">
                                <h3 className="font-playfair text-xl font-bold text-wood-dark flex items-center gap-2">
                                    <Inbox size={22} className="text-seal" />
                                    Mektubu Aç
                                </h3>
                                <button disabled={isUnlocking} onClick={() => setIsUnlockModalOpen(false)} className="text-ink-light hover:text-ink transition-colors p-1 bg-paper border border-paper-dark rounded-full shadow-sm hover:shadow-md disabled:opacity-50">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5 text-center">
                                <div className="w-16 h-16 bg-seal/10 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                                    <Mail size={32} className="text-seal" />
                                    <span className="absolute -top-1 -right-1 bg-white text-seal text-xs font-bold px-1.5 py-0.5 rounded shadow-sm border border-seal/20">+{unlockingLetter.imageCount || 1}</span>
                                </div>
                                <p className="text-sm text-ink-light leading-relaxed">
                                    Adınıza gelen fiziksel mektubu dijital olarak okumak ve kalıcı olarak kilit açmak üzeresiniz.
                                </p>

                                <div className="bg-paper-light border border-paper-dark/50 py-4 px-6 rounded-xl flex items-center justify-between mx-4 shadow-inner">
                                    <span className="text-sm font-semibold text-ink">Açılış Ücreti:</span>
                                    <span className="text-lg font-black text-wood tracking-wide flex items-center gap-1">
                                        {unlockPrice} 🪙
                                    </span>
                                </div>

                                <p className="text-xs text-seal font-medium bg-seal/5 p-3 rounded-lg border border-seal/10">
                                    Kredi harcandıktan sonra bu mektuba <strong>ne zaman isterseniz ücretsiz ve sınırsız</strong> erişebilirsiniz.
                                </p>
                            </div>

                            <div className="p-4 border-t border-paper-dark bg-paper-light flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsUnlockModalOpen(false)}
                                    disabled={isUnlocking}
                                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-ink-light hover:text-ink hover:bg-paper-dark transition-colors disabled:opacity-50"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleUnlockLetter}
                                    disabled={isUnlocking}
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-seal hover:bg-seal-hover text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-md flex items-center gap-2"
                                >
                                    {isUnlocking ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            İşleniyor...
                                        </>
                                    ) : (
                                        "Kredi ile Aç"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {isCreditModalOpen && (
                    <InsufficientCreditModal
                        isOpen={true}
                        onClose={() => setIsCreditModalOpen(false)}
                        requiredCredit={requiredCreditAmount}
                        currentBalance={0}
                        actionName="Gelen mektubu açmak"
                    />
                )}
            </AnimatePresence>

            {/* DM Writing Modal */}
            <DMWritingModal
                isOpen={isDMModalOpen}
                onClose={() => setIsDMModalOpen(false)}
                recipientId={writingRecipient?.id || ""}
                recipientName={writingRecipient?.name || ""}
                onSuccess={fetchAllLetters}
            />

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
            `}
            </style>
        </main>
    );
}
