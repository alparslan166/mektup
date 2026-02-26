"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Phone, User, Trash2, Edit2, Loader2, Home, Briefcase, Map, ArrowLeft, BookOpen, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import citiesData from "../../../sehirler.json";

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

export default function AdreslerPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        name: "",
        city: "",
        addressText: "",
        phone: "",
        isPrison: false,
        prisonName: "",
        fatherName: "",
        wardNumber: "",
        prisonNote: ""
    });

    // Prison selection states
    const [availableCities] = useState<string[]>(Object.values(citiesData).sort((a: any, b: any) => a.localeCompare(b, 'tr-TR')) as string[]);
    const [selectedCity, setSelectedCity] = useState("");
    const [filteredPrisons, setFilteredPrisons] = useState<any[]>([]);
    const [isLoadingPrisons, setIsLoadingPrisons] = useState(false);

    // Prison data fetching
    useEffect(() => {
        if (formData.isPrison && selectedCity) {
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
    }, [selectedCity, formData.isPrison]);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/addresses");
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            toast.error("Adresler yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const loadingToast = toast.loading(editingId ? "Güncelleniyor..." : "Kaydediliyor...");

        try {
            const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingId ? "Adres güncellendi." : "Adres başarıyla eklendi.", { id: loadingToast });
                setFormData({
                    title: "", name: "", city: "", addressText: "", phone: "",
                    isPrison: false, prisonName: "", fatherName: "", wardNumber: "", prisonNote: ""
                });
                setSelectedCity("");
                setShowForm(false);
                setEditingId(null);
                fetchAddresses();
            } else {
                const data = await res.json();
                toast.error(data.error || "Bir hata oluştu.", { id: loadingToast });
            }
        } catch (error) {
            toast.error("İşlem başarısız oldu.", { id: loadingToast });
        } finally {
            setIsSaving(true);
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

        const loadingToast = toast.loading("Siliniyor...");
        try {
            const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Adres silindi.", { id: loadingToast });
                fetchAddresses();
            } else {
                toast.error("Silme işlemi başarısız.", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Bir hata oluştu.", { id: loadingToast });
        }
    };

    const handleEdit = (address: Address) => {
        setFormData({
            title: address.title,
            name: address.name,
            city: address.city,
            addressText: address.addressText,
            phone: address.phone || "",
            isPrison: address.isPrison || false,
            prisonName: address.prisonName || "",
            fatherName: address.fatherName || "",
            wardNumber: address.wardNumber || "",
            prisonNote: address.prisonNote || ""
        });
        setSelectedCity(address.city);
        setEditingId(address.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("ev")) return <Home size={20} />;
        if (t.includes("iş") || t.includes("ofis")) return <Briefcase size={20} />;
        return <MapPin size={20} />;
    };

    return (
        <div className="flex-1 container mx-auto px-6 max-w-5xl py-12 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-seal hover:text-seal transition-colors uppercase tracking-widest mt-2 md:mt-0">
                        <ArrowLeft size={16} /> Panoya Dön
                    </Link>
                    <h1 className="font-playfair text-4xl font-bold text-wood-dark flex items-center gap-3 mb-2">
                        <BookOpen className="text-seal" size={36} />
                        Adres Defteri
                    </h1>
                    <p className="text-ink text-lg mb-4 italic">Mektuplarınız için kayıtlı alıcı adreslerini yönetin.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-seal text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-seal-hover transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Yeni Adres Ekle
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-paper p-8 rounded-2xl shadow-xl border border-wood/10 mb-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-seal"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-playfair text-2xl font-bold text-wood-dark flex items-center gap-2">
                                {editingId ? <Edit2 size={24} className="text-seal" /> : <Plus size={24} className="text-seal" />}
                                {editingId ? "Adresi Düzenle" : "Yeni Alıcı Adresi"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPrison: !formData.isPrison })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all border ${formData.isPrison
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                    : "bg-white text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500"
                                    }`}
                            >
                                <Package size={14} />
                                CEZAEVİ {formData.isPrison ? "AÇIK" : "KAPALI"}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-ink-light uppercase ml-1">Adres Başlığı (Örn: Ev, İş)</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                    placeholder="Ev Adresim"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-ink-light uppercase ml-1">Alıcı Ad Soyad</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                    placeholder="Ahmet Yılmaz"
                                />
                            </div>
                            <AnimatePresence mode="wait">
                                {formData.isPrison ? (
                                    <motion.div
                                        key="prison-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Şehir Seçin</label>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => {
                                                    setSelectedCity(e.target.value);
                                                    setFormData({ ...formData, city: e.target.value, prisonName: "", addressText: "" });
                                                }}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                            >
                                                <option value="">Şehir Seçiniz...</option>
                                                {availableCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Cezaevi Seçin</label>
                                            <select
                                                disabled={!selectedCity || isLoadingPrisons}
                                                value={formData.prisonName}
                                                onChange={(e) => {
                                                    const prison = filteredPrisons.find(p => p.name === e.target.value);
                                                    setFormData({ ...formData, prisonName: e.target.value, addressText: prison?.address || "" });
                                                }}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all disabled:opacity-50"
                                            >
                                                <option value="">{selectedCity ? "Cezaevi Seçiniz..." : "Önce Şehir Seçiniz"}</option>
                                                {filteredPrisons.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Baba Adı (Opsiyonel)</label>
                                            <input
                                                value={formData.fatherName}
                                                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="Mehmet"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Koğuş No</label>
                                            <input
                                                required={formData.isPrison}
                                                value={formData.wardNumber}
                                                onChange={e => setFormData({ ...formData, wardNumber: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="B-12"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Alıcıya Not (Opsiyonel)</label>
                                            <textarea
                                                rows={2}
                                                value={formData.prisonNote}
                                                onChange={e => setFormData({ ...formData, prisonNote: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="Mektubun üzerine eklenecek not..."
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="standard-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Şehir</label>
                                            <input
                                                required={!formData.isPrison}
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="İstanbul"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Telefon (Opsiyonel)</label>
                                            <input
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="05..."
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Detaylı Adres</label>
                                            <textarea
                                                required={!formData.isPrison}
                                                rows={3}
                                                value={formData.addressText}
                                                onChange={e => setFormData({ ...formData, addressText: e.target.value })}
                                                className="w-full bg-paper-dark/30 border border-wood/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all"
                                                placeholder="Mahalle, Sokak, No, Daire..."
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData({
                                            title: "", name: "", city: "", addressText: "", phone: "",
                                            isPrison: false, prisonName: "", fatherName: "", wardNumber: "", prisonNote: ""
                                        });
                                        setSelectedCity("");
                                    }}
                                    className="px-6 py-3 rounded-xl font-bold text-ink hover:bg-paper-dark transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-wood-dark text-paper px-8 py-3 rounded-xl font-bold hover:bg-wood transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {editingId ? "Güncelle" : "Adresi Kaydet"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-seal mb-4" />
                    <p className="italic text-ink-light">Adresler yükleniyor...</p>
                </div>
            ) : addresses.length === 0 ? (
                <div className="bg-paper/50 backdrop-blur-sm border-2 border-dashed border-wood/20 rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-paper-dark/50 rounded-full flex items-center justify-center mx-auto mb-6 text-wood-dark/40">
                        <Map size={32} />
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-wood-dark mb-2">Kayıtlı Adresiniz Yok</h3>
                    <p className="text-ink-light max-w-md mx-auto mb-8 italic">
                        Henüz bir alıcı adresi kaydetmemişsiniz. Yeni bir adres ekleyerek mektup gönderimlerini hızlandırabilirsiniz.
                    </p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-wood-dark text-paper px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                        >
                            İlk Adresini Ekle
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <motion.div
                            layout
                            key={addr.id}
                            className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-paper-dark hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-paper-dark rounded-xl flex items-center justify-center text-wood-dark group-hover:bg-wood-dark group-hover:text-paper transition-all">
                                        {getIcon(addr.title)}
                                    </div>
                                    <h3 className="font-bold text-wood-dark text-lg capitalize">{addr.title}</h3>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(addr)}
                                        className="p-2 text-ink-light hover:text-seal transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr.id)}
                                        className="p-2 text-ink-light hover:text-red-500 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-ink">
                                    <User size={14} className="text-wood-dark/50" />
                                    <span className="font-medium">{addr.name}</span>
                                </div>
                                <div className="flex items-start gap-2 text-ink-light text-sm leading-relaxed">
                                    <MapPin size={14} className="text-wood-dark/50 mt-1 flex-shrink-0" />
                                    <div>
                                        {addr.isPrison && (
                                            <p className="font-bold text-blue-600 text-xs mb-1 flex items-center gap-1">
                                                <Package size={12} /> {addr.prisonName}
                                            </p>
                                        )}
                                        <p className={`${addr.isPrison ? 'text-xs' : ''}`}>{addr.addressText} <br /> <span className="font-bold text-ink uppercase">{addr.city}</span></p>
                                        {addr.isPrison && (
                                            <div className="mt-1 flex gap-2 text-[10px] font-black uppercase text-blue-800/60">
                                                {addr.wardNumber && <span>Koğuş: {addr.wardNumber}</span>}
                                                {addr.fatherName && <span>Baba: {addr.fatherName}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {addr.phone && (
                                    <div className="flex items-center gap-2 text-ink-light text-sm">
                                        <Phone size={14} className="text-wood-dark/50" />
                                        <span>{addr.phone}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
