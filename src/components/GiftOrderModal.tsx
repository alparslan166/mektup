"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift as GiftIcon, MapPin, Phone, User, Loader2, CheckCircle2, Wallet, BookOpen, Home, Briefcase, Map, Building2 } from "lucide-react";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import { createGiftOrder } from "@/app/actions/giftOrderActions";
import InsufficientCreditModal from "@/components/InsufficientCreditModal";
import citiesData from "../../sehirler.json";

interface Address {
    id: string;
    title: string;
    name: string;
    city: string;
    addressText: string;
    phone: string | null;
    isPrison: boolean;
    prisonName: string | null;
    fatherName: string | null;
    wardNumber: string | null;
    prisonNote: string | null;
}

export default function GiftOrderModal({
    isOpen,
    onClose,
    gift
}: {
    isOpen: boolean;
    onClose: () => void;
    gift: any | null;
}) {
    const [step, setStep] = useState<"FORM" | "PROCESSING" | "SUCCESS" | "INSUFFICIENT">("FORM");
    const [error, setError] = useState<string | null>(null);

    const creditBalance = useUIStore(state => state.creditBalance);

    // --- Sender states
    const [senderName, setSenderName] = useState("");
    const [senderCity, setSenderCity] = useState("");
    const [senderAddress, setSenderAddress] = useState("");

    // --- Receiver states
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [receiverCity, setReceiverCity] = useState("");
    const [receiverAddress, setReceiverAddress] = useState("");
    const [notes, setNotes] = useState("");

    // --- Prison states
    const [isPrison, setIsPrison] = useState(false);
    const [prisonName, setPrisonName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [wardNumber, setWardNumber] = useState("");
    const [prisonNote, setPrisonNote] = useState("");

    const [availableCities] = useState<string[]>(Object.values(citiesData).sort((a, b) => (a as string).localeCompare(b as string)) as string[]);
    const [selectedPrisonCity, setSelectedPrisonCity] = useState("");
    const [filteredPrisons, setFilteredPrisons] = useState<any[]>([]);
    const [isLoadingPrisons, setIsLoadingPrisons] = useState(false);

    // --- Address Book states
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressModalType, setAddressModalType] = useState<"sender" | "receiver" | null>(null);
    const [saveSenderToAddressBook, setSaveSenderToAddressBook] = useState(false);
    const [saveReceiverToAddressBook, setSaveReceiverToAddressBook] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    useEffect(() => {
        if (isPrison && selectedPrisonCity) {
            const fetchPrisons = async () => {
                setIsLoadingPrisons(true);
                try {
                    const res = await fetch(`/api/prisons?city=${encodeURIComponent(selectedPrisonCity)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setFilteredPrisons(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch filtered prisons:", error);
                } finally {
                    setIsLoadingPrisons(false);
                }
            };
            fetchPrisons();
        } else {
            setFilteredPrisons([]);
        }
    }, [selectedPrisonCity, isPrison]);

    useEffect(() => {
        if (isOpen) {
            const fetchAddresses = async () => {
                setIsLoadingAddresses(true);
                try {
                    const res = await fetch("/api/addresses");
                    if (res.ok) {
                        const data = await res.json();
                        setAddresses(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch addresses:", error);
                } finally {
                    setIsLoadingAddresses(false);
                }
            };
            fetchAddresses();
        }
    }, [isOpen]);

    if (!gift) return null;

    const handleSelectAddress = (addr: Address) => {
        if (addressModalType === "sender") {
            setSenderName(addr.name);
            setSenderCity(addr.city);
            setSenderAddress(addr.addressText);
        } else if (addressModalType === "receiver") {
            const isPrisonAddr = !!addr.isPrison || !!addr.title.toLowerCase().includes("cezaevi");
            setReceiverName(addr.name);
            setReceiverPhone(addr.phone || "");
            setReceiverCity(addr.city);
            setReceiverAddress(addr.addressText);
            setIsPrison(isPrisonAddr);
            setPrisonName(addr.prisonName || "");
            setFatherName(addr.fatherName || "");
            setWardNumber(addr.wardNumber || "");
            setPrisonNote(addr.prisonNote || "");

            if (isPrisonAddr) setSelectedPrisonCity(addr.city);
        }
        setIsAddressModalOpen(false);
    };

    const handleSaveNewAddress = async (type: "sender" | "receiver") => {
        setIsSavingAddress(true);
        try {
            const data = type === "sender" ? {
                title: "Gönderen Adresim",
                name: senderName,
                city: senderCity,
                addressText: senderAddress,
            } : {
                title: isPrison ? `${prisonName} (Cezaevi)` : "Alıcı Adresim",
                name: receiverName,
                city: isPrison ? selectedPrisonCity : receiverCity,
                addressText: receiverAddress,
                phone: receiverPhone,
                isPrison: isPrison,
                prisonName: prisonName,
                fatherName: fatherName,
                wardNumber: wardNumber,
                prisonNote: prisonNote
            };

            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const newAddr = await res.json();
                setAddresses(prev => [newAddr, ...prev]);
                if (type === "sender") setSaveSenderToAddressBook(false);
                else setSaveReceiverToAddressBook(false);
            }
        } catch (error) {
            console.error("Failed to save address:", error);
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const price = gift.price || 0;

        if (creditBalance < price) {
            setStep("INSUFFICIENT");
            return;
        }

        if (saveSenderToAddressBook && senderName && senderAddress) {
            await handleSaveNewAddress("sender");
        }

        if (saveReceiverToAddressBook && receiverName && receiverAddress) {
            await handleSaveNewAddress("receiver");
        }

        setStep("PROCESSING");

        const result = await createGiftOrder({
            giftId: gift.id,

            // Receiver details
            receiverName,
            addressText: receiverAddress,
            city: isPrison ? selectedPrisonCity : receiverCity,
            phone: receiverPhone,
            notes,

            // Sender details
            senderName,
            senderCity,
            senderAddress,

            // Prison details
            isPrison,
            prisonName,
            fatherName,
            wardNumber,
            prisonNote
        });

        if (result.success) {
            setStep("SUCCESS");
            useUIStore.getState().setCreditBalance(creditBalance - price);
        } else if (result.isCreditError) {
            setStep("INSUFFICIENT");
        } else {
            setError(result.error || "Sipariş alınamadı.");
            setStep("FORM");
        }
    };

    const resetModal = () => {
        setStep("FORM");
        setError(null);

        setSenderName("");
        setSenderCity("");
        setSenderAddress("");

        setReceiverName("");
        setReceiverCity("");
        setReceiverPhone("");
        setReceiverAddress("");
        setNotes("");

        setIsPrison(false);
        setPrisonName("");
        setFatherName("");
        setWardNumber("");
        setPrisonNote("");
        setSelectedPrisonCity("");

        onClose();
    };

    const openAddressModal = (type: "sender" | "receiver") => {
        setAddressModalType(type);
        setIsAddressModalOpen(true);
    };

    const getIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('ev')) return <Home size={18} />;
        if (lowerTitle.includes('iş') || lowerTitle.includes('is') || lowerTitle.includes('ofis')) return <Briefcase size={18} />;
        return <Map size={18} />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && step !== "PROCESSING") onClose();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-paper rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-paper-dark relative max-h-[90vh] flex flex-col"
                    >
                        {step !== "PROCESSING" && (
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 bg-paper-dark/30 hover:bg-paper-dark rounded-full text-ink-light hover:text-ink transition-colors z-10"
                            >
                                <X size={20} />
                            </button>
                        )}

                        {step === "FORM" && (
                            <form onSubmit={handleOrder} className="flex flex-col h-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 gap-8 custom-scrollbar">
                                <div className="text-center space-y-2 mt-2">
                                    <div className="mx-auto w-16 h-16 bg-seal/10 rounded-full flex items-center justify-center text-seal mb-4">
                                        <GiftIcon size={32} />
                                    </div>
                                    <h2 className="text-2xl font-playfair font-bold text-ink">Hediye Siparişi</h2>
                                    <p className="text-ink-light text-sm">Hediyenizi güvenle satın alın ve adres bilgilerini tamamlayın.</p>
                                </div>

                                {/* Gift Summary */}
                                <div className="bg-paper-dark/20 p-4 rounded-xl flex items-center gap-4">
                                    {gift.image && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
                                            <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-ink">{gift.name}</h3>
                                        <p className="text-sm font-playfair font-black text-seal">{gift.price || 0} 🪙</p>
                                    </div>
                                    <div className="text-xs bg-wood/10 text-wood px-2 py-1 rounded font-bold">
                                        Cüzdan Bakiyeniz: {creditBalance} 🪙
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Sender Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-paper-dark pb-2">
                                            <h3 className="font-playfair text-lg font-bold text-wood">Gönderen Bilgileri</h3>
                                            <button type="button" onClick={() => openAddressModal("sender")} className="text-xs font-semibold text-wood bg-wood/10 px-2 py-1 rounded">
                                                Adres Defteri
                                            </button>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-ink-light block">Ad Soyad *</label>
                                            <input required value={senderName} onChange={e => setSenderName(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-ink-light block">Şehir / İlçe *</label>
                                            <input required value={senderCity} onChange={e => setSenderCity(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-ink-light block">Açık Adres *</label>
                                            <textarea required value={senderAddress} onChange={e => setSenderAddress(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1 min-h-[60px]" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="saveSender" checked={saveSenderToAddressBook} onChange={e => setSaveSenderToAddressBook(e.target.checked)} className="rounded" />
                                            <label htmlFor="saveSender" className="text-xs text-ink-light cursor-pointer">Adresi rehberime kaydet</label>
                                        </div>
                                    </div>

                                    {/* Receiver Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-paper-dark pb-2">
                                            <h3 className="font-playfair text-lg font-bold text-seal">Alıcı Bilgileri</h3>
                                            <button type="button" onClick={() => openAddressModal("receiver")} className="text-xs font-semibold text-seal bg-seal/10 px-2 py-1 rounded">
                                                Adres Defteri
                                            </button>
                                        </div>

                                        {/* Prison Toggle */}
                                        <div className="flex items-center gap-3 bg-red-50/50 p-2 border border-red-100 rounded-md">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={isPrison} onChange={(e) => setIsPrison(e.target.checked)} />
                                                <div className="w-9 h-5 bg-paper-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                                                <span className="ml-2 text-xs font-bold text-red-600">Cezaevine Gönder</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-ink-light block">Alıcı Ad Soyad *</label>
                                            <input required value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                        </div>

                                        {!isPrison ? (
                                            <>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Telefon *</label>
                                                    <input required value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Şehir / İlçe *</label>
                                                    <input required value={receiverCity} onChange={e => setReceiverCity(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Açık Adres *</label>
                                                    <textarea required value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1 min-h-[60px]" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Şehir Seçin *</label>
                                                    <select required value={selectedPrisonCity} onChange={e => setSelectedPrisonCity(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1">
                                                        <option value="">İl Seçiniz</option>
                                                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Cezaevi *</label>
                                                    <select
                                                        required
                                                        value={prisonName}
                                                        onChange={e => {
                                                            setPrisonName(e.target.value);
                                                            const p = filteredPrisons.find(fp => fp.name === e.target.value);
                                                            if (p) {
                                                                setReceiverAddress(p.address || "");
                                                            }
                                                        }}
                                                        disabled={!selectedPrisonCity || isLoadingPrisons}
                                                        className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1 disabled:opacity-50"
                                                    >
                                                        <option value="">Cezaevi Seçiniz</option>
                                                        {filteredPrisons.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs font-bold text-ink-light block">Baba Adı *</label>
                                                        <input required value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-ink-light block">Koğuş No *</label>
                                                        <input required value={wardNumber} onChange={e => setWardNumber(e.target.value)} className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-ink-light block">Cezaevi Mektup Notu (Opsiyonel)</label>
                                                    <input value={prisonNote} onChange={e => setPrisonNote(e.target.value)} placeholder="Anne adıyla gönderilecek, vb." className="w-full bg-white border border-paper-dark rounded-md px-3 py-2 text-sm mt-1" />
                                                </div>
                                            </>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="saveReceiver" checked={saveReceiverToAddressBook} onChange={e => setSaveReceiverToAddressBook(e.target.checked)} className="rounded" />
                                            <label htmlFor="saveReceiver" className="text-xs text-ink-light cursor-pointer">Adresi rehberime kaydet</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-paper-dark pt-4 mb-2">
                                    <label className="text-sm font-bold text-ink-light mb-1.5 block">Sipariş Notu (Opsiyonel)</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full bg-white border border-paper-dark rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-seal transition-colors min-h-[60px]"
                                        placeholder="Varsa iletmek istediğiniz özel not..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-seal to-wood hover:from-seal-hover hover:to-wood-dark text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    Siparişi Onayla & {gift.price} 🪙 Öde
                                </button>
                            </form>
                        )}

                        {step === "PROCESSING" && (
                            <div className="p-12 flex flex-col items-center text-center space-y-4">
                                <Loader2 size={48} className="animate-spin text-seal mx-auto" />
                                <h3 className="text-xl font-bold text-ink font-playfair">İşlem Gerçekleştiriliyor</h3>
                                <p className="text-ink-light text-sm">
                                    Bakiyenizden {gift.price} 🪙 düşülüyor ve siparişiniz alınıyor, lütfen bekleyin...
                                </p>
                            </div>
                        )}

                        {step === "SUCCESS" && (
                            <div className="p-10 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-ink font-playfair">Sipariş Başarılı!</h3>
                                <p className="text-ink-light text-sm max-w-[280px]">
                                    Hediyeniz başarıyla satın alındı. Bakiyenizden krediniz düşüldü. Kısa sürede hazırlanıp yola çıkacaktır.
                                </p>
                                <button
                                    onClick={resetModal}
                                    className="w-full bg-paper-dark/30 hover:bg-paper-dark text-ink font-bold py-3 px-6 rounded-xl transition-colors mt-4"
                                >
                                    Alışverişe Devam Et
                                </button>
                            </div>
                        )}

                        {step === "INSUFFICIENT" && (
                            <InsufficientCreditModal
                                isOpen={true}
                                onClose={() => setStep("FORM")}
                                requiredCredit={gift.price || 0}
                                currentBalance={creditBalance}
                            />
                        )}

                        {/* ADDRESS BOOK MODAL INJECTION */}
                        <AnimatePresence>
                            {isAddressModalOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[110] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) setIsAddressModalOpen(false);
                                    }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="bg-paper rounded-2xl p-6 shadow-2xl relative w-full max-w-lg border border-paper-dark max-h-[80vh] flex flex-col"
                                    >
                                        <button
                                            onClick={() => setIsAddressModalOpen(false)}
                                            className="absolute right-4 top-4 p-2 bg-paper-dark/50 hover:bg-paper-dark rounded-full transition-colors text-ink-light hover:text-ink z-10"
                                        >
                                            <X size={18} />
                                        </button>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="bg-wood/10 p-2.5 rounded-lg text-wood">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-playfair font-bold text-ink">Adres Defterim</h3>
                                                <p className="text-sm text-ink-light">Kayıtlı adreslerinizden hızlıca seçim yapın</p>
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                                            {isLoadingAddresses ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-seal">
                                                    <Loader2 size={32} className="animate-spin" />
                                                    <span className="text-sm font-medium">Adresleriniz yükleniyor...</span>
                                                </div>
                                            ) : addresses.length > 0 ? (
                                                <div className="space-y-3">
                                                    {addresses.map((addr) => (
                                                        <div
                                                            key={addr.id}
                                                            onClick={() => handleSelectAddress(addr)}
                                                            className="group bg-paper-light border border-paper-dark hover:border-seal hover:shadow-md rounded-xl p-4 cursor-pointer transition-all flex gap-4 items-start"
                                                        >
                                                            <div className="bg-paper-dark/30 group-hover:bg-seal/10 text-ink-light group-hover:text-seal p-2.5 rounded-lg transition-colors mt-0.5 shrink-0">
                                                                {getIcon(addr.title)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-ink flex items-center gap-2">
                                                                    {addr.title}
                                                                    {addr.isPrison && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Cezaevi</span>}
                                                                </h4>
                                                                <p className="text-sm font-semibold text-seal mt-1 truncate">{addr.name}</p>
                                                                <p className="text-xs text-ink-light mt-1.5 line-clamp-2 leading-relaxed">
                                                                    {addr.addressText}
                                                                </p>
                                                                {addr.phone && (
                                                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-ink-light/80">
                                                                        <Phone size={12} /> {addr.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-seal opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Seç
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Building2 size={40} className="mx-auto text-ink-light/30 mb-3" />
                                                    <p className="text-ink-light text-sm font-medium">Henüz kayıtlı bir adresiniz bulunmuyor.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
