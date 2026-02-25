"use client";

import React, { useState, useEffect } from "react";
import Stepper from "@/components/Stepper";
import { useLetterStore } from "@/store/letterStore";
import { ArrowLeft, ArrowRight, User, Phone, BookOpen, X, Home, Briefcase, Map, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import citiesData from "../../sehirler.json";
import { useShallow } from 'zustand/react/shallow';

interface Address {
    id: string;
    title: string;
    name: string;
    city: string;
    addressText: string;
    phone: string | null;
}




export default function InfoStep() {
    const { address, updateAddress } = useLetterStore(useShallow(state => ({
        address: state.address,
        updateAddress: state.updateAddress
    })));

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"sender" | "receiver" | null>(null);

    // Prison selection states
    const [availableCities, setAvailableCities] = useState<string[]>(Object.values(citiesData).sort((a, b) => a.localeCompare(b, 'tr-TR')) as string[]);
    const [selectedCity, setSelectedCity] = useState(address.receiverCity || "");
    const [filteredPrisons, setFilteredPrisons] = useState<any[]>([]);
    const [isLoadingPrisons, setIsLoadingPrisons] = useState(false);

    // Prison data fetching
    useEffect(() => {
        if (address.isPrison && selectedCity) {
            const fetchPrisons = async () => {
                setIsLoadingPrisons(true);
                try {
                    const res = await fetch(`/api/prisons?city=${encodeURIComponent(selectedCity)}`);
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
    }, [selectedCity, address.isPrison]);

    useEffect(() => {
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
    }, []);

    const handleSelectAddress = (addr: Address) => {
        if (modalType === "sender") {
            updateAddress({
                senderName: addr.name,
                senderCity: addr.city,
                senderAddress: addr.addressText,
            });
        } else if (modalType === "receiver") {
            const isPrisonAddr = !!addr.title.toLowerCase().includes("cezaevi");
            updateAddress({
                receiverName: addr.name,
                receiverCity: addr.city,
                receiverAddress: addr.addressText,
                receiverPhone: addr.phone || "",
                isPrison: isPrisonAddr
            });
            if (isPrisonAddr) setSelectedCity(addr.city);
        }
        setIsModalOpen(false);
    };

    const handlePrisonSelect = (prisonName: string) => {
        const prison = filteredPrisons.find(p => p.name === prisonName);
        if (prison) {
            updateAddress({
                prisonName: prison.name,
                receiverAddress: prison.address || "", // Fallback if address empty
                receiverCity: selectedCity
            });
        }
    };

    const openModal = (type: "sender" | "receiver") => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const getIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('ev')) return <Home size={18} />;
        if (lowerTitle.includes('iş') || lowerTitle.includes('is') || lowerTitle.includes('ofis')) return <Briefcase size={18} />;
        return <Map size={18} />;
    };

    return (
        <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
            {/* Soft Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

            <div className="text-center space-y-2 mb-10 mt-2 animate-in fade-in duration-700">
                <h3 className="font-playfair text-2xl font-bold text-wood-dark">Gönderici ve Alıcı Bilgileri</h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    Mektubunuzun kime gideceğini ve kimden gittiğini belirteceğiniz alan. Lütfen bilgileri eksiksiz doldurunuz.
                </p>
            </div>

            {/* Form Container */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-8 lg:gap-16">

                {/* SENDER INFO (Left) */}
                <div className="flex-1 space-y-6">
                    <div className="text-center mb-6 flex flex-col items-center justify-center gap-3">
                        <h3 className="font-playfair text-xl font-bold text-wood flex items-center justify-center gap-2">
                            <span className="text-lg">»</span> Gönderen Bilgileri <span className="text-lg">«</span>
                        </h3>
                        <button
                            onClick={() => openModal("sender")}
                            className="flex items-center gap-1.5 text-xs font-semibold text-wood bg-wood/10 hover:bg-wood/20 px-4 py-1.5 rounded-full transition-colors shadow-sm"
                        >
                            <BookOpen size={14} />
                            <span>Kayıtlı Adreslerim</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Sender Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Ad Soyad</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Gönderen Ad Soyad"
                                    value={address.senderName}
                                    onChange={(e) => updateAddress({ senderName: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all shadow-sm"
                                />
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/50" />
                            </div>
                            <p className="text-[10px] text-ink-light/60 mt-1 ml-1 font-medium">Lütfen tam adınızı ve soyadınızı giriniz.</p>
                        </div>

                        {/* Sender City */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Şehir / İlçe</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Örn: Kadıköy, İstanbul"
                                    value={address.senderCity}
                                    onChange={(e) => updateAddress({ senderCity: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Sender Address */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-seal ml-1">Kendi Adresiniz :</label>
                            <textarea
                                rows={4}
                                placeholder="Örnek: Güneş Mah. Yıldız Sok. No:9 Kat:1 Daire:1"
                                className="w-full bg-white text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood transition-all shadow-sm resize-none"
                                value={address.senderAddress}
                                onChange={(e) => updateAddress({ senderAddress: e.target.value })}
                            ></textarea>
                            <p className="text-[10px] text-ink-light/60 mt-1 ml-1 text-right">↑ Lütfen bu alana kendi adresinizi doğru şekilde giriniz.</p>
                        </div>
                    </div>
                </div>


                {/* RECEIVER INFO (Right) */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col items-center justify-center gap-3 mb-6">
                        <h3 className="font-playfair text-xl font-bold text-seal flex items-center justify-center gap-2">
                            <span className="text-lg text-wood">»</span> Alıcı Bilgileri <span className="text-lg text-wood">«</span>
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                            {!useLetterStore.getState().address.isPrison && (
                                <button
                                    onClick={() => openModal("receiver")}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-seal bg-seal/5 hover:bg-seal/10 border border-seal/20 px-4 py-1.5 rounded-full transition-colors shadow-sm"
                                >
                                    <BookOpen size={14} />
                                    <span>Adres Defteri</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Name Field ALWAYS Shown */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Alıcı Adı Soyadı</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Örnek: Ömer Faruk Kaya"
                                    value={address.receiverName}
                                    onChange={(e) => updateAddress({ receiverName: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                                />
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-seal/50" />
                            </div>
                            <p className="text-[10px] text-seal/80 mt-1 ml-1 font-medium italic">Eksik isim veya hatalı harf olması durumunda teslimat yapılamaz.</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {!address.isPrison ? (
                                <motion.div
                                    key="standard"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    {/* Receiver Phone */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Telefon Numarası</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                placeholder="0(5XX) XXX XX XX"
                                                value={address.receiverPhone}
                                                onChange={(e) => updateAddress({ receiverPhone: e.target.value })}
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all tracking-wider shadow-sm"
                                            />
                                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-seal/50" />
                                        </div>
                                        <p className="text-[10px] text-seal/60 mt-1 ml-1">Mektup teslimatı ve kargo takibi için gereklidir.</p>
                                    </div>

                                    {/* Receiver City */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Şehir / İlçe</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Örn: Çankaya, Ankara"
                                                value={address.receiverCity}
                                                onChange={(e) => updateAddress({ receiverCity: e.target.value })}
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Receiver Address */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Açık Adres</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Mahalle, sokak, apartman ve kapı numarası..."
                                            value={address.receiverAddress}
                                            onChange={(e) => updateAddress({ receiverAddress: e.target.value })}
                                            className="w-full bg-white text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all resize-none shadow-sm"
                                        ></textarea>
                                        <p className="text-[10px] text-seal/80 font-medium ml-1 text-right">
                                            ↑ Anlaşılmayan bir adres girilirse mektup teslim edilemeyecektir.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="prison"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    {/* City Select */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Şehir Seçin</label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => {
                                                setSelectedCity(e.target.value);
                                                updateAddress({ prisonName: "", receiverAddress: "", receiverCity: e.target.value });
                                            }}
                                            className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all cursor-pointer shadow-sm"
                                        >
                                            <option value="">{isLoadingPrisons ? "Yükleniyor..." : "Şehir Seçiniz..."}</option>
                                            {availableCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Prison Select */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block">Cezaevi Seçin</label>
                                        <select
                                            disabled={!selectedCity || isLoadingPrisons}
                                            value={address.prisonName}
                                            onChange={(e) => handlePrisonSelect(e.target.value)}
                                            className="w-full disabled:bg-paper-dark/20 bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
                                        >
                                            <option value="">{selectedCity ? "Cezaevi Seçiniz..." : "Önce Şehir Seçiniz"}</option>
                                            {filteredPrisons.map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Prison Address Display */}
                                    {address.receiverAddress && (
                                        <div className="p-4 bg-seal/5 rounded-xl border border-seal/20 animate-in fade-in duration-500">
                                            <label className="text-[10px] font-black text-seal uppercase tracking-wider block mb-1">Kurum Adresi</label>
                                            <p className="text-sm text-ink font-medium leading-relaxed">{address.receiverAddress}</p>
                                        </div>
                                    )}

                                    {/* Prison Note */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-ink-light block text-seal">Alıcıya Not (Opsiyonel)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Örn: Görüş gününde getirilmesini rica ederim..."
                                            value={address.prisonNote}
                                            onChange={(e) => updateAddress({ prisonNote: e.target.value })}
                                            className="w-full bg-white text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all resize-none shadow-sm"
                                        ></textarea>
                                        <p className="text-[10px] text-seal/60 italic px-1 leading-tight">Mektubun üzerine eklenecektir.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Father Name */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-ink-light block">Baba Adı</label>
                                            <input
                                                type="text"
                                                placeholder="Örn: Mehmet"
                                                value={address.fatherName}
                                                onChange={(e) => updateAddress({ fatherName: e.target.value })}
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Ward Number */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-ink-light block">Koğuş No</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Örn: B10"
                                                value={address.wardNumber}
                                                onChange={(e) => updateAddress({ wardNumber: e.target.value })}
                                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-seal/60 italic px-1 leading-tight">Baba adı opsiyoneldir, alıcının daha kolay bulunmasına yardımcı olur.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Delivery Date Info (Dynamic) */}
                        <div className="pt-1 border-t border-paper-dark border-dashed space-y-3">
                            <div className="pl-8 space-y-2">
                                <p className="text-[10px] text-ink-light leading-relaxed font-medium">
                                    <br />
                                    <span className="text-seal font-bold">Hafta içi 16:30'a kadar vereceğiniz sipariş aynı gün yola çıkacaktır.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-paper rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-paper-dark"
                        >
                            <div className="p-4 sm:p-6 border-b border-paper-dark flex justify-between items-center bg-paper-light">
                                <h3 className="font-playfair text-xl font-bold text-wood-dark flex items-center gap-2">
                                    <BookOpen size={20} className="text-seal" />
                                    Kayıtlı Adreslerim
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-ink-light hover:text-ink transition-colors p-1 bg-paper border border-paper-dark rounded-full shadow-sm hover:shadow-md">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                                {isLoadingAddresses ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-ink-light gap-3">
                                        <Loader2 size={24} className="animate-spin text-seal" />
                                        <p className="text-sm font-medium">Adresleriniz yükleniyor...</p>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-paper-dark/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-paper-dark/50">
                                            <BookOpen size={24} className="text-ink-light/50" />
                                        </div>
                                        <p className="text-ink-light text-sm font-medium">Henüz kayıtlı adresiniz bulunmuyor.</p>
                                        <p className="text-xs text-ink-light/70 mt-1">Adreslerinizi Profil &gt; Adresler sekmesinden ekleyebilirsiniz.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map(addr => (
                                            <button
                                                key={addr.id}
                                                onClick={() => handleSelectAddress(addr)}
                                                className="w-full text-left p-4 rounded-xl border border-paper-dark hover:border-seal hover:shadow-md transition-all group bg-white shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="bg-paper-light text-wood p-2.5 rounded-xl border border-paper-dark group-hover:bg-seal/10 group-hover:text-seal group-hover:border-seal/30 transition-colors">
                                                        {getIcon(addr.title)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-wood-dark text-sm sm:text-base capitalize">{addr.title}</h4>
                                                        <p className="text-xs text-ink-light font-medium">{addr.name}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-ink-light/90 line-clamp-2 mt-2 font-medium leading-relaxed bg-paper-light p-2 rounded-lg border border-paper-dark/50">{addr.addressText}</p>
                                                <div className="flex justify-between items-center mt-2 px-1">
                                                    <p className="text-[10px] text-ink-light/70 font-semibold uppercase tracking-wider">{addr.city}</p>
                                                    {addr.phone && <p className="text-[10px] text-ink-light/70 font-semibold tracking-wider flex items-center gap-1"><Phone size={10} /> {addr.phone}</p>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
