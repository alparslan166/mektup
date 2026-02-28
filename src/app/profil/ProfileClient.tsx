"use client";

import React, { useState } from "react";
import { User, Settings, Package, Heart, MapPin, Save, Key, Loader2, Edit2, ShieldCheck, LogOut, Copy, Share2 } from "lucide-react";
import { updateProfile, updatePassword } from "@/app/actions/userActions";
import { redeemReferralCode } from "@/app/actions/referralActions";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

interface ProfileClientProps {
    session: any;
    referralCode: string;
    referredById: string | null;
    stats: {
        letters: number;
        addresses: number;
    };
}

export default function ProfileClient({ session, referralCode, referredById, stats }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [referralInput, setReferralInput] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);

    const [profileData, setProfileData] = useState({
        name: session.user?.name || "",
        email: session.user?.email || "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        const res = await updateProfile(profileData);
        setIsUpdatingProfile(false);
        if (res.success) {
            toast.success("Profil bilgileriniz güncellendi.");
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Yeni şifreler eşleşmiyor.");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Şifre en az 6 karakter olmalıdır.");
        }

        setIsUpdatingPassword(true);
        const res = await updatePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
        });
        setIsUpdatingPassword(false);

        if (res.success) {
            toast.success("Şifreniz başarıyla değiştirildi.");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-paper-dark">
            {/* Cover / Header */}
            <div className="h-32 bg-seal/10 relative">
                <div className="absolute -bottom-16 left-8">
                    <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg border border-paper-dark">
                        <div className="w-full h-full rounded-xl bg-paper-dark flex items-center justify-center text-wood">
                            {session.user?.image ? (
                                <img src={session.user.image} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <User size={64} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 pb-8 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-playfair font-bold text-ink">{session.user?.name || "Kullanıcı"}</h1>
                        <p className="text-ink-light font-medium">{session.user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab(activeTab === "overview" ? "settings" : "overview")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm ${activeTab === "settings"
                                ? "bg-seal text-white"
                                : "bg-paper-dark text-wood hover:bg-paper border border-wood/10"
                                }`}
                        >
                            <Settings size={18} className={activeTab === "settings" ? "animate-spin-slow" : ""} />
                            <span className="hidden sm:inline">{activeTab === "settings" ? "Profilim" : "Ayarlar"}</span>
                        </button>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-ink/5 text-ink hover:bg-seal hover:text-white transition-all duration-300 shadow-sm border border-transparent hover:border-seal"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Çıkış Yap</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "overview" ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                <a href="/gonderilenler" className="bg-paper-light p-6 rounded-2xl border border-paper-dark text-center space-y-2 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-seal/10 rounded-full flex items-center justify-center mx-auto text-seal group-hover:scale-110 transition-transform">
                                        <Package size={24} />
                                    </div>
                                    <div className="text-2xl font-black text-ink">{stats.letters}</div>
                                    <div className="text-xs font-bold text-ink-light uppercase tracking-widest">Siparişlerim</div>
                                    <p className="text-[10px] text-seal font-bold">Görüntüle &rarr;</p>
                                </a>
                                <a href="/adresler" className="bg-paper-light p-6 rounded-2xl border border-paper-dark text-center space-y-2 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 bg-seal/10 rounded-full flex items-center justify-center mx-auto text-seal group-hover:scale-110 transition-transform">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="text-2xl font-black text-ink">{stats.addresses}</div>
                                    <div className="text-xs font-bold text-ink-light uppercase tracking-widest">Adreslerim</div>
                                    <p className="text-[10px] text-seal font-bold">Yönet &rarr;</p>
                                </a>
                            </div>

                            {/* Referral Section */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-wood/5 to-wood/10 rounded-2xl border border-wood/20">
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-wood shadow-sm">
                                                <Share2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-ink">Referans Kodunuz</h3>
                                                <p className="text-xs text-ink-light font-medium">Bu kodu arkadaşlarınızla paylaşarak kredi kazanabilirsiniz!</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <div className="flex-1 md:w-32 bg-white border border-wood/20 px-4 py-2 rounded-lg font-mono text-sm font-bold text-ink text-center select-all">
                                                {referralCode}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(referralCode);
                                                    toast.success("Referans kodu kopyalandı!");
                                                }}
                                                className="p-2.5 bg-wood text-white rounded-lg hover:bg-wood-dark transition-colors shadow-sm"
                                                title="Kodu Kopyala"
                                            >
                                                <Copy size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {!referredById && (
                                        <div className="pt-6 border-t border-wood/10">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-bold text-ink text-sm">Davet Kodu Gir</h4>
                                                    <p className="text-[10px] text-ink-light font-medium">Sizi davet eden arkadaşınızın kodunu girerek hediye kredi kazanın.</p>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <input
                                                        type="text"
                                                        placeholder="Örn: AB12CD34"
                                                        value={referralInput}
                                                        onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                                                        className="flex-1 bg-white border border-wood/20 px-4 py-2 rounded-lg text-sm outline-none focus:border-wood transition-all font-mono"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            if (!referralInput) return;
                                                            setIsRedeeming(true);
                                                            const res = await redeemReferralCode(referralInput);
                                                            setIsRedeeming(false);
                                                            if (res.success) {
                                                                toast.success(res.message || "Ödül hesabınıza yüklendi!");
                                                                setReferralInput("");
                                                            } else {
                                                                toast.error(res.error || "Kod geçersiz.");
                                                            }
                                                        }}
                                                        disabled={isRedeeming || !referralInput}
                                                        className="px-6 py-2 bg-seal text-white rounded-lg font-bold text-sm hover:bg-seal-hover transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {isRedeeming ? <Loader2 size={16} className="animate-spin" /> : "Giriş Yap"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-12 p-8 bg-paper-dark/30 rounded-3xl border border-dashed border-paper-dark relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-inner flex items-center justify-center text-seal shrink-0 border border-wood/10">
                                        <ShieldCheck size={40} className="group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-playfair text-xl font-bold text-ink mb-1">Hesabınız Güvende</h3>
                                        <p className="text-sm text-ink-light font-medium leading-relaxed max-w-md">
                                            Mektuplarınız ve kişisel verileriniz en yüksek güvenlik standartlarıyla korunmaktadır. Hiçbir veriniz üçüncü şahıslarla paylaşılmaz.
                                        </p>
                                    </div>
                                    <a href="/mektup-yaz" className="md:ml-auto bg-seal text-white px-8 py-3 rounded-xl font-bold hover:bg-wood hover:scale-105 transition-all shadow-lg shadow-seal/20">
                                        Mektup Yaz
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-12 space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Profile Settings */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Edit2 size={18} className="text-seal" />
                                        <h3 className="text-lg font-bold text-ink">Profil Bilgileri</h3>
                                    </div>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Ad Soyad</label>
                                            <input
                                                required
                                                value={profileData.name}
                                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">E-Posta</label>
                                            <input
                                                required
                                                type="email"
                                                value={profileData.email}
                                                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <button
                                            disabled={isUpdatingProfile}
                                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                                        >
                                            {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            <span>Değişiklikleri Kaydet</span>
                                        </button>
                                    </form>
                                </div>

                                {/* Password Settings */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Key size={18} className="text-seal" />
                                        <h3 className="text-lg font-bold text-ink">Şifre Değiştir</h3>
                                    </div>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Mevcut Şifre</label>
                                            <input
                                                required
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Yeni Şifre</label>
                                            <input
                                                required
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-ink-light uppercase ml-1">Yeni Şifre (Tekrar)</label>
                                            <input
                                                required
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full bg-paper-light border border-paper-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-seal/30 focus:border-seal outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            disabled={isUpdatingPassword}
                                            className="w-full bg-wood text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-wood-dark transition-all disabled:opacity-50"
                                        >
                                            {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                            <span>Şifreyi Güncelle</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Add these to globals.css if not already present
// .animate-spin-slow { animation: spin 8s linear infinite; }
