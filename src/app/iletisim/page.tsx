"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Clock, Send, CheckCircle2 } from "lucide-react";
import { sendContactEmail } from "@/app/actions/emailActions";
import { getContactSettings, updateContactSetting } from "@/app/actions/settingsActions";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Pencil, X, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IletisimPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [contactSettings, setContactSettings] = useState({
        email: "mektuplass@gmail.com",
        phone: "0 (850) 305 81 35",
        address: "Nostalji Mah. Kalem Sk. No: 1, Kadıköy / İstanbul",
        whatsapp: "+908503058135"
    });

    // Edit Modal State
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        key: 'email' | 'phone' | 'address' | 'whatsapp';
        value: string;
        isSubmitting: boolean;
    }>({
        isOpen: false,
        key: 'email',
        value: '',
        isSubmitting: false
    });

    React.useEffect(() => {
        getContactSettings().then(res => {
            if (res.success && res.data) {
                setContactSettings(res.data);
            }
        });
    }, []);

    const handleEditSetting = (key: 'email' | 'phone' | 'address' | 'whatsapp', currentValue: string) => {
        setEditModal({
            isOpen: true,
            key,
            value: currentValue,
            isSubmitting: false
        });
    };

    const saveSetting = async () => {
        setEditModal(prev => ({ ...prev, isSubmitting: true }));
        const res = await updateContactSetting(editModal.key, editModal.value);

        if (res.success) {
            setContactSettings(prev => ({ ...prev, [editModal.key]: editModal.value }));
            toast.success("Ayar güncellendi.");
            setEditModal(prev => ({ ...prev, isOpen: false }));
        } else {
            toast.error(res.error || "Güncelleme başarısız.");
        }
        setEditModal(prev => ({ ...prev, isSubmitting: false }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await sendContactEmail(formData);
            if (result.success) {
                setIsSuccess(true);
                setFormData({ name: "", email: "", message: "" });
            } else {
                toast.error("Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-wood-dark mb-4">
                        İletişim
                    </h1>
                    <p className="text-ink-light text-lg">
                        Mektuplarınız, kargo süreçleri veya aklınıza takılan herhangi bir soru için bize dilediğiniz zaman ulaşabilirsiniz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <Mail size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-ink">E-Posta</h3>
                                    {isAdmin && (
                                        <button onClick={() => handleEditSetting('email', contactSettings.email)} className="p-1 hover:bg-paper-dark rounded text-seal transition-colors">
                                            <Pencil size={12} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-ink-light text-sm mb-2">Her türlü sorunuz için bize yazabilirsiniz.</p>
                                <a href={`mailto:${contactSettings.email}`} className="text-seal font-medium hover:underline">{contactSettings.email}</a>
                            </div>
                        </div>

                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <Phone size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-ink">Telefon / WhatsApp</h3>
                                    {isAdmin && (
                                        <button onClick={() => handleEditSetting('phone', contactSettings.phone)} className="p-1 hover:bg-paper-dark rounded text-seal transition-colors">
                                            <Pencil size={12} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-ink-light text-sm mb-2">Hızlı iletişim için çalışma saatlerimiz içinde arayabilirsiniz.</p>
                                <div className="flex flex-col">
                                    <a href={`tel:${contactSettings.phone.replace(/\s+/g, '')}`} className="text-seal font-medium hover:underline">
                                        {contactSettings.phone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-paper-light border border-paper-dark p-6 rounded-xl flex items-start gap-4 hover:border-wood transition-colors group">
                            <div className="bg-paper-dark p-3 rounded-full text-wood group-hover:text-seal transition-colors">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-ink">Ofis Adresi</h3>
                                    {isAdmin && (
                                        <button onClick={() => handleEditSetting('address', contactSettings.address)} className="p-1 hover:bg-paper-dark rounded text-seal transition-colors">
                                            <Pencil size={12} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-ink-light text-sm leading-relaxed whitespace-pre-line">
                                    {contactSettings.address}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-ink-light/80 text-sm italic mt-8">
                            <Clock size={16} /> Çalışma Saatleri: Hafta içi 09:00 - 18:00
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-paper-dark/20 border border-wood/20 p-8 rounded-xl shadow-sm h-full flex flex-col justify-center">
                        {isSuccess ? (
                            <div className="text-center py-8 animate-in zoom-in duration-300">
                                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-playfair text-2xl font-bold text-wood-dark mb-2">Mesajınız Alındı!</h3>
                                <p className="text-ink-light mb-6">En kısa sürede size geri dönüş yapacağız. Teşekkür ederiz.</p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-seal font-semibold hover:underline"
                                >
                                    Yeni bir mesaj gönder
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-playfair text-2xl font-bold text-wood-dark mb-6">Bize Mesaj Gönderin</h3>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="text-sm font-semibold text-ink-light block mb-1">Adınız Soyadınız</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ad Soyad"
                                            className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-ink-light block mb-1">E-Posta Adresiniz</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="mail@ornek.com"
                                            className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-ink-light block mb-1">Mesajınız</label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Size nasıl yardımcı olabiliriz?"
                                            className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-seal hover:bg-seal-hover disabled:bg-seal/50 text-paper py-3 rounded-md font-bold shadow-md transition-all mt-4 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
                                                Gönderiliyor...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Mesajı Gönder
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Admin Edit Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-paper rounded-2xl shadow-2xl overflow-hidden border border-wood/20"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-playfair text-xl font-bold text-wood-dark capitalize">
                                        {editModal.key === 'address' ? 'Adres' :
                                            editModal.key === 'email' ? 'E-posta' :
                                                editModal.key === 'phone' ? 'Telefon' : 'WhatsApp'} Düzenle
                                    </h3>
                                    <button
                                        onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                                        className="p-2 hover:bg-paper-dark rounded-full transition-colors text-ink-light"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-ink-light uppercase tracking-wider mb-2 block">
                                            Yeni Değer
                                        </label>
                                        {editModal.key === 'address' ? (
                                            <textarea
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 text-ink focus:border-seal focus:ring-1 focus:ring-seal outline-none transition-all resize-none font-medium text-sm"
                                                rows={4}
                                                value={editModal.value}
                                                onChange={(e) => setEditModal(prev => ({ ...prev, value: e.target.value }))}
                                                placeholder="Yeni adresi girin..."
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 text-ink focus:border-seal focus:ring-1 focus:ring-seal outline-none transition-all font-medium text-sm"
                                                value={editModal.value}
                                                onChange={(e) => setEditModal(prev => ({ ...prev, value: e.target.value }))}
                                                placeholder={`Yeni ${editModal.key} değerini girin...`}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-ink-light hover:bg-paper-dark transition-all"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        onClick={saveSetting}
                                        disabled={editModal.isSubmitting}
                                        className="flex-1 bg-seal hover:bg-seal-hover text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {editModal.isSubmitting ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Save size={20} />
                                        )}
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
